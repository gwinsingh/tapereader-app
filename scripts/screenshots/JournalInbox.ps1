<#
  Inbox helpers for Journal-Screenshots.ps1 - the Bookmap / TradingView side of the
  pipeline. Dot-sourced by the main script.

  Everything here is plain PowerShell with no Windows-only types (no OCR, no
  System.Drawing), so it runs under Windows PowerShell 5.1 AND pwsh on any OS, and
  Test-JournalInbox.ps1 can exercise it without a Windows desktop. Keep it that way:
  anything that needs a screen or OCR belongs in the main script.

  What arrives in an inbox folder (one per app, both inside the synced Drive folder):
    * macOS screenshots       "Screenshot 2026-09-29 at 9.52.47 AM.png"  (Mac clock)
    * TradingView downloads   "NVDA_2026-09-29_09-52-47.png"             (clock of the machine TradingView ran on)
    * Bookmap order exports   File >> Export >> Export orders as plain text; first line
                              "!BOOKMAP_FORMAT_V1", timestamps in UTC.

  Companion shots are named after the DAS step they belong to:
      2026-09-29 NVDA 4.1 Bookmap 09.52.47.png          step 4's first companion
      2026-09-29 NVDA 4.2 TradingView AddSize 09.53.10.png
      2026-09-29 NVDA 0.1 Bookmap 09.12.03.png          before the first DAS shot (SOD read)
      2026-09-29 NVDA EOD Bookmap 16.21.40.png          after the close -> EOD folder
  web/lib/trade-journal/screenshot-names.ts reads the step, the app word and the time.
#>

# macOS 14+ puts a narrow no-break space (U+202F) before AM/PM; NBSP shows up too.
$script:ODD_SPACES = '[' + [char]0x202F + [char]0x00A0 + ']'

# Words the app reads as the source of a companion shot (screenshot-names.ts).
$script:COMPANION_APPS = 'Bookmap', 'TradingView'

# Reads what a raw inbox file name says about itself.
# Returns $null when the name is not one we recognise; otherwise an object with
#   App       'TradingView' when the name proves it, else $null (the inbox decides)
#   Captured  [datetime] as written in the name (the capturing machine's clock)
#   Symbol    ticker when the name carries one (TradingView), else $null
function Get-InboxShotInfo([string]$name) {
    $n = $name -replace $script:ODD_SPACES, ' '
    # macOS, 12-hour locale: "Screenshot 2026-09-29 at 9.52.47 AM.png" (older: "Screen Shot"),
    # optionally " (2)" / " 2" when two land in the same second.
    if ($n -match '^Screen ?[Ss]hot (\d{4}-\d{2}-\d{2}) at (\d{1,2})\.(\d{2})\.(\d{2}) ?([AaPp][Mm])(?: ?\(?\d+\)?)?\.(png|jpe?g)$') {
        $h = [int]$Matches[2] % 12
        if ($Matches[5].ToUpper() -eq 'PM') { $h += 12 }
        $t = [datetime]::ParseExact($Matches[1], 'yyyy-MM-dd', $null).AddHours($h).AddMinutes([int]$Matches[3]).AddSeconds([int]$Matches[4])
        return [pscustomobject]@{ App = $null; Captured = $t; Symbol = $null }
    }
    # macOS, 24-hour locale: "Screenshot 2026-09-29 at 14.52.47.png"
    if ($n -match '^Screen ?[Ss]hot (\d{4}-\d{2}-\d{2}) at (\d{2})\.(\d{2})\.(\d{2})(?: ?\(?\d+\)?)?\.(png|jpe?g)$') {
        $t = [datetime]::ParseExact("$($Matches[1]) $($Matches[2]):$($Matches[3]):$($Matches[4])", 'yyyy-MM-dd HH:mm:ss', $null)
        return [pscustomobject]@{ App = $null; Captured = $t; Symbol = $null }
    }
    # TradingView "Download image": TICKER_YYYY-MM-DD_HH-MM-SS.png - no exchange prefix, but
    # tolerate one ("NASDAQ_NVDA_..."); browsers add " (1)" on a same-second clash.
    # Case-sensitive: an upper-case ticker is part of what makes it TradingView's name.
    if ($n -cmatch '^(?:[A-Z]+_)?([A-Z0-9.!]+)_(\d{4}-\d{2}-\d{2})_(\d{2})-(\d{2})-(\d{2})(?: ?\(\d+\))?\.png$') {
        $t = [datetime]::ParseExact("$($Matches[2]) $($Matches[3]):$($Matches[4]):$($Matches[5])", 'yyyy-MM-dd HH:mm:ss', $null)
        return [pscustomobject]@{ App = 'TradingView'; Captured = $t; Symbol = ($Matches[1] -replace '!', '') }
    }
    $null
}

