<#
  Self-test for JournalInbox.ps1. Runs anywhere PowerShell does (Windows PowerShell 5.1
  or pwsh on macOS/Linux) - no OCR, no Drive, no screenshots needed:

      pwsh scripts/screenshots/Test-JournalInbox.ps1

  Exits non-zero on the first failure.
#>
$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'JournalInbox.ps1')

$script:fails = 0
function Check([string]$what, $got, $want) {
    if ("$got" -ceq "$want") { Write-Host "  ok   $what" }
    else { Write-Host "  FAIL $what`n       got:  $got`n       want: $want" -ForegroundColor Red; $script:fails++ }
}

Write-Host '== file names'
$nn = [char]0x202F
$i = Get-InboxShotInfo "Screenshot 2026-09-29 at 9.52.47${nn}AM.png"
Check 'mac U+202F AM time' $i.Captured.ToString('yyyy-MM-dd HH:mm:ss') '2026-09-29 09:52:47'
Check 'mac has no app/symbol' "$($i.App)|$($i.Symbol)" '|'
$i = Get-InboxShotInfo 'Screenshot 2026-09-29 at 12.05.01 PM.png'
Check 'mac 12 PM is noon' $i.Captured.ToString('HH:mm:ss') '12:05:01'
$i = Get-InboxShotInfo 'Screenshot 2026-09-29 at 12.05.01 AM.png'
Check 'mac 12 AM is midnight' $i.Captured.ToString('HH:mm:ss') '00:05:01'
$i = Get-InboxShotInfo 'Screenshot 2026-09-29 at 3.15.09 PM (2).png'
Check 'mac same-second duplicate' $i.Captured.ToString('HH:mm:ss') '15:15:09'
$i = Get-InboxShotInfo 'Screen Shot 2022-03-01 at 10.00.00 AM.png'
Check 'mac pre-Ventura "Screen Shot"' $i.Captured.ToString('HH:mm:ss') '10:00:00'
$i = Get-InboxShotInfo 'Screenshot 2026-09-29 at 14.52.47.png'
Check 'mac 24h locale' $i.Captured.ToString('HH:mm:ss') '14:52:47'
$i = Get-InboxShotInfo 'NVDA_2026-09-29_09-53-10.png'
Check 'tradingview name' "$($i.App)|$($i.Symbol)|$($i.Captured.ToString('yyyy-MM-dd HH:mm:ss'))" 'TradingView|NVDA|2026-09-29 09:53:10'
$i = Get-InboxShotInfo 'NASDAQ_NVDA_2026-09-29_09-53-10 (1).png'
Check 'tradingview exchange prefix + dup' "$($i.Symbol)|$($i.Captured.ToString('HH:mm:ss'))" 'NVDA|09:53:10'
$i = Get-InboxShotInfo 'BRK.B_2026-09-29_10-00-00.png'
Check 'tradingview share class' $i.Symbol 'BRK.B'
$i = Get-InboxShotInfo 'Screenshot 2026-09-29 at 9.52.47 AM.jpg'
Check 'mac jpg' $i.Captured.ToString('HH:mm:ss') '09:52:47'
Check 'lower-case word_date_time is not TradingView' (Get-InboxShotInfo 'bookmap_2026-09-29_09-53-10.png') ''
Check 'already-named file is not raw' (Get-InboxShotInfo '2026-09-29 NVDA 4.1 Bookmap 09.52.47.png') ''
Check 'DAS raw is not an inbox name' (Get-InboxShotInfo 'Screenshot (1121).png') ''

Write-Host '== bookmap orders'
Check 'alias stock' (ConvertFrom-BookmapAlias 'NVDA@DXFEED') 'NVDA'
Check 'alias future' (ConvertFrom-BookmapAlias 'ESU8.CME@RITHMIC') 'ESU8'
Check 'alias class' (ConvertFrom-BookmapAlias 'BRK.B@DXFEED') 'BRK.B'
Check 'header detect' (Test-BookmapOrders '!BOOKMAP_FORMAT_V1') 'True'
Check 'header reject' (Test-BookmapOrders 'Event,B/S,Symbol') 'False'

