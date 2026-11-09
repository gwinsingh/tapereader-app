@echo off
rem Paper Desk - daily run (Windows scheduled task "TapeReader Paper Desk", weekdays 06:45 ET, wakes the computer).
rem Steps: grouped daily + 1-min bars for yesterday's orders/positions -> replay -> scans -> rules-only plan -> agent plan
rem        -> validate -> lock (deadline 09:25 ET) -> KV publish -> vault pages -> open Obsidian so the sync plugin pushes.
rem Holidays/weekends: run.js replays and publishes but writes no plan. Output: scripts\paperdesk\.data\task.out
cd /d "%~dp0\..\.."
echo ==== %date% %time% >> scripts\paperdesk\.data\task.out
"C:\Program Files\nodejs\node.exe" --max-old-space-size=4000 scripts\paperdesk\run.js %* >> scripts\paperdesk\.data\task.out 2>&1
start "" "obsidian://open?vault=MyVault"