# ---------------------------------------------------------------- Bookmap orders
# Bookmap KB "Appendix IV. Orders Format". One event per line, times in UTC:
#   S,<date>,<time>,<subsec>,<id>,<alias>,<1=buy|0=sell>,<limit>[,<stop>,<triggered>],<size>
#   U,<date>,<time>,<subsec>,<id>,<limit>[,<stop>,<triggered>],<size>
#   C,<date>,<time>,<subsec>,<id>
#   E,<date>,<time>,<subsec>,<id>,<price>,<size>
#   F,<date>,<time>,<subsec>,<id>
# The documented example omits stop/triggered, so size is read from the LAST field.

function Test-BookmapOrders([string]$firstLine) { $firstLine -match '^\s*!BOOKMAP_FORMAT_V\d' }

function Get-EasternTimeZone {
    foreach ($id in 'Eastern Standard Time', 'America/New_York') {
        try { return [TimeZoneInfo]::FindSystemTimeZoneById($id) } catch { }
    }
    throw 'no US Eastern time zone on this machine'
}

# "NVDA@DXFEED" -> NVDA; "ESU8.CME@RITHMIC" -> ESU8; keeps share classes like BRK.B.
function ConvertFrom-BookmapAlias([string]$alias) {
    $s = ($alias -split '@')[0].Trim().ToUpper()
    $s -replace '\.(US|NASDAQ|NYSE|ARCA|AMEX|BATS|CME|CBOT|NYMEX|COMEX|GLOBEX)$', ''
}

# Parses a Bookmap export into the same row shape Read-DasLog produces
# (Event, BS, Sym, Qty, Px, T in ET), so Get-DasActions labels Bookmap fills exactly
# like DAS ones: S -> Accept, U -> Replaced, C -> Canceled, E -> Execute.
function Read-BookmapOrders([string[]]$lines, [TimeZoneInfo]$tz) {
    if (-not $tz) { $tz = Get-EasternTimeZone }
    $orders = @{}
    $inv = [Globalization.CultureInfo]::InvariantCulture
    foreach ($line in $lines) {
        $l = $line.Trim()
        if (-not $l -or $l.StartsWith('!') -or $l.StartsWith('#')) { continue }
        $f = $l -split ','
        if ($f.Count -lt 5) { continue }
        # One bad line must not sink the plan: archived exports are re-read on every run.
        try {
            $utc = [datetime]::ParseExact("$($f[1])$($f[2].PadLeft(6, '0'))", 'yyyyMMddHHmmss', $inv)
            $utc = [datetime]::SpecifyKind($utc.AddSeconds([double]::Parse($f[3], $inv)), 'Utc')
            $t = [TimeZoneInfo]::ConvertTimeFromUtc($utc, $tz)
        }
        catch { Write-Warning "Bookmap export: skipped unreadable line '$l'"; continue }
        $id = $f[4]
        try {
        switch ($f[0]) {
            'S' {
                $px = Get-BookmapPrice $f 7
                $orders[$id] = @{ Sym = (ConvertFrom-BookmapAlias $f[5]); BS = $(if ($f[6] -eq '1') { 'Buy' } else { 'Sell' }); Px = $px }
                [pscustomobject]@{ Event = 'Accept'; BS = $orders[$id].BS; Sym = $orders[$id].Sym; Qty = [int][double]::Parse($f[-1], $inv); Px = $px; T = $t; Id = $id }
            }
            'U' {
                if (-not $orders.ContainsKey($id)) { continue }
                $px = Get-BookmapPrice $f 5
                $orders[$id].Px = $px
                [pscustomobject]@{ Event = 'Replaced'; BS = $orders[$id].BS; Sym = $orders[$id].Sym; Qty = [int][double]::Parse($f[-1], $inv); Px = $px; T = $t; Id = $id }
            }
            'C' {
                if (-not $orders.ContainsKey($id)) { continue }
                [pscustomobject]@{ Event = 'Canceled'; BS = $orders[$id].BS; Sym = $orders[$id].Sym; Qty = 0; Px = $orders[$id].Px; T = $t; Id = $id }
            }
            'E' {
                if (-not $orders.ContainsKey($id)) { continue }
                [pscustomobject]@{ Event = 'Execute'; BS = $orders[$id].BS; Sym = $orders[$id].Sym; Qty = [int][double]::Parse($f[6], $inv); Px = [double]::Parse($f[5], $inv); T = $t; Id = $id }
            }
        }
        }
        catch { Write-Warning "Bookmap export: skipped unreadable line '$l'" }
    }
}

