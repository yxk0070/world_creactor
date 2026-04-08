# 使用带有 Node 和 Python 的多阶段构建来部署全栈应用

# 阶段1：构建 React 前端静态文件
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend
# 先复制 package.json 和 package-lock.json 利用缓存
COPY frontend/package*.json ./
RUN npm install

# 复制前端代码并打包
COPY frontend/ ./
RUN npm run build


# 阶段2：配置 Python 运行环境
FROM python:3.9-slim

# 设置工作目录
WORKDIR /app

# 设置环境变量，防止 python 缓冲输出
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# 安装后端依赖
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 复制后端代码
COPY . .

# 从前端构建阶段复制打包好的 dist 目录到后端相应的静态托管目录
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# 暴露给 Goofy 的端口
EXPOSE ${PORT}

# 启动 Flask 服务
CMD ["python", "app.py"]
