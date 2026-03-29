@echo off
title Backup lovejobs.ai
cd /d "%~dp0"
echo Arrancando backup automatico lovejobs.ai...
node backup.js
pause
