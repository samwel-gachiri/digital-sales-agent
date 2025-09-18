@echo off
echo Starting Digital Sales Agent System...
echo.

echo Starting Coral Server...
start "Coral Server" cmd /k "cd coral-server && ./gradlew run"
timeout /t 10

echo Starting Sales Agent...
start "Sales Agent" cmd /k "cd Coral-Sales-Agent && uv run python main.py"
timeout /t 5

echo Starting Firecrawl Agent...
start "Firecrawl Agent" cmd /k "cd Coral-FirecrawlMCP-Agent && uv run python main.py"
timeout /t 5

echo Starting Interface Agent...
start "Interface Agent" cmd /k "cd Coral-Interface-Agent && uv run python main.py"
timeout /t 5

echo Starting Backend...
start "Backend" cmd /k "cd backend && python main.py"
timeout /t 5

@REM echo Starting Frontend...
@REM start "Frontend" cmd /k "cd SalesUI && npm run dev"

echo.
echo All agents started! Check each window for status.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo Coral Server: http://localhost:5555
pause