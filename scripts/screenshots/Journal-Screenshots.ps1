<#
.SYNOPSIS
  Names, crops and uploads the day's DAS Trader screenshots to the journal's Drive folders.

.DESCRIPTION
  Two passes, so nothing is touched until a human has looked at the names:

    Plan  (default)  Reads the raw "Screenshot (n).png" files taken on -Date, works out
                     what each one is, and writes <workDir>\<date>.plan.csv. Changes nothing.
    Apply (-Apply)   Re-reads that plan (with any edits made to it), validates EVERY row
                     first, and only then renames, crops EOD shots, and copies them and the
                     day's DAS log to Drive. Every step is logged; -Undo reverses it.

  How a screenshot is identified:
    * Trade shot  - the laptop (primary) screen's left half always shows the focused
                    ticker's DAS charts, whose watermark ("NVDA--1 Minute") is OCR'd with
                    the OCR engine built into Windows. The action (entry, AddSize,
                    RaisedStop, Stopped, AllOut, ...) comes from the DAS event just before
                    the screenshot - they are consistently 3-8 s apart.
    * EOD shot    - the big monitor shows a DAS window with its own title bar
                    ("Dastrader Powered by DASTrader.com"). It is cropped to that window,
                    wherever it sits, and named from the watermark inside it.
    * Anything that can't be identified with confidence is flagged in the Check column
      rather than guessed - e.g. a "FEAR" shot with no DAS event behind it.

  Names follow the convention the journal's Screenshot Review already parses
  (web/lib/trade-journal/google-drive.ts):
      2026-09-24 SOXL 3 AddSize ORB Long Screenshot (1121).png
      2026-09-24 META EOD Screenshot (1139).png          (second one: "EOD 2")

.EXAMPLE
  .\Journal-Screenshots.ps1                          # plan today
  .\Journal-Screenshots.ps1 -Date 2026-09-25,2026-09-28
  .\Journal-Screenshots.ps1 -Date 2026-09-29 -Apply
  .\Journal-Screenshots.ps1 -Date 2026-09-29 -Undo
#>
[CmdletBinding()]
param(
    [string[]]$Date = @((Get-Date).ToString('yyyy-MM-dd')),
    [switch]$Apply,
    [switch]$Undo,
    [switch]$NoBackup,
    [string]$Config = (Join-Path $PSScriptRoot 'config.json')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms
Add-Type -Path (Join-Path $PSScriptRoot 'ShotImage.cs') -ReferencedAssemblies System.Drawing

if (-not (Test-Path $Config)) { throw "No config at $Config - copy config.example.json to config.json and fill in the paths." }
$cfg = Get-Content $Config -Raw | ConvertFrom-Json
$backupOn = [bool]$cfg.backup -and -not $NoBackup
New-Item -ItemType Directory -Force $cfg.workDir | Out-Null

# App convention: token[0] = date, token[1] = symbol, token[2] = "EOD" for EOD shots.
$NAME_RE = '^\d{4}-\d{2}-\d{2} [A-Z][A-Z0-9.]{0,9} .+\.png$'
$PLAN_COLS = 'Include', 'Created', 'Source', 'Size', 'Kind', 'Symbol', 'Action', 'Note', 'Setup', 'Side', 'NewName', 'Crop', 'Evidence', 'Check'

# ---------------------------------------------------------------- screen layout
# A Win+PrtScn image is the whole virtual desktop, so each monitor's rectangle in the
# image is its desktop bounds shifted by the virtual origin.
function Get-Layout {
    $screens = [System.Windows.Forms.Screen]::AllScreens
    $ox = ($screens | ForEach-Object { $_.Bounds.X } | Measure-Object -Minimum).Minimum
    $oy = ($screens | ForEach-Object { $_.Bounds.Y } | Measure-Object -Minimum).Minimum
    $vw = ($screens | ForEach-Object { $_.Bounds.Right } | Measure-Object -Maximum).Maximum - $ox
    $vh = ($screens | ForEach-Object { $_.Bounds.Bottom } | Measure-Object -Maximum).Maximum - $oy
    $toImg = { param($b) New-Object System.Drawing.Rectangle ($b.X - $ox), ($b.Y - $oy), $b.Width, $b.Height }
    $primary = $screens | Where-Object Primary | Select-Object -First 1
    $big = $screens | Where-Object { -not $_.Primary } | Sort-Object { $_.Bounds.Width * $_.Bounds.Height } -Descending | Select-Object -First 1
    if (-not $big) { $big = $primary }
    $p = & $toImg $primary.Bounds
    [pscustomobject]@{
        Width  = $vw; Height = $vh
        Focus  = New-Object System.Drawing.Rectangle $p.X, $p.Y, ([int]($p.Width / 2)), $p.Height   # laptop, left half
        Laptop = $p
        Big    = & $toImg $big.Bounds
    }
}

# ---------------------------------------------------------------- OCR (Windows.Media.Ocr)
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime]
$null = [Windows.Graphics.Imaging.BitmapDecoder, Windows.Foundation, ContentType = WindowsRuntime]
$script:asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
        $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0]
