# World Creator (智能世界观与故事构建系统)

World Creator 是一个基于大语言模型（LLM）的全栈应用，旨在帮助创作者、小说家和设定控们快速构建和分析世界观、提取故事时间线、生成角色网络并梳理核心故事线。

## 🌟 核心功能

- **文章与文本分析**：输入长文本或文章，智能提取关键信息。
- **时间线提取 (Timeline Analysis)**：自动从文本中梳理关键事件，生成按时间顺序排列的事件时间线。
- **世界观设定分析 (Worldview Analysis)**：提取文本中的地理环境、社会结构、科技/战力水平及核心设定，自动构建世界观框架。
- **角色关系网络 (Character Network)**：识别出场角色并梳理角色间的复杂关系网络。
- **核心故事线 (Core Storyline)**：归纳和生成主线剧情与核心发展轨迹。
- **缓存管理**：支持数据缓存，提高分析效率并减少 API 请求。

## 🛠 技术栈

### 前端 (Frontend)

- **核心框架**: React 18 + TypeScript + Vite
- **路由管理**: React Router DOM (v7)
- **UI 渲染**: Tailwind CSS (假设使用，或基于原生 CSS/组件库)

### 后端 (Backend)

- **核心框架**: Python 3.9 + Flask
- **AI 编排**: LangChain (基于 `langchain_openai`)
- **模型接入**: 火山引擎 ARK 大模型 API (默认模型 `ep-20260304154408-lf678`)

### 部署与运维

- Docker (多阶段构建，将 React 静态文件打包并由 Flask 提供服务)
- Shell 脚本 (`build.sh`, `bootstrap.sh`)

## 📁 项目结构

```text
world_creator/
├── app.py                  # Flask 后端主入口，处理 API 与静态文件路由
├── input_analyzer.py       # 输入分析器
├── cache_manager.py        # 缓存管理模块
├── archive/                # 核心 AI 生成脚本（角色、故事、时间线、智能 Agent）
├── frontend/               # React 前端代码
│   ├── src/
│   │   ├── components/     # UI 渲染组件 (文章、角色、时间线、世界观等)
│   │   ├── contexts/       # React 状态上下文
│   │   ├── hooks/          # 自定义 Hooks (API 请求与状态管理)
│   │   ├── pages/          # 页面级组件
│   │   ├── App.tsx         # 前端根组件
│   │   └── main.tsx        # 前端入口文件
│   ├── package.json        # 前端依赖配置
│   └── vite.config.ts      # Vite 构建配置
├── tests/                  # 单元测试与集成测试
├── Dockerfile              # Docker 多阶段构建脚本
└── README.md               # 项目说明文档
```

## 🚀 快速开始

### 1. 环境准备

确保您的系统中已安装以下环境：

- Python 3.9+
- Node.js 18+ & npm
- (可选) Docker

### 2. 环境变量配置

在项目根目录创建一个 `.env` 文件，并配置大模型 API 相关的环境变量：

```env
ARK_API_KEY=your_volcengine_ark_api_key
ARK_MODEL=ep-20260304154408-lf678
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
PORT=8080
```

### 3. 本地开发运行

**终端 1：启动后端服务**

```bash
# 创建并激活虚拟环境 (可选)
python -m venv venv
source venv/bin/activate  # Mac/Linux

# 安装后端依赖
pip install -r requirements.txt

# 启动 Flask 服务 (默认运行在 8080 端口)
python app.py
```

**终端 2：启动前端开发服务器**

```bash
cd frontend
npm install
npm run dev
```

打开浏览器访问前端控制台输出的本地地址（通常为 `http://localhost:5173`）。

## 🐳 Docker 部署

项目包含完整的 `Dockerfile`，可以使用 Docker 进行一键多阶段构建与部署：

```bash
# 构建 Docker 镜像
docker build -t world_creator:latest .

# 运行容器
docker run -p 8080:8080 --env-file .env world_creator:latest
```

运行后，访问 `http://localhost:8080` 即可使用系统。
