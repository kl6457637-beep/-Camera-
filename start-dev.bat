@echo off
chcp 65001 >nul
echo.
echo ==========================================
echo    📸 摄影师作品集小程序 - 快速启动
echo ==========================================
echo.

REM 检查是否在项目目录
if not exist "package.json" (
    echo ❌ 错误：请在项目根目录运行此脚本
    pause
    exit /b 1
)

echo 🔍 检查环境...

REM 检查Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未安装 Node.js，请先安装 Node.js
    echo    下载地址：https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js 已安装

REM 检查依赖
if not exist "node_modules" (
    echo 📦 安装依赖中...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成
) else (
    echo ✅ 依赖已安装
)

echo.
echo ==========================================
echo    🚀 启动开发服务器
echo ==========================================
echo.
echo 正在启动微信小程序开发模式...
echo 启动后请使用微信开发者工具导入项目
echo.

call npm run dev:weapp

pause
