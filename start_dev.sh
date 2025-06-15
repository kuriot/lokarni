#!/bin/bash

# Exit immediately if any command exits with a non-zero status
set -e

# Function to cleanup on exit
cleanup() {
  echo "Shutting down servers..."

  # Kill frontend server using its PID
  if [[ -n "$frontend_pid" ]]; then
    kill $frontend_pid || true
  fi

  # Deactivate virtual environment and kill backend server using its PID
  deactivate || true
  if [[ -n "$backend_pid" ]]; then
    kill $backend_pid || true
  fi
}

# Trap SIGINT (Ctrl+C) to call cleanup function
trap cleanup INT

echo "Starting Lokarni Backend..."
if [[ ! -d "venv" ]]; then
  echo "Creating virtual environment..."
  python3 -m venv venv
fi

source venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt

# Start backend server in the background and capture its PID
uvicorn backend.main:app --port 8000 --reload &
backend_pid=$!

echo "Backend started with PID $backend_pid"

echo "Starting Lokarni Frontend..."
cd frontend
npm install
npm run dev &
frontend_pid=$!

echo "Frontend started with PID $frontend_pid"
cd ..

# Wait for both servers to start before showing message
sleep 3
echo "Backend running at http://localhost:8000"
echo "Frontend running at http://localhost:5173"

# Keep the script running to handle Ctrl+C
wait $backend_pid $frontend_pid