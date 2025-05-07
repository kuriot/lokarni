#!/bin/bash
echo "Starting Lokarni backend..."
cd backend
uvicorn main:app --host 127.0.0.1 --port 8000 &
cd ../frontend
echo "Installing frontend dependencies..."
npm install
echo "Starting frontend..."
npm run dev
