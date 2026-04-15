# World Creator

World Creator 是一个基于大模型的智能世界观创作、故事线生成与内容管理平台。

## 功能特性
- **生成与分析**: 自动生成世界观、人物、关联关系网、时间线、故事章节、分镜和对话。
- **智能重构**: 基于 Pydantic 的稳定 JSON 生成与解析。
- **管理与展示**: 内置缓存与多模态渲染，支持暗黑/亮色双模式一键切换。
- **极速响应**: 前后端分离架构，通过 Server-Sent Events (SSE) 实现流式输出。

## 环境要求
- Node.js >= 20.0.0
- Python >= 3.10
- Git

## 权威部署方式 (本地/服务器开发模式)

### 1. 克隆代码并准备环境
```bash
git clone <repository_url> world_creator
cd world_creator
```

### 2. 配置后端 (Python)
```bash
# 推荐使用 venv 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入您的 ARK_API_KEY 和模型端点
```

### 3. 配置前端 (React/Vite)
```bash
cd frontend
npm install
# 构建前端静态文件
npm run build
cd ..
```

### 4. 启动应用
由于 Flask 后端已经配置了对 `frontend/dist` 的静态文件托管代理，只需启动一个后端服务即可：

```bash
# 确保虚拟环境已激活
source venv/bin/activate

# 启动后端 (默认端口 8080)
PORT=8080 python app.py
```
> 服务启动后，打开浏览器访问 [http://localhost:8080](http://localhost:8080) 即可开始创作。

## 目录结构
```text
.
├── app.py                  # Flask 后端主入口
├── cache/                  # 缓存数据与存储逻辑
├── routes/                 # API 路由拆分
├── services/               # 业务逻辑与 LLM 服务
├── schemas/                # Pydantic 校验 Schema
├── frontend/               # React + Vite 前端应用
└── requirements.txt        # Python 依赖
```

## 开发者指令
**前端开发模式 (热更新):**
```bash
cd frontend
npm run dev
```
**代码检查 (Lint):**
```bash
cd frontend
npm run lint
npm run format
```
