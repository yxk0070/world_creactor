# K-Agent 故事创作系统

一个基于 LangChain 的智能故事创作系统，支持世界观生成、人物创建、故事线编写和关系网构建。

## 项目概述

K-Agent 是一个功能强大的 AI 辅助故事创作平台，它可以帮助创作者：

- 🌍 生成完整的虚构世界观（包括地理、社会结构、历史背景等）
- 👤 创建生动的人物角色（包括背景、性格、能力、人生经历等）
- 📜 编写核心故事线（基于世界观和人物生成关键事件）
- 🕸️ 构建复杂的人物关系网（自动生成角色之间的关系）
- 💾 智能缓存管理（保存和复用所有生成内容）

## 技术栈

- **后端**: Python + Flask + LangChain
- **前端**: React + Vite
- **AI 模型**: OpenAI GPT / 火山引擎方舟
- **缓存系统**: JSON 文件存储

## 项目结构

```
k_Agent_test_1/
├── app.py                      # Flask 后端主应用
├── cache_manager.py            # 缓存管理模块
├── input_analyzer.py           # 输入分析模块
├── .env.example               # 环境变量示例
├── requirements.txt           # Python 依赖
├── frontend/                  # React 前端项目
│   ├── src/
│   │   ├── components/       # 通用组件
│   │   │   ├── CharacterRenderer.jsx    # 人物展示组件
│   │   │   ├── StorylineRenderer.jsx    # 故事线展示组件
│   │   │   ├── WorldviewRenderer.jsx    # 世界观展示组件
│   │   │   └── JsonRenderer.jsx         # JSON 展示组件
│   │   └── pages/            # 页面组件
│   │       ├── WorldviewPage.jsx        # 世界观生成页面
│   │       ├── CharactersPage.jsx        # 人物生成页面
│   │       ├── CharacterNetworkPage.jsx  # 关系网生成页面
│   │       ├── CoreStorylinePage.jsx     # 故事线生成页面
│   │       └── CachePage.jsx             # 缓存管理页面
│   ├── package.json
│   └── vite.config.js
├── docs/                     # 文档目录
├── tests/                    # 测试文件
└── cache/                    # 缓存数据目录（自动创建）
```

## 功能模块

### 1. 世界观生成

- 支持多种题材（仙侠、科幻、奇幻、现代等）
- 自动生成世界名称、基础设定、地理环境
- 构建社会结构、历史背景和主要势力
- 完整世界生成模式（一键生成完整世界观）

### 2. 人物创建

- 基于世界观创建人物
- 自动生成外貌、性格、背景故事
- 定义人物能力和技能
- 生成完整的人生经历时间线
- 支持生成关联人物

### 3. 故事线编写

- 从世界观和人物中选择素材
- 自动生成故事主题和关键事件
- 时间线式展示故事情节
- 支持导入人物关系网

### 4. 关系网构建

- 自动分析人物关系
- 生成关系描述和互动历史
- 支持自定义关系类型
- 可视化展示关系网络

### 5. 缓存管理

- 自动保存所有生成内容
- 分类管理（世界观、人物、故事线等）
- 搜索和筛选功能
- 支持删除和清空操作

## 快速开始

### 前置条件

- Python 3.8+
- Node.js 16+
- OpenAI API Key 或火山引擎方舟 API Key

### 后端安装

1. 克隆项目

```bash
git clone https://github.com/yxk0070/k_Agent_test_1.git
cd k_Agent_test_1
```

2. 创建虚拟环境

```bash
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# 或
.\venv\Scripts\activate  # Windows
```

3. 安装依赖

```bash
pip install -r requirements.txt
```

4. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，填入你的 API Key
```

5. 启动后端服务

```bash
python3 app.py
```

后端服务将在 `http://localhost:8080` 启动

### 前端安装

1. 进入前端目录

```bash
cd frontend
```

2. 安装依赖

```bash
npm install
```

3. 启动开发服务器

```bash
npm run dev
```

前端将在 `http://localhost:5173` 启动

4. 构建生产版本

```bash
npm run build
```

## 环境变量配置

编辑 `.env` 文件，配置以下变量：

### 使用 OpenAI

```
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 使用火山引擎方舟

```
ARK_API_KEY=your-ark-api-key-here
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
ARK_MODEL=ep-your-endpoint-id
```

## 使用指南

### 1. 创建世界观

1. 访问世界观生成页面
2. 输入世界名称和题材
3. 填写基础设定（可选）
4. 点击"生成世界观"或"生成完整世界"
5. 查看生成结果并保存

### 2. 创建人物

1. 访问人物生成页面
2. 选择关联的世界观
3. 输入人物姓名和角色定位
4. 填写性格特质（可选）
5. 点击"生成人物"
6. 查看人物详情

### 3. 编写故事线

1. 访问核心故事线页面
2. 选择世界观和人物
3. 输入故事主题
4. 点击"生成核心故事线"
5. 查看时间线式的故事展示

### 4. 构建关系网

1. 访问人物关系网页面
2. 选择世界观
3. 从列表中选择人物
4. 点击"生成关系网"
5. 查看人物之间的关系

## API 接口

### 生成世界观

```
POST /api/generate/worldview
Content-Type: application/json

{
  "world_name": "玄灵界",
  "genre": "仙侠",
  "basic_settings": "高魔世界"
}
```

### 生成人物

```
POST /api/generate/character
Content-Type: application/json

{
  "name": "李云飞",
  "role": "主角",
  "worldview_id": "xxx"
}
```

### 获取缓存

```
GET /api/cache/all
```

### 清空缓存

```
POST /api/cache/clear
```

## 开发指南

### 添加新工具

在 `app.py` 中使用 `@tool` 装饰器添加新工具：

```python
from langchain.tools import tool

@tool
def my_custom_tool(param: str) -> str:
    """工具描述"""
    return "结果"
```

### 添加新页面

1. 在 `frontend/src/pages/` 创建新页面组件
2. 在 `App.jsx` 中添加路由
3. 在导航菜单中添加链接

### 自定义渲染器

在 `frontend/src/components/` 创建新的渲染器组件，类似 `CharacterRenderer.jsx`

## 测试

运行测试：

```bash
pytest tests/
```

## 常见问题

### Q: 后端启动失败？

A: 检查端口 8080 是否被占用，或在 `app.py` 中修改端口。

### Q: 前端无法连接后端？

A: 确保后端服务已启动，检查 `vite.config.js` 中的代理配置。

### Q: API 调用报错？

A: 检查 `.env` 文件中的 API Key 是否正确配置。

### Q: 生成速度慢？

A: 这取决于 AI 模型的响应速度，可以尝试更换模型或调整参数。

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题，请通过 GitHub Issues 联系。