# The same order event can arrive in more than one export (a mid-day export and one at
# the close, or a re-export of an archived day); counting it twice would turn one buy into
# an entry plus an AddSize. Keeps the first of each (order id, event, time, price, size).
function Select-UniqueBookmapRows($rows) {
    $seen = @{}
    foreach ($r in @($rows | Sort-Object T)) {
        $k = "$($r.Id)|$($r.Event)|$($r.T.Ticks)|$($r.Px)|$($r.Qty)"
        if ($seen[$k]) { continue }
        $seen[$k] = $true
        $r
    }
}

# Limit price at field $i; a pure stop order has no usable limit (NaN), so use the stop
# price that follows it when the line carries one.
function Get-BookmapPrice($f, [int]$i) {
    $inv = [Globalization.CultureInfo]::InvariantCulture
    $px = [double]::NaN
    [void][double]::TryParse($f[$i], [Globalization.NumberStyles]::Float, $inv, [ref]$px)
    if (([double]::IsNaN($px) -or $px -le 0) -and $f.Count -ge $i + 4) {
        [void][double]::TryParse($f[$i + 1], [Globalization.NumberStyles]::Float, $inv, [ref]$px)
    }
    $px
}

# ---------------------------------------------------------------- naming
# The latest DAS event for $sym at or before $t (within $win seconds), as Get-DasActions
# emits them; $null when there is none. Mirrors how DAS shots pick their action.
function Find-ActionBefore($actions, [string]$sym, [datetime]$t, [int]$win) {
    @($actions | Where-Object { $_.Sym -eq $sym -and $_.T -le $t.AddSeconds(3) -and $_.T -ge $t.AddSeconds(-$win) }) |
        Select-Object -Last 1
}

# Names companion rows (Kind 'companion' / 'companion-eod'). Run AFTER the DAS naming
# pass, because a companion's step is the DAS step of the same symbol most recently
# taken at or before it:
#   $knownSteps  shots already named in earlier runs: objects with Sym, Step, T
#   $usedSubs    "SYM|step" -> highest companion index already on disk, and
#                "SYM|EOD|App|HH.mm.ss" -> highest same-second EOD count
#   $leadSecs    a DAS shot trails the event it records by 3-8 s, so a step starts this
#                long before its screenshot: a Bookmap shot of the fill taken just ahead
#                of the DAS shot still belongs to the new step.
# DAS rows planned in this same run are added to the timeline from their NewName.
function Set-CompanionNames($rows, [string]$day, $knownSteps, [hashtable]$usedSubs, [int]$leadSecs = 8) {
    if (-not $usedSubs) { $usedSubs = @{} }
    $timeline = New-Object System.Collections.Generic.List[object]
    foreach ($s in @($knownSteps)) { if ($s) { $timeline.Add($s) } }
    foreach ($r in @($rows)) {
        if ($r.Kind -eq 'trade' -and $r.NewName -match "^$day ([A-Z][A-Z0-9.]{0,9}) (\d+) ") {
            $timeline.Add([pscustomobject]@{ Sym = $Matches[1]; Step = [int]$Matches[2]; T = [datetime]$r.Created })
        }
    }
    foreach ($r in (@($rows) | Where-Object { $_.Kind -in 'companion', 'companion-eod' } | Sort-Object { [datetime]$_.Created })) {
        if ($r.Include -ne 'Y' -or -not $r.Symbol -or -not $r.App) { $r.NewName = ''; continue }
        $t = [datetime]$r.Created
        $stamp = $t.ToString('HH.mm.ss')
        if ($r.Kind -eq 'companion-eod') {
            # EOD shots have no step to count within; two in the same second get " 2", " 3".
            $k = "$($r.Symbol)|EOD|$($r.App)|$stamp"; $usedSubs[$k] = 1 + [int]$usedSubs[$k]
            $n = if ($usedSubs[$k] -gt 1) { $usedSubs[$k] } else { '' }
            $parts = @($day, $r.Symbol, 'EOD', $r.App, $r.Note, $stamp, $n)
        }
        else {
            $prior = @($timeline | Where-Object { $_.Sym -eq $r.Symbol -and $_.T.AddSeconds(-$leadSecs) -le $t } | Sort-Object T, Step) | Select-Object -Last 1
            $step = if ($prior) { [int]$prior.Step } else { 0 }
            $k = "$($r.Symbol)|$step"; $usedSubs[$k] = 1 + [int]$usedSubs[$k]
            $parts = @($day, $r.Symbol, "$step.$($usedSubs[$k])", $r.App, $r.Action, $r.Note, $stamp)
        }
        # Keep the file's own image type (a Bookmap capture may be .jpg).
        $ext = if ($r.Source -match '\.(png|jpe?g)$') { '.' + $Matches[1].ToLower() } else { '.png' }
        $r.NewName = ((($parts | Where-Object { "$_".Trim() }) -join ' ') -replace '\s+', ' ') + $ext
    }
}