# The KB's own example (futures, 2018-08-17, 13:26 UTC = 09:26 EDT), plus a long entry
# with a protective stop that is raised, then stopped out - the shape a stock trade takes.
$sample = @'
!BOOKMAP_FORMAT_V1
!DO_NOT_UPDATE_AFTER_EXECUTION
# comment lines are allowed
S,20180817,132604,0.278443826,1105671107,ESU8.CME@RITHMIC,1,2837.0,2
C,20180817,132606,0.660462608,1105671107
S,20180817,132608,0.448465391,1105671108,ESU8.CME@RITHMIC,0,2838.0,2
E,20180817,132609,0.385849739,1105671108,2838.0,2
F,20180817,132609,0.386520348,1105671108
S,20260929,133500,0.100000000,9001,NVDA@DXFEED,1,181.20,NaN,0,100
E,20260929,133500,0.300000000,9001,181.18,100
S,20260929,133505,0.000000000,9002,NVDA@DXFEED,0,NaN,180.40,0,100
U,20260929,134010,0.000000000,9002,NaN,180.90,0,100
E,20260929,134500,0.500000000,9002,180.88,100
'@ -split "`n"
$rows = @(Read-BookmapOrders $sample (Get-EasternTimeZone))
Check 'row count (S,C,S,E + S,E,S,U,E)' $rows.Count 9
Check 'UTC -> ET (EDT)' $rows[0].T.ToString('yyyy-MM-dd HH:mm:ss') '2018-08-17 09:26:04'
Check 'subseconds kept' $rows[0].T.Millisecond 278
Check 'S -> Accept, bid -> Buy' "$($rows[0].Event)|$($rows[0].BS)|$($rows[0].Sym)|$($rows[0].Qty)" 'Accept|Buy|ESU8|2'
Check 'C -> Canceled' $rows[1].Event 'Canceled'
Check 'E -> Execute keeps side/sym from S' "$($rows[3].Event)|$($rows[3].BS)|$($rows[3].Sym)|$($rows[3].Px)|$($rows[3].Qty)" 'Execute|Sell|ESU8|2838|2'
Check 'stop order price from stop field' $rows[6].Px '180.4'
Check 'U -> Replaced with new stop' "$($rows[7].Event)|$($rows[7].Px)" 'Replaced|180.9'
Check 'archive name spans days' (Get-BookmapArchiveName $rows) '2018-08-17_2026-09-29-bookmap-orders.txt'
Check 'archive name one day' (Get-BookmapArchiveName @($rows | Where-Object { $_.T.Year -eq 2026 })) '2026-09-29-bookmap-orders.txt'

$bad = @('!BOOKMAP_FORMAT_V1', 'S,20260929,83500,0.1,1,NVDA@DXFEED,1,181.2,100', 'E,20260929,83500,0.3,1,181.2,100', 'E,garbage', 'S,2026x929,133500,0.1,2,NVDA@DXFEED,1,181.2,100')
$out = @(Read-BookmapOrders $bad (Get-EasternTimeZone) 3>&1)
$w = @($out | Where-Object { $_ -is [System.Management.Automation.WarningRecord] })
$r2 = @($out | Where-Object { $_ -isnot [System.Management.Automation.WarningRecord] })
Check 'un-padded time read (08:35 UTC = 04:35 ET)' "$($r2.Count)|$($r2[0].T.ToString('HH:mm:ss'))" '2|04:35:00'
Check 'bad lines skipped with a warning' $w.Count 1
$twice = @($rows) + @($rows | Select-Object -Last 3)
Check 'events from two exports counted once' @(Select-UniqueBookmapRows $twice).Count 9
Check 'archive name taken -> -2' (Get-BookmapArchiveName @($rows | Where-Object { $_.T.Year -eq 2026 }) @('2026-09-29-bookmap-orders.txt')) '2026-09-29-bookmap-orders-2.txt'
Check 'archive name taken twice -> -3' (Get-BookmapArchiveName @($rows | Where-Object { $_.T.Year -eq 2026 }) @('2026-09-29-bookmap-orders.txt', '2026-09-29-bookmap-orders-2.txt')) '2026-09-29-bookmap-orders-3.txt'

