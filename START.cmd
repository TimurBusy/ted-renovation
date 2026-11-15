@echo off
cd /d "%~dp0"
echo Open http://127.0.0.1:3000/constructor after the server starts.
node scripts/serve.mjs
pause
