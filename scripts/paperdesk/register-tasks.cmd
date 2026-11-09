@echo off
rem Registers the two Paper Desk scheduled tasks (run this once yourself; the overnight build was not allowed to).
rem   "TapeReader Paper Desk"        weekdays 06:45, wakes the computer, runs scripts\paperdesk\run-daily.cmd
rem   "TapeReader Paper Desk Weekly" Saturdays 09:00, wakes the computer, runs scripts\paperdesk\run-weekly.cmd
rem Both start late if the laptop was off (run.js never writes a plan after 09:30 ET).
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$s = New-ScheduledTaskSettingsSet -WakeToRun -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Hours 3) -MultipleInstances IgnoreNew;" ^
  "Register-ScheduledTask -TaskName 'TapeReader Paper Desk' -Action (New-ScheduledTaskAction -Execute 'cmd.exe' -Argument '/c \"%~dp0run-daily.cmd\"') -Trigger (New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday,Tuesday,Wednesday,Thursday,Friday -At 6:45am) -Settings $s -Force | Out-Null;" ^
  "Register-ScheduledTask -TaskName 'TapeReader Paper Desk Weekly' -Action (New-ScheduledTaskAction -Execute 'cmd.exe' -Argument '/c \"%~dp0run-weekly.cmd\"') -Trigger (New-ScheduledTaskTrigger -Weekly -DaysOfWeek Saturday -At 9:00am) -Settings $s -Force | Out-Null;" ^
  "Get-ScheduledTask -TaskName 'TapeReader Paper Desk*' | ForEach-Object { '{0}: next run {1}, wake {2}' -f $_.TaskName, ($_ | Get-ScheduledTaskInfo).NextRunTime, $_.Settings.WakeToRun }"
pause