function Wait-Async($op, [Type]$type) {
    $task = $script:asTask.MakeGenericMethod($type).Invoke($null, @($op)); $task.Wait(-1) | Out-Null; $task.Result
}
$script:ocr = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()

# OCR a bitmap; returns one object per text line with its box in the bitmap's pixels.
function Invoke-Ocr([System.Drawing.Bitmap]$bmp) {
    $tmp = Join-Path ([System.IO.Path]::GetTempPath()) ("ocr-" + [guid]::NewGuid() + '.png')
    $bmp.Save($tmp, [System.Drawing.Imaging.ImageFormat]::Png)
    try {
        $file = Wait-Async ([Windows.Storage.StorageFile]::GetFileFromPathAsync($tmp)) ([Windows.Storage.StorageFile])
        $stream = Wait-Async ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
        try {
            $dec = Wait-Async ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
            $sb = Wait-Async ($dec.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
            $res = Wait-Async ($script:ocr.RecognizeAsync($sb)) ([Windows.Media.Ocr.OcrResult])
            foreach ($line in $res.Lines) {
                $words = @($line.Words)
                $x0 = ($words | ForEach-Object { $_.BoundingRect.X } | Measure-Object -Minimum).Minimum
                $y0 = ($words | ForEach-Object { $_.BoundingRect.Y } | Measure-Object -Minimum).Minimum
                $x1 = ($words | ForEach-Object { $_.BoundingRect.X + $_.BoundingRect.Width } | Measure-Object -Maximum).Maximum
                $y1 = ($words | ForEach-Object { $_.BoundingRect.Y + $_.BoundingRect.Height } | Measure-Object -Maximum).Maximum
                [pscustomobject]@{ Text = $line.Text; X = [int]$x0; Y = [int]$y0; W = [int]($x1 - $x0); H = [int]($y1 - $y0) }
            }
        }
        finally { $stream.Dispose() }
    }
    finally { Remove-Item $tmp -ErrorAction SilentlyContinue }
}

# Collapses OCR votes to tickers, most votes first. OCR of the faint watermark drops or
# garbles letters ("NV" for NVDA, "QQQ" for TQQQ, "M.ETA"), never invents them, so a
# reading contained in a longer reading is a partial read of it and its votes move there.
# It also misreads single letters ("EQXL", "TQQO"), so a reading that isn't a symbol
# traded that day but is one letter away from exactly one that was, is that symbol.
function Resolve-Symbols([hashtable]$votes, $known) {
    $v = @{}
    foreach ($k in @($votes.Keys)) {
        $key = if ($k -match '^[A-Z]+\.[A-Z]$') { $k } else { $k -replace '\.', '' }   # keep BRK.B-style classes
        if ($key) { $v[$key] = $votes[$k] + [int]$v[$key] }
    }
    foreach ($a in @($v.Keys | Sort-Object Length)) {
        $b = $v.Keys | Where-Object { $_ -ne $a -and $_.Contains($a) } | Sort-Object Length -Descending | Select-Object -First 1
        if ($b) { $v[$b] += $v[$a]; $v.Remove($a) }
    }
    foreach ($a in @($v.Keys)) {
        if (-not $known -or $known -contains $a) { continue }
        $near =@($known | Where-Object { $k2 = $_; $_.Length -eq $a.Length -and
                @(0..($a.Length - 1) | Where-Object { $a[$_] -ne $k2[$_] }).Count -le 1 })
        if ($near.Count -eq 1) { $v[$near[0]] = $v[$a] + [int]$v[$near[0]]; $v.Remove($a) }
    }
    # A symbol actually traded or watched that day beats an unrecognised reading.
    @($v.GetEnumerator() | Sort-Object @{ e = { $known -contains $_.Key }; Descending = $true }, @{ e = { $_.Value }; Descending = $true } |
        ForEach-Object { $_.Key })
}

# Adds votes from the montage (order-entry) window, which follows the focused ticker:
# its title "QQQ  744.36 -- 744.37 Invesco..." and its "QQQ Bid: 744.12 Ask: ..." line
# are crisp text, so they still read when indicator lines obscure the chart watermark.
function Add-MontageVotes([hashtable]$votes, [System.Drawing.Bitmap]$img, [System.Drawing.Rectangle]$rect) {
    $crop = [ShotImage]::Crop($img, $rect, 1.0)
    try { $lines = @(Invoke-Ocr $crop) } finally { $crop.Dispose() }
    foreach ($l in $lines) {
        if ($l.Text -cmatch '^\s*([A-Z][A-Z.]{0,5})\s+\d+(\.\d+)?\s*\p{Pd}+\s*\d' -or
            $l.Text -cmatch '^\s*([A-Z][A-Z.]{0,5})\s+(Bid|Ask|Long|Short)\b') {
            $votes[$Matches[1]] = 2 + [int]$votes[$Matches[1]]
        }
    }
}

# Adds a vote per DAS chart watermark ("SQQQ--1 Minute") found inside $rect.
function Add-WatermarkVotes([hashtable]$votes, [System.Drawing.Bitmap]$img, [System.Drawing.Rectangle]$rect) {
    $mask = [ShotImage]::WatermarkMask($img, $rect, 1.0, 185, 238, 12)
    try { $lines = @(Invoke-Ocr $mask) } finally { $mask.Dispose() }
    foreach ($l in $lines) {
        if ($l.Text -cmatch '^\s*([A-Z][A-Z0-9.]{0,5})\s*\p{Pd}') { $votes[$Matches[1]] = 1 + [int]$votes[$Matches[1]] }
    }
}

# OCR of the big monitor. On an EOD shot it shows a DAS window with its own title bar
# ("Dastrader Powered by DASTrader.com"); during trading it is the borderless chart grid,
# so the title bar is what marks an EOD shot. Lines come back in image pixels.
function Read-BigScreen([System.Drawing.Bitmap]$img, [System.Drawing.Rectangle]$big) {
    $crop = [ShotImage]::Crop($img, $big, 1.0)
    try { $lines = @(Invoke-Ocr $crop) } finally { $crop.Dispose() }
    foreach ($l in $lines) { $l.X += $big.X; $l.Y += $big.Y }
    $t = $lines | Where-Object { $_.Text -match 'Dastrader|DASTrader\.com' } | Select-Object -First 1
    $title = $null
    if ($t) { $title = New-Object System.Drawing.Rectangle $t.X, $t.Y, $t.W, $t.H }
    [pscustomobject]@{ Title = $title; Lines = $lines }
}

# ---------------------------------------------------------------- DAS log -> actions
function Get-Dir([string]$bs) { if ($bs -eq 'Buy') { 1 } else { -1 } }   # Sell and Shrt both reduce/short

function Read-DasLog([string]$day) {
    $path = Join-Path $cfg.dasReportsDir "$day-trade-log.csv"
    if (-not (Test-Path $path)) { return @() }
    $raw = @(Import-Csv $path)
    [array]::Reverse($raw)   # DAS writes newest first; reversing gives true order, even within a second
    foreach ($r in $raw) {
        [pscustomobject]@{
            Event = $r.Event; BS = $r.'B/S'; Sym = $r.Symbol.Trim().ToUpper(); Qty = [int]$r.Shares
            Px = [double]$r.Price; T = [datetime]::ParseExact("$day $($r.Time)", 'yyyy-MM-dd HH:mm:ss', $null)
        }
    }
}

# Walks the log keeping per-symbol position and the resting stop/target, and emits one
# action per Execute or stop/target move - the events a screenshot gets taken after.
function Get-DasActions($rows) {
    $rows = @($rows)
    # An Accept filled within a second on the same side is an order being sent to
    # enter/exit (or a stop triggering), not a resting bracket leg.
    $sent = @{}
    for ($i = 0; $i -lt $rows.Count; $i++) {
        $a = $rows[$i]
        if ($a.Event -ne 'Accept') { continue }
        foreach ($e in $rows) {
            if ($e.Event -eq 'Execute' -and $e.Sym -eq $a.Sym -and (Get-Dir $e.BS) -eq (Get-Dir $a.BS) -and
                [math]::Abs(($e.T - $a.T).TotalSeconds) -le 1) { $sent[$i] = $true; break }
        }
    }
    $st = @{}
    $out = New-Object System.Collections.Generic.List[object]
    for ($i = 0; $i -lt $rows.Count; $i++) {
        $r = $rows[$i]
        if (-not $st.ContainsKey($r.Sym)) { $st[$r.Sym] = @{ Pos = 0; Opens = 0; Stop = $null; Target = $null; Last = $null; Side = $null } }
        $s = $st[$r.Sym]
        $dir = Get-Dir $r.BS
        $opposite = $s.Pos -ne 0 -and [math]::Sign($s.Pos) -ne $dir
        switch ($r.Event) {
            'Execute' {
                $prev = $s.Pos; $new = $prev + $dir * $r.Qty; $label = ''
                $side = $s.Side
                if ($prev -eq 0) {
                    $label = if ($s.Opens -eq 0) { '' } else { 'Re-Entry' }
                    $s.Opens++; $s.Stop = $null; $s.Target = $null
                    $side = if ($dir -gt 0) { 'Long' } else { 'Short' }; $s.Side = $side
                }
                elseif ([math]::Sign($prev) -eq $dir) { $label = 'AddSize' }
                elseif ($new -eq 0 -or [math]::Sign($new) -ne [math]::Sign($prev)) {
                    $long = $prev -gt 0
                    $hitStop = $null -ne $s.Stop -and $(if ($long) { $r.Px -le $s.Stop * 1.0015 } else { $r.Px -ge $s.Stop * 0.9985 })
                    $hitTgt = $null -ne $s.Target -and $(if ($long) { $r.Px -ge $s.Target * 0.9985 } else { $r.Px -le $s.Target * 1.0015 })
                    $label = if ($hitStop) { 'Stopped' } elseif ($hitTgt) { 'TP' } else { 'AllOut' }
                    if ($new -ne 0) { $label += ' Reversal'; $s.Opens++; $s.Side = if ($new -gt 0) { 'Long' } else { 'Short' } }
                }
                else { $label = 'Partial' }
                $s.Pos = $new; $s.Last = $r.Px
                if ($new -eq 0) { $s.Stop = $null; $s.Target = $null }
                $out.Add([pscustomobject]@{ T = $r.T; Sym = $r.Sym; Label = $label; Side = $side
                        Evidence = "$($r.BS) $($r.Qty) $($r.Sym) @ $($r.Px) $($r.T.ToString('HH:mm:ss'))" })
            }
            'Accept' {
                if ($opposite -and -not $sent[$i]) {
                    $isStop = if ($s.Pos -gt 0) { $r.Px -lt $s.Last } else { $r.Px -gt $s.Last }
                    if ($isStop) { $s.Stop = $r.Px } else { $s.Target = $r.Px }
                }
            }
            'Replaced' {
                if (-not $opposite) { break }
                if ($null -eq $s.Stop -and $null -eq $s.Target) {
                    $isStop = if ($s.Pos -gt 0) { $r.Px -lt $s.Last } else { $r.Px -gt $s.Last }
                }
                else {
                    $isStop = $null -ne $s.Stop -and ($null -eq $s.Target -or [math]::Abs($r.Px - $s.Stop) -le [math]::Abs($r.Px - $s.Target))
                }
                if ($isStop) {
                    $tighter = $null -eq $s.Stop -or $(if ($s.Pos -gt 0) { $r.Px -gt $s.Stop } else { $r.Px -lt $s.Stop })
                    $label = if (-not $tighter) { 'WidenedStop' } elseif ($s.Pos -gt 0) { 'RaisedStop' } else { 'LoweredStop' }
                    $s.Stop = $r.Px
                }
                else { $label = 'TargetChange'; $s.Target = $r.Px }
                $out.Add([pscustomobject]@{ T = $r.T; Sym = $r.Sym; Label = $label; Side = $s.Side
                        Evidence = "stop/target -> $($r.Px) $($r.T.ToString('HH:mm:ss'))" })
            }
        }
    }
    $out
}

# ---------------------------------------------------------------- naming
function Get-SourceTag([string]$name) {
    if ($name -match 'Screenshot \((\d+)\)') { "Screenshot ($($Matches[1]))" } else { [IO.Path]::GetFileNameWithoutExtension($name) }
}

# Highest step number / EOD count already used for date+symbol, in every folder we write to,
# so a re-run or a late screenshot continues the sequence instead of colliding with it.
function Get-ExistingCounters([string]$day) {
    $counters = @{}
    $dirs = @($cfg.screenshotsDir, $cfg.driveTradeDir, $cfg.driveEodDir) | Where-Object { $_ -and (Test-Path $_) }
    foreach ($d in $dirs) {
        # No -Filter: Google Drive's G: drive silently ignores it and returns nothing.
        foreach ($f in Get-ChildItem $d -File | Where-Object { $_.Name.StartsWith("$day ") }) {
            if ($f.Name -match "^$day ([A-Z][A-Z0-9.]{0,9}) EOD(?: (\d+))? ") {
                $k = "$($Matches[1])|EOD"; $n = if ($Matches[2]) { [int]$Matches[2] } else { 1 }
            }
            elseif ($f.Name -match "^$day ([A-Z][A-Z0-9.]{0,9}) (\d+)[ .]") { $k = "$($Matches[1])|T"; $n = [int]$Matches[2] }
            else { continue }
            if ($n -gt [int]$counters[$k]) { $counters[$k] = $n }
        }
    }
    $counters
}

# Fills NewName on every included row. Step numbers are recomputed from scratch in time
# order, so editing a row's Symbol or Kind in the plan renumbers correctly.
function Set-Names($rows, [string]$day) {
    $c = Get-ExistingCounters $day
    foreach ($r in ($rows | Sort-Object { [datetime]$_.Created })) {
        if ($r.Include -ne 'Y' -or -not $r.Symbol -or $r.Kind -notin 'trade', 'eod') { $r.NewName = ''; continue }
        $tag = Get-SourceTag $r.Source
        if ($r.Kind -eq 'eod') {
            $k = "$($r.Symbol)|EOD"; $c[$k] = 1 + [int]$c[$k]
            $eod = if ($c[$k] -gt 1) { "EOD $($c[$k])" } else { 'EOD' }
            $parts = @($day, $r.Symbol, $eod, $r.Note, $tag)
        }
        else {
            $k = "$($r.Symbol)|T"; $c[$k] = 1 + [int]$c[$k]
            $parts = @($day, $r.Symbol, $c[$k], $r.Action, $r.Note, $r.Setup, $r.Side, $tag)
        }
        $r.NewName = ((($parts | Where-Object { "$_".Trim() }) -join ' ') -replace '\s+', ' ') + '.png'
    }
}

# ---------------------------------------------------------------- plan
function New-Plan([string]$day, $layout) {
    $raw = @(Get-ChildItem $cfg.screenshotsDir -File | Where-Object {
            $_.Name -match '^Screenshot \(\d+\)\.png$' -and $_.CreationTime.ToString('yyyy-MM-dd') -eq $day } | Sort-Object CreationTime)
    if (-not $raw) { Write-Host "$day : no unnamed screenshots." ; return $null }
    $log = @(Read-DasLog $day)
    $actions = @(Get-DasActions $log)
    if (-not $log) { Write-Warning "$day : no DAS log at $($cfg.dasReportsDir)\$day-trade-log.csv - actions will be blank." }
    $win = [int]$cfg.matchWindowSecs
    # Symbols traded that day, plus the always-watched index ETFs (the app's ALWAYS_WATCHLIST_SYMBOLS).
    $known = @(@($log | ForEach-Object { $_.Sym }) + 'QQQ', 'SPY' | Sort-Object -Unique)

    $rows = foreach ($f in $raw) {
        Write-Host "  reading $($f.Name) ..." -NoNewline
        $row = [ordered]@{}; foreach ($c in $PLAN_COLS) { $row[$c] = '' }
        $row.Include = 'Y'; $row.Created = $f.CreationTime.ToString('yyyy-MM-dd HH:mm:ss'); $row.Source = $f.Name; $row.Size = $f.Length
        $row.Setup = $cfg.defaultSetup
        $checks = New-Object System.Collections.Generic.List[string]
        $img = [System.Drawing.Bitmap]::FromFile($f.FullName)
        try {
            if ($img.Width -ne $layout.Width -or $img.Height -ne $layout.Height) {
                $checks.Add("image is $($img.Width)x$($img.Height), desktop is $($layout.Width)x$($layout.Height) - monitors changed?")
            }
            $screen = Read-BigScreen $img $layout.Big
            if ($screen.Title) {
                $row.Kind = 'eod'
                $w = [ShotImage]::FindWindow($img, $screen.Title, $layout.Big)
                $row.Crop = "$($w.X),$($w.Y),$($w.Width),$($w.Height)"
                if ($w.Width -lt 800 -or $w.Height -lt 400) { $checks.Add("crop looks too small ($($w.Width)x$($w.Height))") }
                $votes = @{}
                Add-WatermarkVotes $votes $img $w
                # The quote window's title ("TQQQ  77.43 -- 77.44 ProShares...") is crisp
                # black text, so it outweighs the faint watermarks.
                foreach ($l in $screen.Lines) {
                    if ($l.X -ge $w.X -and $l.X -lt $w.Right -and $l.Y -ge $w.Y -and $l.Y -lt $w.Bottom -and
                        $l.Text -cmatch '^\s*([A-Z][A-Z.]{0,5})\s+\d+(\.\d+)?\s*\p{Pd}+\s*\d') { $votes[$Matches[1]] = 3 + [int]$votes[$Matches[1]] }
                }
                $syms = @(Resolve-Symbols $votes $known)
                if ($syms.Count -ge 1) { $row.Symbol = $syms[0] } else { $checks.Add('no ticker found in the DAS window') }
                if ($syms.Count -gt 1) { $checks.Add("several tickers in window: $($syms -join ', ')") }
                $row.Evidence = "DAS window $($w.Width)x$($w.Height) at $($w.X),$($w.Y); reads " + (($votes.GetEnumerator() | ForEach-Object { "$($_.Key)x$($_.Value)" }) -join ' ')
            }
            else {
                $votes = @{}
                Add-WatermarkVotes $votes $img $layout.Focus
                Add-MontageVotes $votes $img $layout.Laptop
                $syms = @(Resolve-Symbols $votes $known)
                $ocrSym = if ($syms.Count -ge 1) { $syms[0] } else { $null }
                if ($syms.Count -gt 1) { $checks.Add("several tickers on laptop screen: $($syms -join ', ')") }
                $t = $f.CreationTime
                # The screenshot follows the event it records (3-8 s later), so the latest
                # event before it wins; one a few seconds after only counts if there's none.
                $cand = @($actions | Where-Object { $_.T -ge $t.AddSeconds(-$win) -and $_.T -le $t.AddSeconds(3) -and (-not $ocrSym -or $_.Sym -eq $ocrSym) })
                $pick = $cand | Where-Object { $_.T -le $t } | Select-Object -Last 1
                if (-not $pick) { $pick = $cand | Select-Object -First 1 }
                if ($ocrSym -or $pick) { $row.Kind = 'trade' } else { $row.Kind = 'unknown'; $checks.Add('not recognised as a trade or EOD shot') }
                $row.Symbol = if ($ocrSym) { $ocrSym } elseif ($pick) { $pick.Sym } else { '' }
                if ($pick) {
                    $row.Action = $pick.Label; $row.Side = $pick.Side
                    $row.Evidence = "$($pick.Evidence) (+$([int]($t - $pick.T).TotalSeconds)s); laptop shows $(if ($ocrSym) { $ocrSym } else { '?' })"
                    if (-not $ocrSym) { $checks.Add('ticker taken from DAS log only (laptop focus unreadable)') }
                }
                elseif ($ocrSym) {
                    $prior = $actions | Where-Object { $_.Sym -eq $ocrSym -and $_.T -le $t } | Select-Object -Last 1
                    $row.Side = if ($prior -and $prior.Side) { $prior.Side } else { 'Long' }
                    $row.Evidence = "laptop shows $ocrSym; no DAS event in last ${win}s"
                    $checks.Add('no DAS event just before - add a Note (e.g. FEAR)?')
                }
            }
        }
        finally { $img.Dispose() }
        $row.Check = if ($checks.Count) { 'CHECK: ' + ($checks -join '; ') } else { 'ok' }
        Write-Host " $($row.Kind) $($row.Symbol) $($row.Action)"
        [pscustomobject]$row
    }
    $rows = @($rows)
    Set-Names $rows $day
    $rows
}

function Show-Plan($rows) {
    $rows | Format-Table @{ n = 'Time'; e = { ([datetime]$_.Created).ToString('HH:mm:ss') } },
        @{ n = 'Src'; e = { if ($_.Source -match '\((\d+)\)') { $Matches[1] } else { $_.Source } } },
        Kind, NewName, Check -AutoSize -Wrap | Out-String -Width 260 | Write-Host
}

# ---------------------------------------------------------------- apply / undo
function Get-Hash([string]$p) { (Get-FileHash -Algorithm SHA256 -LiteralPath $p).Hash }

function Invoke-Apply([string]$day) {
    $planPath = Join-Path $cfg.workDir "$day.plan.csv"
    if (-not (Test-Path $planPath)) { throw "No plan for $day - run without -Apply first." }
    $rows = @(Import-Csv $planPath)
    foreach ($r in $rows) { if ($r.Include -eq 'y') { $r.Include = 'Y' } }
    Set-Names $rows $day
    $todo = @($rows | Where-Object { $_.Include -eq 'Y' })

    # ---- validate everything before touching anything
    $errs = New-Object System.Collections.Generic.List[string]
    foreach ($d in 'driveTradeDir', 'driveEodDir', 'driveDasDir') {
        if (-not (Test-Path $cfg.$d)) { $errs.Add("Drive folder missing: $($cfg.$d) (is Google Drive for desktop running?)") }
    }
    $seen = @{}
    foreach ($r in $todo) {
        $src = Join-Path $cfg.screenshotsDir $r.Source
        if (-not (Test-Path -LiteralPath $src)) { $errs.Add("$($r.Source): source file is gone"); continue }
        if ((Get-Item -LiteralPath $src).Length -ne [long]$r.Size) { $errs.Add("$($r.Source): changed since the plan was made - re-plan") }
        if ($r.Kind -notin 'trade', 'eod') { $errs.Add("$($r.Source): Kind is '$($r.Kind)' - set trade/eod or Include=N") }
        if (-not $r.NewName -or $r.NewName -notmatch $NAME_RE) { $errs.Add("$($r.Source): '$($r.NewName)' doesn't fit 'YYYY-MM-DD SYMBOL ...png'") }
        if ($r.Kind -eq 'eod' -and ($r.NewName -split ' ')[2] -ne 'EOD') { $errs.Add("$($r.Source): EOD name must have EOD as its 3rd word") }
        if ($r.Kind -eq 'eod' -and $r.Crop -notmatch '^\d+,\d+,\d+,\d+$') { $errs.Add("$($r.Source): bad Crop '$($r.Crop)'") }
        if ($seen[$r.NewName]) { $errs.Add("two rows would both be named '$($r.NewName)'") }; $seen[$r.NewName] = $true
        $driveDir = if ($r.Kind -eq 'eod') { $cfg.driveEodDir } else { $cfg.driveTradeDir }
        foreach ($t in (Join-Path $cfg.screenshotsDir $r.NewName), (Join-Path $driveDir $r.NewName)) {
            if (Test-Path -LiteralPath $t) { $errs.Add("already exists: $t") }
        }
    }
    if ($errs.Count) { $errs | ForEach-Object { Write-Host "  x $_" -ForegroundColor Red }; throw "$day : nothing changed - fix the plan and re-run -Apply." }

    # ---- execute, logging every step so -Undo can reverse it
    $logPath = Join-Path $cfg.workDir "$day.log.jsonl"
    $bdir = Join-Path $cfg.workDir "backup\$day"
    if ($backupOn) { New-Item -ItemType Directory -Force $bdir | Out-Null }
    $copies = New-Object System.Collections.Generic.List[object]
    foreach ($r in $todo) {
        $src = Join-Path $cfg.screenshotsDir $r.Source
        $dst = Join-Path $cfg.screenshotsDir $r.NewName
        $created = (Get-Item -LiteralPath $src).CreationTime
        $bak = $null
        if ($backupOn) {
            $bak = Join-Path $bdir $r.Source
            Copy-Item -LiteralPath $src $bak
            (Get-Item -LiteralPath $bak).CreationTime = $created
            if ((Get-Hash $bak) -ne (Get-Hash $src)) { throw "backup of $($r.Source) doesn't match - stopping" }
        }
        if ($r.Kind -eq 'eod') {
            $c = $r.Crop -split ',' | ForEach-Object { [int]$_ }
            $img = [System.Drawing.Bitmap]::FromFile($src)
            try {
                $cropped = [ShotImage]::Crop($img, (New-Object System.Drawing.Rectangle $c[0], $c[1], $c[2], $c[3]), 1.0)
                try { $cropped.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png) } finally { $cropped.Dispose() }
            }
            finally { $img.Dispose() }
            Remove-Item -LiteralPath $src
        }
        else { Move-Item -LiteralPath $src $dst }
        # Keep the capture time: it's what ties a screenshot to its DAS event.
        (Get-Item -LiteralPath $dst).CreationTime = $created
        $driveDir = if ($r.Kind -eq 'eod') { $cfg.driveEodDir } else { $cfg.driveTradeDir }
        $remote = Join-Path $driveDir $r.NewName
        Copy-Item -LiteralPath $dst $remote
        try { (Get-Item -LiteralPath $remote).CreationTime = $created } catch { }
        $copies.Add([pscustomobject]@{ Local = $dst; Remote = $remote })
        [pscustomobject]@{ op = $r.Kind; src = $src; dst = $dst; remote = $remote; backup = $bak; created = $created.ToString('o') } |
            ConvertTo-Json -Compress | Add-Content -LiteralPath $logPath -Encoding UTF8
        Write-Host "  + $($r.NewName)"
    }

    # ---- the day's DAS log
    $das = Join-Path $cfg.dasReportsDir "$day-trade-log.csv"
    if (Test-Path $das) {
        $remote = Join-Path $cfg.driveDasDir (Split-Path $das -Leaf)
        if (-not (Test-Path -LiteralPath $remote) -or ((Get-Hash $remote) -ne (Get-Hash $das) -and (Get-Item $das).LastWriteTime -gt (Get-Item $remote).LastWriteTime)) {
            $prev = $null
            if (Test-Path -LiteralPath $remote) { $prev = Join-Path $cfg.workDir "backup\$day\drive-$(Split-Path $das -Leaf)"; New-Item -ItemType Directory -Force (Split-Path $prev) | Out-Null; Copy-Item -LiteralPath $remote $prev }
            Copy-Item -LiteralPath $das $remote -Force
            $copies.Add([pscustomobject]@{ Local = $das; Remote = $remote })
            [pscustomobject]@{ op = 'das'; src = $das; remote = $remote; backup = $prev } | ConvertTo-Json -Compress | Add-Content -LiteralPath $logPath -Encoding UTF8
            Write-Host "  + DAS log -> $remote"
        }
        else { Write-Host "  = DAS log already on Drive" }
    }
    else { Write-Warning "no DAS log for $day to upload" }

    # ---- verify
    $bad = @($copies | Where-Object { -not (Test-Path -LiteralPath $_.Remote) -or (Get-Hash $_.Remote) -ne (Get-Hash $_.Local) })
    if ($bad) { $bad | ForEach-Object { Write-Host "  x Drive copy differs: $($_.Remote)" -ForegroundColor Red }; throw 'verification failed' }
    Write-Host "$day : $($todo.Count) screenshots renamed, $($copies.Count) files on Drive, all verified." -ForegroundColor Green
    if ($backupOn) { Write-Host "  originals kept in $bdir" }
}

