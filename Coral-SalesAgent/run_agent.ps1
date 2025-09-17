# Coral Sales Agent Runner Script (PowerShell)
# This script sets up the environment and runs the Sales Agent

param(
    [Parameter(Mandatory=$true)]
    [string]$ScriptName
)

Write-Host "Starting Coral Sales Agent..." -ForegroundColor Green

# Check if uv is installed
try {
    uv --version | Out-Null
    Write-Host "uv is already installed" -ForegroundColor Green
} catch {
    Write-Host "uv is not installed. Installing uv..." -ForegroundColor Yellow
    pip install uv
}

# Install dependencies if needed
if (-not (Test-Path ".venv")) {
    Write-Host "Creating virtual environment and installing dependencies..." -ForegroundColor Yellow
    uv sync
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Warning: .env file not found. Please copy .env_sample to .env and configure your API keys." -ForegroundColor Yellow
    Write-Host "Using .env_sample as fallback..." -ForegroundColor Yellow
    Copy-Item ".env_sample" ".env"
}

# Run the agent
Write-Host "Running Sales Agent..." -ForegroundColor Green
uv run python $ScriptName