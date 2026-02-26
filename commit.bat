@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion

cd /d %~dp0

git add .

:: По умолчанию комментарий
set "COMMENT=comment"

echo Введите комментарий к коммиту (или нажмите Enter для "comment"):
echo У вас есть 10 секунд для ввода...

:: Создаем временный файл для отслеживания времени
set "TEMP_FILE=%TEMP%\input_timeout.tmp"
del "%TEMP_FILE%" 2>nul

:: Запускаем ввод с таймаутом
start /b cmd /c "set /p input=^> " ^& echo !input!^> "%TEMP_FILE%"

:: Ждем 10 секунд
set /a count=0
:waitloop
if exist "%TEMP_FILE%" goto input_done
ping -n 2 127.0.0.1 > nul
set /a count+=1
if !count! lss 10 goto waitloop

:: Таймаут истек
echo.
echo Время вышло!
set "USER_INPUT="
goto process_input

:input_done
:: Читаем введенные данные
set /p USER_INPUT=<"%TEMP_FILE%"
del "%TEMP_FILE%" 2>nul

:process_input
if "!USER_INPUT!"=="" (
    set "COMMENT=comment"
    echo Используется комментарий по умолчанию: "comment"
) else (
    set "COMMENT=!USER_INPUT!"
    echo Введен комментарий: "!COMMENT!"
)

:: Выполняем коммит
git commit -m "!COMMENT!"

if !errorlevel! equ 0 (
    echo Коммит выполнен с комментарием: "!COMMENT!"
    git push origin v2
) else (
    echo Ошибка при создании коммита!
    pause
    exit /b !errorlevel!
)

echo Готово!
pause