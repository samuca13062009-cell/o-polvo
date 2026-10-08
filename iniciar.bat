@echo off
rem Inicia o site do O Polvo e abre-o no browser.
cd /d "%~dp0"
start "" http://localhost:4173
node server.js
pause
