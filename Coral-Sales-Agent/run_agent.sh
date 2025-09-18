#!/bin/bash

# Coral Sales Agent Runner Script
# This script sets up the environment and runs the Sales Agent

set -e

echo "Starting Coral Sales Agent..."

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "uv is not installed. Installing uv..."
    pip install uv
fi

# Install dependencies if needed
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment and installing dependencies..."
    uv sync
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Warning: .env file not found. Please copy .env_sample to .env and configure your API keys."
    echo "Using .env_sample as fallback..."
    cp .env_sample .env
fi

# Run the agent
echo "Running Sales Agent..."
uv run python "$1"