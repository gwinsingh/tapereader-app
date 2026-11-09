@echo off
rem Paper Desk - weekly edge monitor (Windows scheduled task "TapeReader Paper Desk Weekly", Saturdays 09:00 ET).
rem Edge statuses (push / normal / size-down / pause) from the forward record -> next week's paper sizing, Weekly Review page, KV publish.
cd /d "%~dp0\..\.."
echo ==== weekly %date% %time% >> scripts\paperdesk\.data\task.out
"C:\Program Files\nodejs\node.exe" scripts\paperdesk\weekly.js %* >> scripts\paperdesk\.data\task.out 2>&1
start "" "obsidian://open?vault=MyVault"
