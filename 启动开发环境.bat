@echo off
echo ========================================
echo   光影作品集 - 开发启动脚本
echo ========================================
echo.

echo [1/3] 正在安装依赖...
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo.
echo [2/3] 正在启动开发服务器...
echo.
echo 🚀 启动成功后，请在浏览器访问:
echo    http://localhost:10086
echo.
echo 📱 微信小程序开发:
echo    请使用微信开发者工具打开项目目录
echo.

echo [3/3] 启动中...
echo.

rem 启动H5开发服务器
npm run dev:h5

echo.
pause
