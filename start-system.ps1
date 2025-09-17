# Digital Sales Agent System Startup Script
Write-Host "Starting Digital Sales Agent System..." -ForegroundColor Green

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Cyan

try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python detected: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "Python not found. Please install Python 3.13+" -ForegroundColor Red
    exit 1
}

try {
    $nodeVersion = node --version 2>&1
    Write-Host "Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

Write-Host "System ready to start!" -ForegroundColor Green
Write-Host "Please start the following components manually:" -ForegroundColor Yellow
Write-Host "1. Coral Server (port 5555)" -ForegroundColor White
Write-Host "2. Sales Agent: cd Coral-SalesAgent && uv run python main.py" -ForegroundColor White
Write-Host "3. Interface Agent: cd Coral-SalesInterfaceAgent && uv run python main.py" -ForegroundColor White
Write-Host "4. Frontend: cd SalesUI && npm run dev" -ForegroundColor White
Write-Host "5. Access: http://localhost:3000" -ForegroundColor White