Write-Host '== companion naming'
$day = '2026-09-29'
function Row($kind, $created, $sym, $app, $newName) {
    [pscustomobject]@{ Include = 'Y'; Kind = $kind; Created = "$day $created"; Symbol = $sym; App = $app; Action = ''; Note = ''; NewName = $newName }
}
$rows = @(
    (Row 'companion' '09:12:03' 'NVDA' 'Bookmap' ''),                    # before any DAS shot -> 0.1
    (Row 'trade' '09:35:08' 'NVDA' '' "$day NVDA 1 ORB Long Screenshot (10).png"),
    (Row 'companion' '09:35:20' 'NVDA' 'Bookmap' ''),                    # -> 1.1
    (Row 'companion' '09:35:40' 'NVDA' 'TradingView' ''),                # -> 1.2
    (Row 'trade' '09:41:00' 'NVDA' '' "$day NVDA 2 AddSize ORB Long Screenshot (11).png"),
    (Row 'companion' '09:50:00' 'NVDA' 'Bookmap' ''),                    # -> 2.1 (and one already on disk -> 2.2)
    (Row 'companion' '09:36:00' 'AMD' 'Bookmap' ''),                     # AMD step 3 known from an earlier run -> 3.1
    (Row 'companion-eod' '16:21:40' 'NVDA' 'Bookmap' ''),
    (Row 'companion' '10:00:00' 'TSLA' 'TradingView' '')
)
$rows[5].Include = 'Y'
$rows[8].Include = 'N'                                                    # excluded -> no name
$rows[3].Action = 'AddSize'
$known = @([pscustomobject]@{ Sym = 'AMD'; Step = 3; T = [datetime]"$day 09:30:00" })
Set-CompanionNames $rows $day $known @{ 'NVDA|2' = 1 }
Check 'pre-DAS read is step 0' $rows[0].NewName "$day NVDA 0.1 Bookmap 09.12.03.png"
Check 'first companion of step 1' $rows[2].NewName "$day NVDA 1.1 Bookmap 09.35.20.png"
Check 'second companion + action' $rows[3].NewName "$day NVDA 1.2 TradingView AddSize 09.35.40.png"
Check 'continues past index on disk' $rows[5].NewName "$day NVDA 2.2 Bookmap 09.50.00.png"
Check 'step from an earlier run' $rows[6].NewName "$day AMD 3.1 Bookmap 09.36.00.png"
Check 'after close -> EOD word 3' $rows[7].NewName "$day NVDA EOD Bookmap 16.21.40.png"
Check 'Include=N gets no name' $rows[8].NewName ''
Check 'DAS rows untouched' $rows[1].NewName "$day NVDA 1 ORB Long Screenshot (10).png"
$e1 = Row 'companion-eod' '16:21:40' 'NVDA' 'Bookmap' ''; $e2 = Row 'companion-eod' '16:21:40' 'NVDA' 'Bookmap' ''
Set-CompanionNames @($e1, $e2) $day @() @{}
Check 'same-second EOD shots stay distinct' "$($e1.NewName)|$($e2.NewName)" "$day NVDA EOD Bookmap 16.21.40.png|$day NVDA EOD Bookmap 16.21.40 2.png"
$e3 = Row 'companion-eod' '16:21:40' 'NVDA' 'Bookmap' ''
Set-CompanionNames @($e3) $day @() @{ 'NVDA|EOD|Bookmap|16.21.40' = 2 }
Check 'EOD count continues from disk' $e3.NewName "$day NVDA EOD Bookmap 16.21.40 3.png"
$early = Row 'companion' '09:35:05' 'NVDA' 'Bookmap' ''
Set-CompanionNames @($early, (Row 'trade' '09:35:08' 'NVDA' '' "$day NVDA 1 ORB Long Screenshot (10).png")) $day @() @{}
Check 'shot of the fill just before the DAS shot joins the new step' $early.NewName "$day NVDA 1.1 Bookmap 09.35.05.png"
$j = Row 'companion' '11:00:00' 'NVDA' 'Bookmap' ''
$j | Add-Member Source 'NVDA 11-00-00.JPG'
Set-CompanionNames @($j) $day @() @{}
Check 'keeps a jpg a jpg' $j.NewName "$day NVDA 0.1 Bookmap 11.00.00.jpg"

Write-Host '== existing steps on disk'
$tmp = Join-Path ([IO.Path]::GetTempPath()) ("inbox-test-" + [guid]::NewGuid())
New-Item -ItemType Directory $tmp | Out-Null
try {
    foreach ($n in "$day NVDA 1 ORB Long Screenshot (10).png", "$day NVDA 1.1 Bookmap 09.35.20.png", "$day NVDA 1.3 Bookmap 09.36.20.png",
        "$day NVDA EOD Screenshot (30).png", "2026-09-28 NVDA 7 x.png", "$day NVDA EOD Bookmap 16.21.40 2.png") {
        Set-Content -LiteralPath (Join-Path $tmp $n) 'x'
        (Get-Item -LiteralPath (Join-Path $tmp $n)).LastWriteTime = [datetime]"$day 09:35:08"
    }
    $ex = Get-ExistingSteps $day @($tmp, (Join-Path $tmp 'missing'))
    Check 'steps found' (@($ex.Steps | ForEach-Object { "$($_.Sym)$($_.Step)" }) -join ',') 'NVDA1'
    Check 'highest companion index' $ex.Subs['NVDA|1'] 3
    Check 'EOD same-second count from disk' $ex.Subs['NVDA|EOD|Bookmap|16.21.40'] 2
    # Straight from disk into the namer, as Set-AllNames does it.
    $c = Row 'companion' '09:40:00' 'NVDA' 'Bookmap' ''
    Set-CompanionNames @($c) $day $ex.Steps $ex.Subs
    Check 'disk steps feed the namer' $c.NewName "$day NVDA 1.4 Bookmap 09.40.00.png"
}
finally { Remove-Item -Recurse -Force $tmp }

if ($script:fails) { Write-Host "$($script:fails) failed" -ForegroundColor Red; exit 1 }
Write-Host 'all passed' -ForegroundColor Green
