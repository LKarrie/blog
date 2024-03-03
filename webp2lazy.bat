@echo off
setlocal enabledelayedexpansion
set SrcFolder=C:\Gohugo\blog.lkarrie.com\static\imgwebp
set imgs= 
for /f "delims=\" %%a in ('dir /b "%SrcFolder%\*.webp*"') do (
  echo %%a
  set "imgs=!imgs!"%%a" "
)
echo %imgs%

cd /d %SrcFolder%

for %%i in (%imgs%) do (  
    echo Processing file: %%i  
    set "file_with_ext=%%i"  
    set "file_without_ext=!file_with_ext:~0,-6!"  
    echo file_without_ext: !file_without_ext!  
    ffmpeg -i %%i -vf scale=20:-1 !file_without_ext!-lazy.webp
)

pause