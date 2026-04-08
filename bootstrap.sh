#!/bin/bash
# Goofy 默认启动脚本

set -ex

echo "==== 启动服务 ===="

echo "[bootstrap] python version: $(python3 --version 2>&1)"

# 先尝试复用构建阶段打包的依赖（./packages），如果运行时 Python 版本不同导致二进制依赖不兼容，则在 /tmp 下按运行时 Python 版本重新安装
RUNTIME_PACKAGES_DIR=${RUNTIME_PACKAGES_DIR:-/tmp/world_creator_packages}
PY_VER=$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
RUNTIME_MARKER="$RUNTIME_PACKAGES_DIR/.installed_py${PY_VER}"

mkdir -p "$RUNTIME_PACKAGES_DIR"

# 将构建时安装的第三方包加入 Python 的依赖路径
export PYTHONPATH="$RUNTIME_PACKAGES_DIR:$(pwd)/packages:$PYTHONPATH"

if [ -f "./requirements.txt" ] && [ ! -f "$RUNTIME_MARKER" ]; then
  echo "[bootstrap] installing runtime deps to $RUNTIME_PACKAGES_DIR (py${PY_VER})"
  python3 -m pip install --no-cache-dir -r ./requirements.txt -t "$RUNTIME_PACKAGES_DIR"
  touch "$RUNTIME_MARKER"
fi

# 缓存目录（运行时目录只读，需要使用可写路径）
export CACHE_DIR=${CACHE_DIR:-/tmp/world_creator_cache}
mkdir -p "$CACHE_DIR"

# 从环境变量获取端口，默认 8080
export PORT=${PORT:-8080}

exec python3 app.py
