#!/bin/bash

# 确保脚本在错误时退出
set -e

echo "Starting build process..."

# 检查是否安装了 make
if ! command -v make &> /dev/null; then
    echo "make not found, using alternative commands..."
    
    # 获取更新日志和数据
    echo "Fetching data..."
    npm run prebuild

    
    # 构建项目
    echo "Building project..."
    npm run build
else
    echo "make found, using Makefile..."
    make deploy
fi

echo "Build process completed!" 