function Invoke-Undo([string]$day) {
    $logPath = Join-Path $cfg.workDir "$day.log.jsonl"
    if (-not (Test-Path $logPath)) { throw "nothing to undo for $day" }
    $ops = @(Get-Content $logPath | ForEach-Object { $_ | ConvertFrom-Json })
    [array]::Reverse($ops)
    foreach ($o in $ops) {
        if ($o.op -eq 'das') {
            if ($o.backup) { Copy-Item -LiteralPath $o.backup $o.remote -Force } else { Remove-Item -LiteralPath $o.remote -ErrorAction SilentlyContinue }
            continue
        }
        if (-not $o.backup -or -not (Test-Path -LiteralPath $o.backup)) { Write-Warning "no backup for $($o.src) - leaving $($o.dst)"; continue }
        Remove-Item -LiteralPath $o.remote -ErrorAction SilentlyContinue
        Copy-Item -LiteralPath $o.backup $o.src
        # The capture time is what dates and matches a screenshot, so it must come back too.
        (Get-Item -LiteralPath $o.src).CreationTime = [datetime]::Parse($o.created, $null, 'RoundtripKind')
        Remove-Item -LiteralPath $o.dst -ErrorAction SilentlyContinue
        Write-Host "  restored $(Split-Path $o.src -Leaf)"
    }
    Move-Item $logPath "$logPath.undone-$(Get-Date -Format yyyyMMddHHmmss)"
}

# ---------------------------------------------------------------- main
foreach ($day in $Date) {
    if ($Undo) { Invoke-Undo $day; continue }
    if ($Apply) { Invoke-Apply $day; continue }
    Write-Host "== $day"
    $rows = New-Plan $day (Get-Layout)
    if (-not $rows) { continue }
    $planPath = Join-Path $cfg.workDir "$day.plan.csv"
    $rows | Select-Object $PLAN_COLS | Export-Csv -NoTypeInformation -Encoding UTF8 $planPath
    Show-Plan $rows
    Write-Host "Plan: $planPath  (edit Note/Action/Setup/Symbol/Include, then re-run with -Apply)"
}
