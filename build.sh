#!/bin/bash
# Goofy 构建脚本：产物输出到 ./output 目录供 SCM 打包

set -ex

ROOT_DIR=$(pwd)
OUTPUT_DIR="$ROOT_DIR/output"
OUTPUT_RESOURCE_DIR="$ROOT_DIR/output_resource"

rm -rf "$OUTPUT_DIR" "$OUTPUT_RESOURCE_DIR"
mkdir -p "$OUTPUT_DIR" "$OUTPUT_RESOURCE_DIR"

echo "==== 开始构建前端 ===="
cd "$ROOT_DIR/frontend"
npm install
npm run build
cd "$ROOT_DIR"
echo "==== 前端构建完成 ===="

echo "==== 安装 Python 依赖 ===="
mkdir -p "$OUTPUT_DIR/packages"
pip3 install -r requirements.txt -t "$OUTPUT_DIR/packages"
echo "==== Python 依赖安装完成 ===="

echo "==== 组装 Goofy 运行产物 ===="
cp "$ROOT_DIR/app.py" "$OUTPUT_DIR/app.py"
cp "$ROOT_DIR/input_analyzer.py" "$OUTPUT_DIR/input_analyzer.py"
cp "$ROOT_DIR/cache_manager.py" "$OUTPUT_DIR/cache_manager.py"
cp -r "$ROOT_DIR/archive" "$OUTPUT_DIR/archive"

mkdir -p "$OUTPUT_DIR/frontend"
cp -r "$ROOT_DIR/frontend/dist" "$OUTPUT_DIR/frontend/dist"

# 资源产物目录：供 SCM 资源包打包（静态文件）
cp -r "$ROOT_DIR/frontend/dist/." "$OUTPUT_RESOURCE_DIR/"

cp "$ROOT_DIR/bootstrap.sh" "$OUTPUT_DIR/bootstrap.sh"
chmod +x "$OUTPUT_DIR/bootstrap.sh"

cp "$ROOT_DIR/deploy.yml" "$OUTPUT_DIR/deploy.yml"
cp "$ROOT_DIR/deploy.yml" "$OUTPUT_RESOURCE_DIR/deploy.yml"

echo "==== 产物目录已生成：$OUTPUT_DIR ===="
