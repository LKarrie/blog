@echo off
setlocal enabledelayedexpansion
@REM 指定存放文件的目录（必须为英文目录，不能有空格）
set SrcFolder=C:\Gohugo\blog.lkarrie.com\static\imgorg
set DstFolder=C:\Gohugo\blog.lkarrie.com\static\imgwebp
set imgs= 
for /f "delims=\" %%a in ('dir /b "%SrcFolder%\*.png*"') do (
  echo %%a
  set "imgs=!imgs!"%%a" "
)
echo %imgs%

@REM loop 指定webp循环次数
set /a loop = 0
@REM 指定每帧的时间，也可以在每一个图片名称后分别进行控制
set /a time = 40
@REM 指定压缩质量，越高越好，生成文件也越大
set /a q = 65
cd /d %SrcFolder%

for %%i in (%imgs%) do (  
    echo Processing file: %%i  
    @REM set /a count += 1

    set "file_with_ext=%%i"  
    set "file_without_ext=!file_with_ext:~0,-5!"
    set "file_without_ext=!file_without_ext:~1!"  
    echo file_without_ext: !file_without_ext!
    img2webp -v -loop %loop% -lossy -q %q% -d %time%  %%i -o %DstFolder%\!file_without_ext!.webp
    
    @REM img2webp -v -loop %loop% -lossy -q %q% -d %time%  %%i -o %DstFolder%\out_quality%q%_loop%loop%_!count!_frametime%time%.webp
    @REM img2webp -v -loop %loop% -mixed -d %time%  %imgs% -o %DstFolder%\out_mixed_loop%loop%_!count!_frametime%time%.webp
)

pause