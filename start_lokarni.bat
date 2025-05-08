::[Bat To Exe Converter]
::
::YAwzoRdxOk+EWAjk
::fBw5plQjdCqDJHWL/2MiJhJraw2WAEe1DbQO5uG7oqqsrV0UUd4zd4TayLqHbekQ5UuqfJUitg==
::YAwzuBVtJxjWCl3EqQJgSA==
::ZR4luwNxJguZRRnk
::Yhs/ulQjdF+5
::cxAkpRVqdFKZSDk=
::cBs/ulQjdF+5
::ZR41oxFsdFKZSDk=
::eBoioBt6dFKZSDk=
::cRo6pxp7LAbNWATEpCI=
::egkzugNsPRvcWATEpCI=
::dAsiuh18IRvcCxnZtBJQ
::cRYluBh/LU+EWAnk
::YxY4rhs+aU+JeA==
::cxY6rQJ7JhzQF1fEqQJQ
::ZQ05rAF9IBncCkqN+0xwdVs0
::ZQ05rAF9IAHYFVzEqQJQ
::eg0/rx1wNQPfEVWB+kM9LVsJDGQ=
::fBEirQZwNQPfEVWB+kM9LVsJDGQ=
::cRolqwZ3JBvQF1fEqQJQ
::dhA7uBVwLU+EWDk=
::YQ03rBFzNR3SWATElA==
::dhAmsQZ3MwfNWATElA==
::ZQ0/vhVqMQ3MEVWAtB9wSA==
::Zg8zqx1/OA3MEVWAtB9wSA==
::dhA7pRFwIByZRRnk
::Zh4grVQjdCqDJHWL/2MiJhJraw2WAEe1DbQO5uG7oqqsrV0UUd4Td4TayLqHbuUL7yU=
::YB416Ek+ZG8=
::
::
::978f952a14a936cc963da21a135fa983
@echo off
title Lokarni Starter
echo ============================
echo         Lokarni Starter
echo ============================
echo [1] Starten
echo [2] Beenden
set /p choice=Waehle eine Option:

if "%choice%"=="1" (
    echo Starte Backend...
    start "Lokarni Backend" cmd /k "call backend_start.bat"
    timeout /t 2 >nul
    echo Starte Frontend...
    start "Lokarni Frontend" cmd /k "call frontend_start.bat"
    timeout /t 3 >nul
    start http://localhost:5173
) else (
    exit
)
