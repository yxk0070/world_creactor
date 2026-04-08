#!/bin/bash
# Goofy 默认启动脚本

set -ex

echo "==== 启动服务 ===="
# 将构建时安装的第三方包加入 Python 的依赖路径
export PYTHONPATH=$PYTHONPATH:$(pwd)/packages

# 从环境变量获取端口，默认 8080
export PORT=${PORT:-8080}

# 使用 Gunicorn（或者直接使用 python app.py）启动应用
# 这里默认使用自带的 python 直接运行
exec python3 app.py
