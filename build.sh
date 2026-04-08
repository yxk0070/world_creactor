#!/bin/bash
# Goofy 默认构建脚本

set -ex

echo "==== 开始构建前端 ===="
cd frontend
npm install
npm run build
cd ..
echo "==== 前端构建完成 ===="

echo "==== 安装 Python 依赖 ===="
# 如果是在非容器化（物理机/虚拟机）环境，可以通过 pip 安装依赖
# 将依赖安装到当前项目目录下以防权限问题
pip3 install -r requirements.txt -t ./packages
echo "==== Python 依赖安装完成 ===="