# Steps and companion indexes already used on $day, read from file names in $dirs.
# A step's time is the earlier of the file's creation and modified times: apply keeps the
# capture time as CreationTime, a move/copy keeps LastWriteTime, and an EOD crop has a
# later LastWriteTime - the earlier of the two is the capture in every case.
function Get-ExistingSteps([string]$day, [string[]]$dirs) {
    $steps = New-Object System.Collections.Generic.List[object]
    $subs = @{}
    foreach ($d in @($dirs | Where-Object { $_ -and (Test-Path -LiteralPath $_) })) {
        foreach ($f in Get-ChildItem -LiteralPath $d -File -Filter "$day *") {
            if ($f.Name -match "^$day ([A-Z][A-Z0-9.]{0,9}) EOD (Bookmap|TradingView) .*?(\d{2}\.\d{2}\.\d{2})(?: (\d+))?\.[a-z]+$") {
                $k = "$($Matches[1])|EOD|$($Matches[2])|$($Matches[3])"
                $n = if ($Matches[4]) { [int]$Matches[4] } else { 1 }
                if ($n -gt [int]$subs[$k]) { $subs[$k] = $n }
            }
            elseif ($f.Name -match "^$day ([A-Z][A-Z0-9.]{0,9}) (\d+)\.(\d+) ") {
                $k = "$($Matches[1])|$([int]$Matches[2])"
                if ([int]$Matches[3] -gt [int]$subs[$k]) { $subs[$k] = [int]$Matches[3] }
            }
            elseif ($f.Name -match "^$day ([A-Z][A-Z0-9.]{0,9}) (\d+) ") {
                $steps.Add([pscustomobject]@{ Sym = $Matches[1]; Step = [int]$Matches[2]; T = $(if ($f.CreationTime -lt $f.LastWriteTime) { $f.CreationTime } else { $f.LastWriteTime }) })
            }
        }
    }
    [pscustomobject]@{ Steps = $steps.ToArray(); Subs = $subs }   # an array: @(<generic List>) throws on pwsh 7.6
}

# Archive name for a Bookmap export: the ET date range it covers, with "-2", "-3" when
# $taken (names already archived or claimed in this plan) has it - a second export of
# the same day is kept, not refused.
function Get-BookmapArchiveName($rows, $taken) {
    $days = @($rows | ForEach-Object { $_.T.ToString('yyyy-MM-dd') } | Sort-Object -Unique)
    if (-not $days) { return $null }
    $span = if ($days.Count -eq 1) { $days[0] } else { "$($days[0])_$($days[-1])" }
    $name = "$span-bookmap-orders.txt"
    for ($i = 2; $taken -and $taken -contains $name; $i++) { $name = "$span-bookmap-orders-$i.txt" }
    $name
}
