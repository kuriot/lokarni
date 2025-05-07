Write-Host "Starting Lokarni backend..."
Start-Process powershell -ArgumentList "cd backend; uvicorn main:app --host 127.0.0.1 --port 8000"
Start-Sleep -Seconds 2
Write-Host "Installing frontend dependencies..."
cd frontend
npm install
Write-Host "Starting frontend..."
npm run dev
