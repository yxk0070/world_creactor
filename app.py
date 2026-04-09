import warnings
import os
import json
import time
from datetime import datetime
warnings.filterwarnings("ignore", category=DeprecationWarning)
warnings.filterwarnings("ignore", category=UserWarning)

from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify, send_file
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent, create_openai_functions_agent
from langchain.tools import tool
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from input_analyzer import analyzer
from cache_manager import cache_manager


load_dotenv()
print("[DEBUG] Flask app 正在初始化...")

app = Flask(__name__, 
            static_folder='frontend/dist', 
            static_url_path='')


@app.route('/')
@app.route('/<path:path>')
def index(path=None):
    """提供前端页面（支持 SPA 路由）"""
    import os
    # 如果是 API 请求，直接让 Flask 处理
    if path and path.startswith('api/'):
        return jsonify({'error': 'Not Found'}), 404
    
    # 检查静态文件是否存在
    if path:
        static_path = os.path.join(os.path.dirname(__file__), 'frontend', 'dist', path)
        if os.path.exists(static_path) and not os.path.isdir(static_path):
            return app.send_static_file(path)
    
    # 返回 index.html 让 React Router 处理
    frontend_path = os.path.join(os.path.dirname(__file__), 'frontend', 'dist', 'index.html')
    return send_file(frontend_path)


@tool
def extract_timeline(article: str) -> str:
    """
    从文章中提取事件时间线。当用户需要分析一篇文章、整理时间线、
    或者想要了解某个事件的发展过程时使用此工具。
    
    Args:
        article: 要分析的文章文本
        
    Returns:
        JSON格式的事件时间线
    """
    print(f"[DEBUG] extract_timeline 被调用，文章长度: {len(article)}")
    
    llm = ChatOpenAI(
        model=os.getenv("ARK_MODEL", "ep-20260304154408-lf678"),
        api_key=os.getenv("ARK_API_KEY"),
        base_url=os.getenv("ARK_BASE_URL", "https://ark.cn-beijing.volces.com/api/v3"),
        temperature=0.7
    )
    
    prompt = f"""请从以下文章中提取关键事件，以时间线的形式整理出来。请严格返回以下JSON格式（不要包含任何Markdown代码块如```json，直接返回纯JSON文本）：

{{
  "tool": "extract_timeline",
  "status": "completed",
  "data": {{
    "events": [
      {{
        "number": 1,
        "title": "事件标题",
        "time": "时间",
        "location": "地点",
        "description": "事件描述",
        "characters": ["关键人物1", "关键人物2"],
        "importance": "高/中/低"
      }}
    ]
  }}
}}

请确保每个事件都有编号、标题、时间、地点、描述、关键人物和重要性。请按照时间顺序排列事件。

文章内容：
{article}"""

    response = llm.invoke(prompt)
    result_text = response.content
    
    # 清理可能存在的 Markdown 代码块
    result_text = result_text.strip()
    if result_text.startswith("```json"):
        result_text = result_text[7:]
    elif result_text.startswith("```"):
        result_text = result_text[3:]
    if result_text.endswith("```"):
        result_text = result_text[:-3]
    result_text = result_text.strip()
    
    try:
        json.loads(result_text)
        return result_text
    except Exception as e:
        print(f"[DEBUG] extract_timeline JSON 解析失败: {e}, 原始内容: {result_text[:100]}...")
        return json.dumps({
            "tool": "extract_timeline",
            "status": "completed",
            "data": {
                "events": [
                    {
                        "number": 1,
                        "title": "分析完成",
                        "time": "已提取",
                        "location": "全文",
                        "description": result_text[:500] + "..." if len(result_text) > 500 else result_text,
                        "characters": [],
                        "importance": "高"
                    }
                ]
            }
        }, ensure_ascii=False)


@tool
def analyze_worldview(article: str) -> str:
    """
    从文章中提取世界观内容。当用户提供了一篇文章、小说片段、
    或者需要从已有文本中分析和提取世界观设定时使用此工具。
    
    Args:
        article: 要分析的文章文本
        
    Returns:
        JSON格式的世界观分析结果
    """
    print(f"[DEBUG] analyze_worldview 被调用，文章长度: {len(article)}")
    
    llm = ChatOpenAI(
        model=os.getenv("ARK_MODEL", "ep-20260304154408-lf678"),
        api_key=os.getenv("ARK_API_KEY"),
        base_url=os.getenv("ARK_BASE_URL", "https://ark.cn-beijing.volces.com/api/v3"),
        temperature=0.7
    )
    
    prompt = f"""请从以下文章中分析和提取世界观设定。请严格返回以下JSON格式（不要包含任何Markdown代码块如```json，直接返回纯JSON文本）：

{{
  "tool": "analyze_worldview",
  "status": "completed",
  "data": {{
    "world_name": "世界观名称",
    "basic_settings": {{
      "genre": "题材类型（如：奇幻/科幻/武侠/现代等）",
      "combat_power_level": "个体战斗力水平（无/低/中等/高/极高）",
      "technology_level": "科技水平（古代/近代/现代/未来）",
      "core_theme": "核心主题"
    }},
    "geography": "地理环境描述",
    "social_structure": "社会结构描述",
    "key_locations": ["关键地点1", "关键地点2"],
    "important_concepts": ["重要概念1", "重要概念2"],
    "summary": "世界观总结"
  }}
}}

文章内容：
{article}"""

    response = llm.invoke(prompt)
    result_text = response.content
    
    # 清理可能存在的 Markdown 代码块
    result_text = result_text.strip()
    if result_text.startswith("```json"):
        result_text = result_text[7:]
    elif result_text.startswith("```"):
        result_text = result_text[3:]
    if result_text.endswith("```"):
        result_text = result_text[:-3]
    result_text = result_text.strip()
    
    try:
        # 验证是否为有效JSON
        json.loads(result_text)
        return result_text
    except Exception as e:
        print(f"[DEBUG] analyze_worldview JSON 解析失败: {e}, 原始内容: {result_text[:100]}...")
        # 如果解析失败，构造一个安全的 JSON 返回
        safe_data = {
            "tool": "analyze_worldview",
            "status": "completed",
            "data": {
                "world_name": "分析世界观",
                "basic_settings": {
                    "genre": "待分析",
                    "combat_power_level": "未知",
                    "technology_level": "未知",
                    "core_theme": "待提取"
                },
                "geography": result_text[:500] + "..." if len(result_text) > 500 else result_text,
                "social_structure": "分析失败，请检查文章内容",
                "key_locations": [],
                "important_concepts": [],
                "summary": "世界观分析完成，但由于格式问题无法完整展示"
            }
        }
        return json.dumps(safe_data, ensure_ascii=False)


@tool
def generate_story(time: str = "未指定时间", place: str = "未指定地点", characters: str = "未指定人物", genre: str = "冒险", story_scale: str = "中等", worldview: str = "", generate_details: bool = False) -> str:
    """
    生成核心故事线。当用户需要创作故事、生成故事线、
    或者提供了时间地点人物/世界观信息想要生成故事时使用此工具。
    
    Args:
        time: 故事发生的时间（可选）
        place: 故事发生的地点（可选）
        characters: 故事的主要人物（可选）
        genre: 故事类型（冒险/悬疑/爱情/科幻/童话等）
        story_scale: 故事规模（简短/中等/长篇）
        worldview: 世界观背景（可选）。如果提供了世界观，故事必须严格在该世界观的设定下发生，不能随意穿越或脱离该世界观。
        generate_details: 是否同时为故事线中的每个关键事件生成5-8个细节节点（默认False）
        
    Returns:
        JSON格式的故事生成信息
    """
    print(f"[DEBUG] generate_story 被调用，time={time}, place={place}, characters={characters}, worldview={worldview}, generate_details={generate_details}")
    return json.dumps({
        "tool": "generate_story",
        "status": "processing",
        "parameters": {
            "time": time,
            "place": place,
            "characters": characters,
            "genre": genre,
            "story_scale": story_scale,
            "worldview": worldview,
            "generate_details": generate_details
        }
    }, ensure_ascii=False)

@tool
def expand_story_event(story_context: str, event_title: str, event_description: str) -> str:
    """
    对故事线中的某个核心事件节点进行展开，生成5-8个细节子节点。
    当用户选择了一个故事事件，并要求补充细节节点时使用此工具。
    
    Args:
        story_context: 完整的故事背景/核心主题上下文
        event_title: 需要展开的事件标题
        event_description: 需要展开的事件描述
        
    Returns:
        JSON格式的事件细节节点生成信息
    """
    print(f"[DEBUG] expand_story_event 被调用，event_title={event_title}")
    return json.dumps({
        "tool": "expand_story_event",
        "status": "processing",
        "parameters": {
            "story_context": story_context,
            "event_title": event_title,
            "event_description": event_description
        }
    }, ensure_ascii=False)


@tool
def generate_worldview(genre: str, theme: str = "", combat_power_level: str = "中等", technology_level: str = "现代", factions_count: int = 3) -> str:
    """
    生成完整的世界观设定。当用户需要创建一个虚构世界的设定、
    或者提到"世界观"、"世界设定"、"创建世界"等关键词时使用此工具。
    
    Args:
        genre: 世界观类型（奇幻/科幻/玄幻/武侠/现代/末世等）
        theme: 世界观主题（可选，如"魔法与科技共存"、"龙族统治"等）
        combat_power_level: 个体战斗力水平（无/低/中等/高/极高）
        technology_level: 科技水平（古代/中世纪/工业革命/现代/未来）
        factions_count: 势力数量（默认3个）
        
    Returns:
        JSON格式的世界观生成信息
    """
    print(f"[DEBUG] generate_worldview 被调用，genre={genre}, theme={theme}, combat_power_level={combat_power_level}, technology_level={technology_level}, factions_count={factions_count}")
    return json.dumps({
        "tool": "generate_worldview",
        "status": "processing",
        "parameters": {
            "genre": genre,
            "theme": theme,
            "combat_power_level": combat_power_level,
            "technology_level": technology_level,
            "factions_count": factions_count
        }
    }, ensure_ascii=False)


@tool
def generate_character(worldview: str, role: str = "主角", personality_traits: str = "", background: str = "", is_important: bool = True) -> str:
    """
    结合世界观生成人物设定。当用户需要为某个世界观创建人物、
    或者提到"创建人物"、"生成角色"、"人物设定"等关键词时使用此工具。
    
    Args:
        worldview: 世界观背景描述或世界观名称
        role: 人物角色（主角/配角/反派/导师/盟友等）
        personality_traits: 性格特质（可选，如"勇敢、机智、内向"等）
        background: 人物背景故事（可选）
        is_important: 是否为重要人物（true/false，默认true）
        
    Returns:
        JSON格式的人物生成信息
    """
    print(f"[DEBUG] generate_character 被调用，worldview={worldview}, role={role}, personality={personality_traits}, background={background}, is_important={is_important}")
    return json.dumps({
        "tool": "generate_character",
        "status": "processing",
        "parameters": {
            "worldview": worldview,
            "role": role,
            "personality_traits": personality_traits,
            "background": background,
            "is_important": is_important
        }
    }, ensure_ascii=False)


@tool
def generate_related_character(base_character: str, relation_type: str = "朋友", role: str = "配角", worldview: str = "", is_important: bool = False) -> str:
    """
    根据已有角色生成关联人物。当用户提到"为某某生成朋友"、"创建某某的敌人"、
    "生成某某的家人"、"关联人物"等关键词时使用此工具。
    
    Args:
        base_character: 基础人物名称或描述
        relation_type: 关系类型（朋友/敌人/家人/爱人/导师/对手等）
        role: 关联人物的角色（主角/配角/反派/导师/盟友等）
        worldview: 世界观背景（可选）
        is_important: 是否为重要人物（true/false，默认false）
        
    Returns:
        JSON格式的关联人物生成信息
    """
    print(f"[DEBUG] generate_related_character 被调用，base_character={base_character}, relation={relation_type}, role={role}, is_important={is_important}")
    return json.dumps({
        "tool": "generate_related_character",
        "status": "processing",
        "parameters": {
            "base_character": base_character,
            "relation_type": relation_type,
            "role": role,
            "worldview": worldview,
            "is_important": is_important
        }
    }, ensure_ascii=False)


@tool
def generate_article_from_event(event_description: str, context: str = "", style: str = "叙事") -> str:
    """
    根据事件线里面的某个事件节点生成具体文章。当用户需要将一句话的事件展开成详细的文章、片段或小说章节时使用此工具。
    
    Args:
        event_description: 事件节点的描述
        context: 世界观、人物背景等上下文信息（可选）
        style: 文章风格，可选值包括：叙事、抒情、写实、剧本、史诗、武侠、悬疑、二次元、古典小说、书面报告、翻译腔、评书等
        
    Returns:
        JSON格式的文章生成信息
    """
    print(f"[DEBUG] generate_article_from_event 被调用，event={event_description}, style={style}")
    return json.dumps({
        "tool": "generate_article_from_event",
        "status": "processing",
        "parameters": {
            "event_description": event_description,
            "context": context,
            "style": style
        }
    }, ensure_ascii=False)

@tool
def generate_dialogue(event_description: str, characters: str = "", context: str = "", style: str = "日常交谈") -> str:
    """
    生成一段对话文案。当用户需要根据事件生成角色之间的详细对话或互动文案时使用此工具。
    
    Args:
        event_description: 事件节点的描述
        characters: 参与对话的人物（可选）
        context: 场景背景等上下文信息（可选）
        style: 对话风格，如日常交谈、激烈争吵、暗流涌动等
        
    Returns:
        JSON格式的对话生成信息
    """
    print(f"[DEBUG] generate_dialogue 被调用，event={event_description}, characters={characters}, style={style}")
    return json.dumps({
        "tool": "generate_dialogue",
        "status": "processing",
        "parameters": {
            "event_description": event_description,
            "characters": characters,
            "context": context,
            "style": style
        }
    }, ensure_ascii=False)

@tool
def generate_short_script(event_description: str, context: str = "", style: str = "快节奏分镜") -> str:
    """
    生成短句脚本/分镜脚本。当用户需要将事件转换为简短的镜头脚本、短视频文案或分镜描述时使用此工具。
    
    Args:
        event_description: 事件节点的描述
        context: 场景背景等上下文信息（可选）
        style: 脚本风格，如快节奏分镜、情绪慢镜头、混剪风格等
        
    Returns:
        JSON格式的短句脚本生成信息
    """
    print(f"[DEBUG] generate_short_script 被调用，event={event_description}, style={style}")
    return json.dumps({
        "tool": "generate_short_script",
        "status": "processing",
        "parameters": {
            "event_description": event_description,
            "context": context,
            "style": style
        }
    }, ensure_ascii=False)

@tool
def generate_character_network(worldview: str = "", core_characters: list = None, network_size: int = 3, relationship_types: str = "") -> str:
    """
    生成人物关系网。当用户提到"人物关系网"、"关系网"、"社交网络"等关键词时使用此工具。
    
    Args:
        worldview: 世界观背景（可选）
        core_characters: 核心人物列表（可选）
        network_size: 需要生成的新人物数量（默认3个）
        relationship_types: 关系类型偏好（可选，如"爱情、友情、敌对"）
        
    Returns:
        JSON格式的人际关系网生成信息
    """
    if core_characters is None:
        core_characters = []
        
    print(f"[DEBUG] generate_character_network 被调用，worldview={worldview}, core_characters={core_characters}, size={network_size}")
    return json.dumps({
        "tool": "generate_character_network",
        "status": "processing",
        "parameters": {
            "worldview": worldview,
            "core_characters": core_characters,
            "network_size": network_size,
            "relationship_types": relationship_types
        }
    }, ensure_ascii=False)

from pydantic import BaseModel, Field

class TaskStep(BaseModel):
    step: int = Field(description="步骤序号")
    tool: str = Field(description="使用的工具名称")
    description: str = Field(description="步骤描述")
    parameters: dict = Field(description="传递给工具的参数")

class TaskPlan(BaseModel):
    plan: list[TaskStep] = Field(description="按顺序排列的执行步骤列表")

def get_research_agent_executor(scenario: str = "小说"):
    """
    获取研究员 Agent 执行器，用于将复杂的用户输入拆解成具体的任务步骤
    """
    print("[DEBUG] 初始化研究员 Agent...")
    api_key = os.getenv("ARK_API_KEY")
    base_url = os.getenv("ARK_BASE_URL", "https://ark.cn-beijing.volces.com/api/v3")
    model = os.getenv("ARK_MODEL", "ep-20260304154408-lf678")
    
    llm = ChatOpenAI(
        model=model,
        temperature=0.3,
        openai_api_key=api_key,
        openai_api_base=base_url
    )

    system_prompt = f"""你是一个专业的 AI 任务拆解研究员。
你的任务是将用户复杂的创作需求，拆解成一系列可以由基础 AI 工具按顺序执行的步骤。

当前用户的创作使用场景是：【{scenario}】。
请在拆解任务和规划工具参数时，确保生成的内容风格、设定侧重点等高度符合该场景的需求。
例如：
- 游戏场景：注重数值体系、关卡设计、派系平衡和互动性机制。
- 小说场景：注重剧情张力、人物心理描写、环境烘托和文学性设定。
- 剧本场景：注重对话、场景调度、镜头感、动作描写。

目前我们支持以下基础工具（你的拆解步骤只能使用这些工具）：
1. generate_worldview - 生成完整的世界观设定（需要指定 genre、theme 等）
2. generate_character - 结合世界观生成单个人物设定（需要指定 worldview、role 等）
3. generate_related_character - 根据已有角色生成关联人物
4. generate_character_network - 生成多个人物之间复杂的关系网
5. generate_story - 根据时间、地点、人物等信息创作核心故事线
6. extract_timeline - 用于分析文章并提取事件时间线
7. analyze_worldview - 用于从文章中提取和分析世界观内容
8. generate_article_from_event - 根据事件节点生成具体文章
9. generate_dialogue - 根据事件生成角色间的对话文案
10. generate_short_script - 根据事件生成短句/分镜脚本

【输出要求】
你必须返回一个严格的 JSON 格式数组，数组中每个元素代表一个执行步骤。不要包含任何 markdown 标记或其他说明文字！
如果用户的需求很简单（比如只生成一篇文章或一个人物），你可以只返回一个包含一个步骤的数组。
如果用户的需求很复杂（比如"帮我生成一个末日世界，里面有个叫张三的主角，然后写一个他找物资的故事"），你需要拆解为多步（如：1.生成世界观，2.生成人物，3.生成故事）。

JSON 格式示例：
[
  {{{{
    "step": 1,
    "tool": "generate_worldview",
    "description": "生成末日世界观",
    "parameters": {{{{
      "genre": "末世",
      "theme": "寻找物资"
    }}}}
  }}}},
  {{{{
    "step": 2,
    "tool": "generate_character",
    "description": "生成主角张三",
    "parameters": {{{{
      "name": "张三",
      "role": "主角"
    }}}}
  }}}}
]
"""
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("user", "{input}")
    ])
    
    # 去掉 with_structured_output，以便我们可以流式解析
    chain = prompt | llm
    return chain

def get_agent_executor(scenario: str = "小说"):
    """
    获取 agent 执行器
    """
    print("[DEBUG] 初始化 Agent...")
    api_key = os.getenv("ARK_API_KEY")
    base_url = os.getenv("ARK_BASE_URL", "https://ark.cn-beijing.volces.com/api/v3")
    model = os.getenv("ARK_MODEL", "ep-20260304154408-lf678")
    
    print(f"[DEBUG] API Key: {api_key[:10] if api_key else 'None'}...")
    print(f"[DEBUG] Base URL: {base_url}")
    print(f"[DEBUG] Model: {model}")
    
    llm = ChatOpenAI(
        model=model,
        temperature=0.7,
        max_tokens=8192,
        openai_api_key=api_key,
        openai_api_base=base_url
    )
    
    tools = [extract_timeline, analyze_worldview, generate_story, expand_story_event, generate_worldview, generate_character, generate_related_character, generate_article_from_event, generate_dialogue, generate_short_script, generate_character_network]

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", f"""你是一个智能助手，可以根据用户的需求选择合适的工具来完成任务。
当前用户的创作使用场景是：【{scenario}】。
请确保所有生成的内容（世界观、人物、故事等）都高度契合该场景的特点：
- 游戏场景：生成的数据需注重系统机制、数值概念、派系势力平衡、关卡地形设计和玩家互动性。
- 小说场景：生成的数据需注重剧情悬念张力、深刻的人物心理与动机描写、环境氛围烘托和文学性。
- 剧本场景：生成的数据需注重角色间的台词对话、场景内外调度、镜头表现感和具体的动作指示。

你有十一个工具可用：
1. extract_timeline - 用于分析文章并提取事件时间线
2. analyze_worldview - 用于从文章中提取和分析世界观内容
3. generate_story - 用于根据时间、地点、人物等信息创作故事
4. expand_story_event - 用于对故事线中的某个核心事件节点进行展开，生成细节子节点
5. generate_worldview - 用于生成完整的世界观设定
6. generate_character - 用于结合世界观生成人物设定
7. generate_related_character - 用于根据已有角色生成关联人物（朋友、敌人、家人等）
8. generate_article_from_event - 用于根据事件线中的某个事件节点生成具体文章
9. generate_character_network - 用于生成多个人物之间复杂的关系网
10. generate_dialogue - 用于根据事件生成角色间的对话文案
11. generate_short_script - 用于根据事件生成短句/分镜脚本

【判断规则】
- 如果用户提供了一篇文章、或者提到"分析"、"梳理"、"时间线"、"事件发展"等关键词 → 使用 extract_timeline
- 如果用户提供了一篇文章、小说片段，或者提到"分析世界观"、"提取世界观"、"从文章中分析"等关键词 → 使用 analyze_worldview
- 如果用户提供了时间、地点、人物等信息，或者提到"写故事"、"创作"、"编故事"等关键词 → 使用 generate_story
- 如果用户提到"展开事件"、"补充细节"、"生成细节节点"等关键词 → 使用 expand_story_event
- 如果用户提到"世界观"、"世界设定"、"创建世界"、"设定世界"等关键词 → 使用 generate_worldview
- 如果用户提到"人物"、"角色"、"创建人物"、"生成角色"、"人物设定"等关键词（没有强调关系网） → 使用 generate_character
- 如果用户提到"为某某生成朋友"、"创建某某的敌人"、"生成某某的家人"等单一关联人物关键词 → 使用 generate_related_character
- 如果用户提到"根据事件生成文章"、"描写这个事件"等关键词 → 使用 generate_article_from_event
- 如果用户提到"生成人物关系网"、"关系网"、"多个人物之间的关系"等关键词 → 使用 generate_character_network
- 如果用户提到"对话"、"对话文案"、"角色交流"等关键词 → 使用 generate_dialogue
- 如果用户提到"短句"、"脚本"、"分镜"等关键词 → 使用 generate_short_script
- 如果信息不完整，先询问用户需要什么类型的帮助

【重要要求】
所有输出必须是严格的 JSON 格式，不要包含任何额外的文字说明！

【重要人物判断规则】
使用 generate_character 或 generate_related_character 时，is_important 参数的判断规则：
- 如果人物角色是主角、反派、导师或核心配角 → is_important = true
- 如果人物角色是路人配角 → is_important = false
- generate_related_character 默认 is_important = false，除非用户特别说明是重要人物或核心配角
- is_important = true 的人物需要生成从出生到死亡的完整经历
- 如果用户提供了人物简介/背景故事，请务必在生成时参考并扩展该背景故事

【人物生成 JSON 格式】
如果使用 generate_character，请返回以下 JSON 格式：
{{{{
  "tool": "generate_character",
  "status": "completed",
  "data": {{{{
    "name": "人物姓名",
    "basic_info": {{{{
      "role": "角色定位",
      "age": "年龄",
      "appearance": "外貌特征",
      "is_important": true/false
    }}}},
    "personality": "性格特质",
    "background": "背景故事",
    "abilities": ["能力1", "能力2"],
    "position_in_world": "在世界观中的位置",
    "life_experience": {{{{
      "birth": "出生背景",
      "childhood": "童年经历",
      "growth": "成长历程",
      "major_events": ["重大事件1", "重大事件2"],
      "death": "死亡结局（如适用）"
    }}}}
  }}}}
}}}}

【关联人物生成 JSON 格式】
如果使用 generate_related_character，请返回以下 JSON 格式：
{{{{
  "tool": "generate_related_character",
  "status": "completed",
  "data": {{{{
    "name": "人物姓名",
    "basic_info": {{{{
      "role": "角色定位",
      "age": "年龄",
      "appearance": "外貌特征",
      "is_important": true/false
    }}}},
    "personality": "性格特质",
    "background": "背景故事",
    "abilities": ["能力1", "能力2"],
    "position_in_world": "在世界观中的位置",
    "life_experience": {{{{
      "birth": "出生背景",
      "childhood": "童年经历",
      "growth": "成长历程",
      "major_events": ["重大事件1", "重大事件2"],
      "death": "死亡结局（如适用）"
    }}}},
    "relationships": [
      {{{{
        "target": "基础人物姓名",
        "type": "关系类型",
        "description": "关系描述"
      }}}}
    ]
  }}}}
}}}}

【世界观生成 JSON 格式】
如果使用 generate_worldview，请返回以下 JSON 格式：
{{{{
  "tool": "generate_worldview",
  "status": "completed",
  "data": {{{{
    "world_name": "（根据主题自由发挥创造一个有创意的专属世界名称，切勿直接使用样例名称）",
    "basic_settings": {{{{
      "genre": "世界类型",
      "magic_level": "魔法水平",
      "technology_level": "科技水平",
      "core_theme": "核心主题"
    }}}},
    "geography": "地理环境描述",
    "social_structure": "社会结构描述",
    "history": "历史背景描述",
    "factions": [
      {{{{
        "name": "势力名称",
        "description": "势力描述",
        "leader": "领袖人物",
        "territory": "控制区域",
        "ideology": "核心理念",
        "strengths": ["优势1", "优势2"],
        "weaknesses": ["劣势1", "劣势2"]
      }}}}
    ]
  }}}}
}}}}

【世界观分析 JSON 格式】
如果使用 analyze_worldview，请返回以下 JSON 格式（与 generate_worldview 保持一致）：
{{{{
  "tool": "analyze_worldview",
  "status": "completed",
  "data": {{{{
    "world_name": "世界名称",
    "basic_settings": {{{{
      "genre": "世界类型",
      "magic_level": "魔法水平/个体战斗力水平",
      "technology_level": "科技水平",
      "core_theme": "核心主题"
    }}}},
    "geography": "地理环境描述",
    "social_structure": "社会结构描述",
    "history": "历史背景描述",
    "factions": [
      {{{{
        "name": "势力名称",
        "description": "势力描述",
        "leader": "领袖人物",
        "territory": "控制区域",
        "ideology": "核心理念",
        "strengths": ["优势1", "优势2"],
        "weaknesses": ["劣势1", "劣势2"]
      }}}}
    ]
  }}}}
}}}}

【故事生成 JSON 格式】
如果使用 generate_story，请返回以下 JSON 格式。要求生成多个关键事件串联成完整故事：
{{{{
  "tool": "generate_story",
  "status": "completed",
  "data": {{{{
    "title": "故事标题",
    "story_scale": "故事规模（简短/中等/长篇）",
    "genre": "故事类型",
    "core_theme": "核心主题",
    "key_events": [
      {{{{
        "event_order": 1,
        "event_title": "事件标题",
        "description": "事件详细描述",
        "key_characters": ["人物1", "人物2"],
        "location": "事件发生地点",
        "significance": "事件在故事中的意义",
        "sub_events": [
          {{{{
            "sub_order": 1,
            "title": "细节节点标题",
            "description": "细节节点描述"
          }}}}
        ]
      }}}},
      {{{{
        "event_order": 2,
        "event_title": "事件标题",
        "description": "事件详细描述",
        "key_characters": ["人物1", "人物2"],
        "location": "事件发生地点",
        "significance": "事件在故事中的意义",
        "sub_events": []
      }}}}
    ],
    "story_summary": "完整故事摘要",
    "parameters": {{{{
      "time": "时间",
      "place": "地点",
      "characters": "人物",
      "story_scale": "故事规模",
      "worldview": "世界观"
    }}}}
  }}}}
}}}}

【故事生成要求】
- 如果提供了世界观，故事必须严格在该世界观的设定和背景下展开，不得出现穿越到其他世界（如回到古代、去往未来等不符合该世界观设定的情况），所有地点、设定、人物行为都必须符合该世界观。
- 如果 generate_details 为 true，则为每个关键事件生成3-5个具体的子事件(sub_events)节点，详细描述该事件中的具体行为或情节。注意：如果故事规模是中篇或以上，开启细节生成会导致极大的输出量，务必极度精简事件和子事件的描述，以保证最终的 JSON 结构完整闭合！
- 如果 generate_details 为 false，则 sub_events 数组留空即可。
- 根据故事规模确定关键事件数量（为防止 JSON 输出截断，请严格遵守以下数量限制，并在生成大量事件时保持精炼）：
  - 迷你：约5个关键事件
  - 短篇：约8-12个关键事件
  - 中篇：约12-18个关键事件
  - 长篇：约18-25个关键事件
  - 史诗：约25-30个关键事件
- 每个事件只写梗概，保持在150字以内
- 关键事件需要按时间顺序排列，形成完整的故事弧光
- 事件之间要有逻辑联系和因果关系
- 每个事件都要推动故事发展，展现人物成长
- 包含开端、发展、高潮、结局等完整结构

【时间线提取 JSON 格式】
如果使用 extract_timeline，请返回以下 JSON 格式（与 generate_story 完全保持一致）：
{{{{
  "tool": "extract_timeline",
  "status": "completed",
  "data": {{{{
    "title": "故事标题",
    "story_scale": "故事规模（简短/中等/长篇）",
    "genre": "故事类型",
    "core_theme": "核心主题",
    "key_events": [
      {{{{
        "event_order": 1,
        "event_title": "事件标题",
        "description": "事件详细描述",
        "key_characters": ["人物1", "人物2"],
        "location": "事件发生地点",
        "significance": "事件在故事中的意义",
        "sub_events": []
      }}}}
    ],
    "story_summary": "完整故事摘要"
  }}}}
}}}}

【事件节点展开 JSON 格式】
如果使用 expand_story_event，请返回以下 JSON 格式：
{{{{
  "tool": "expand_story_event",
  "status": "completed",
  "data": {{{{
    "event_title": "事件标题",
    "event_description": "原始事件描述",
    "sub_events": [
      {{{{
        "sub_order": 1,
        "title": "细节节点标题",
        "description": "细节节点描述"
      }}}}
    ]
  }}}}
}}}}

【事件生成文章 JSON 格式】
如果使用 generate_article_from_event，请返回以下 JSON 格式：
{{{{
  "tool": "generate_article_from_event",
  "status": "completed",
  "data": {{{{
    "title": "文章标题",
    "event_description": "原始事件描述",
    "content": "生成的具体文章内容，可以包含多个段落，详细描写事件的发展、人物的对话和心理活动等。",
    "characters_involved": ["人物1", "人物2"],
    "word_count": "字数估算"
  }}}}
}}}}

【对话文案生成 JSON 格式】
如果使用 generate_dialogue，请返回以下 JSON 格式：
{{{{
  "tool": "generate_dialogue",
  "status": "completed",
  "data": {{{{
    "event_description": "事件描述",
    "dialogue": "生成的具体对话内容（以对话为主，附带适当的动作和神态描写）"
  }}}}
}}}}

【短句/分镜脚本生成 JSON 格式】
如果使用 generate_short_script，请返回以下 JSON 格式：
{{{{
  "tool": "generate_short_script",
  "status": "completed",
  "data": {{{{
    "event_description": "事件描述",
    "script": "生成的短句或分镜脚本内容"
  }}}}
}}}}

【关系网生成 JSON 格式】
如果使用 generate_character_network，请返回以下 JSON 格式：
{{{{
  "tool": "generate_character_network",
  "status": "completed",
  "data": {{{{
    "worldview": "世界观名称",
    "core_characters": ["核心人物1", "核心人物2"],
    "characters": [
      {{{{
        "name": "新人物姓名",
        "basic_info": {{{{
          "role": "角色定位",
          "age": "年龄",
          "appearance": "外貌特征",
          "is_important": true/false
        }}}},
        "personality": "性格特质",
        "background": "背景故事",
        "abilities": ["能力1", "能力2"],
        "position_in_world": "在世界观中的位置",
        "relationships": [
          {{{{
            "target": "目标人物姓名",
            "type": "关系类型（如：朋友/敌人/师徒等）",
            "description": "关系详细描述"
          }}}}
        ]
      }}}}
    ],
    "network_summary": "关系网整体描述"
  }}}}
}}}}

"""),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ]
    )

    agent = create_openai_tools_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(
        agent=agent, 
        tools=tools, 
        verbose=False, 
        handle_parsing_errors=True,
        max_iterations=5
    )
    
    return agent_executor


@app.route('/api/analyze', methods=['POST'])
def analyze():
    """
    分析用户输入，返回工具调用建议
    """
    print("[DEBUG] 收到 /api/analyze 请求")
    try:
        data = request.json
        print(f"[DEBUG] 请求数据: {data}")
        user_input = data.get('message', '')
        
        if not user_input:
            print("[DEBUG] 错误：没有输入消息")
            return jsonify({'error': '请输入消息'}), 400
        
        print(f"[DEBUG] 用户输入: {user_input[:100]}...")
        
        analysis_result = analyzer.analyze(user_input)
        
        if analysis_result['recommended_tool']:
            tool_desc = analyzer.get_tool_description(analysis_result['recommended_tool'])
            missing_hints = analyzer.get_missing_params_hint(
                analysis_result['recommended_tool'],
                analysis_result['extracted_parameters']
            )
            analysis_result['tool_description'] = tool_desc
            analysis_result['missing_hints'] = missing_hints
        
        print(f"[DEBUG] 分析结果: {analysis_result}")
        
        return jsonify({
            'success': True,
            'analysis': analysis_result
        })
    except Exception as e:
        print(f"[DEBUG] 错误: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/chat/workflow', methods=['POST'])
def chat_workflow():
    print("[DEBUG] 收到 /api/chat/workflow 请求")
    try:
        data = request.json
        user_input = data.get('message', '')
        auto_save = data.get('auto_save', True)
        worldview_id = data.get('worldview_id', None)
        scenario = data.get('scenario', '小说')
        
        if not user_input:
            return jsonify({'error': '请输入消息'}), 400
            
        def generate():
            is_analysis_request = user_input.startswith("请从以下文章中分析") or user_input.startswith("请从以下文章中提取")
            
            if not is_analysis_request:
                try:
                    import threading
                    import queue
                    
                    yield f"data: {json.dumps({'type': 'status', 'message': '正在流式下发任务...'}, ensure_ascii=False)}\n\n"
                    
                    research_chain = get_research_agent_executor(scenario)
                    
                    q = queue.Queue()
                    
                    def run_research():
                        try:
                            # 🚀 优化：意图直通车 (Fast Track)
                            # 如果前端发送的指令里已经明确指定了使用的工具，直接跳过大模型的沉重分析！
                            import re
                            explicit_tool_match = re.search(r'使用\s+([a-zA-Z_]+)\s+工具', user_input)
                            if explicit_tool_match:
                                tool_name = explicit_tool_match.group(1)
                                print(f"[DEBUG] 🚀 意图直通车触发！跳过分析，直接分配工具: {tool_name}")
                                q.put(("step", {
                                    "step": 1,
                                    "tool": tool_name,
                                    "description": user_input,
                                    "parameters": {}
                                }))
                                q.put(("done", None))
                                return

                            buffer = ""
                            seen_steps = set()
                            # 开启流式预测
                            for chunk in research_chain.stream({"input": user_input}):
                                buffer += chunk.content
                                
                                # 基于花括号计数，提取完整的 JSON 对象
                                start = -1
                                depth = 0
                                for i, char in enumerate(buffer):
                                    if char == '{':
                                        if depth == 0:
                                            start = i
                                        depth += 1
                                    elif char == '}':
                                        depth -= 1
                                        if depth == 0 and start != -1:
                                            obj_str = buffer[start:i+1]
                                            try:
                                                obj = json.loads(obj_str)
                                                step_num = obj.get("step")
                                                # 如果是合法的步骤，且还没处理过
                                                if step_num and "tool" in obj and step_num not in seen_steps:
                                                    seen_steps.add(step_num)
                                                    q.put(("step", obj))
                                            except Exception:
                                                pass
                                            start = -1
                            q.put(("done", None))
                        except Exception as e:
                            q.put(("error", str(e)))

                    threading.Thread(target=run_research, daemon=True).start()
                    
                    plan = []
                    agent_executor = get_agent_executor(scenario)
                    results = []
                    cache_ids = []
                    
                    while True:
                        msg_type, data = q.get()
                        if msg_type == "error":
                            yield f"data: {json.dumps({'type': 'error', 'message': f'分析任务失败: {data}'}, ensure_ascii=False)}\n\n"
                            break
                        elif msg_type == "done":
                            if not plan:
                                yield f"data: {json.dumps({'type': 'error', 'message': '未能解析出任何任务步骤'}, ensure_ascii=False)}\n\n"
                            break
                        elif msg_type == "step":
                            plan.append(data)
                            # 实时下发新的任务流，前端会动态更新进度条
                            yield f"data: {json.dumps({'type': 'plan', 'plan': plan}, ensure_ascii=False)}\n\n"
                            
                            step_index = len(plan) - 1
                            tool_name = data.get('tool')
                            description = data.get('description', '')
                            params = data.get('parameters', {})
                            
                            yield f"data: {json.dumps({'type': 'step_start', 'step': step_index, 'message': f'执行中: {description}'}, ensure_ascii=False)}\n\n"
                            
                            step_input = f"请使用 {tool_name} 工具，完成以下任务：{description}。\n"
                            if params:
                                step_input += f"请使用以下参数：\n{json.dumps(params, ensure_ascii=False)}"
                                
                            try:
                                step_result = agent_executor.invoke({"input": step_input})
                                step_output = step_result['output']
                                
                                cleaned_out = step_output.strip()
                                if cleaned_out.startswith("```json"): cleaned_out = cleaned_out[7:]
                                elif cleaned_out.startswith("```"): cleaned_out = cleaned_out[3:]
                                if cleaned_out.endswith("```"): cleaned_out = cleaned_out[:-3]
                                cleaned_out = cleaned_out.strip()
                                
                                try:
                                    parsed_out = json.loads(cleaned_out)
                                    results.append(parsed_out)
                                    
                                    if auto_save:
                                        try:
                                            if isinstance(parsed_out, list):
                                                for item in parsed_out:
                                                    if isinstance(item, dict) and item.get('tool'):
                                                        cid = cache_manager.save(item.get('tool'), item, worldview_id=worldview_id)
                                                        if cid: cache_ids.append(cid)
                                            elif isinstance(parsed_out, dict) and parsed_out.get('tool'):
                                                cid = cache_manager.save(parsed_out.get('tool'), parsed_out, worldview_id=worldview_id)
                                                if cid: cache_ids.append(cid)
                                                
                                                if parsed_out.get('tool') == "generate_character_network":
                                                    try:
                                                        network_data = parsed_out.get("data", {})
                                                        characters_list = network_data.get("characters", [])
                                                        if characters_list:
                                                            for new_char in characters_list:
                                                                single_char_data = {
                                                                    "tool": "generate_related_character",
                                                                    "status": "completed",
                                                                    "data": new_char
                                                                }
                                                                cache_manager.save("generate_related_character", single_char_data, worldview_id=worldview_id)
                                                    except Exception:
                                                        pass
                                        except Exception:
                                            pass
                                            
                                    yield f"data: {json.dumps({'type': 'step_end', 'step': step_index, 'result': parsed_out}, ensure_ascii=False)}\n\n"
                                except json.JSONDecodeError:
                                    results.append({"tool": tool_name, "status": "completed", "data": step_output})
                                    yield f"data: {json.dumps({'type': 'step_end', 'step': step_index, 'result': {'tool': tool_name, 'status': 'completed', 'data': step_output}}, ensure_ascii=False)}\n\n"
                                    
                            except Exception as e:
                                results.append({"tool": tool_name, "status": "failed", "error": str(e)})
                                yield f"data: {json.dumps({'type': 'step_end', 'step': step_index, 'result': {'status': 'failed', 'error': str(e)}}, ensure_ascii=False)}\n\n"
                    
                    if plan:
                        final_res = {
                            'success': True,
                            'response': json.dumps(results, ensure_ascii=False),
                            'cache_ids': cache_ids
                        }
                        if cache_ids:
                            final_res['cache_id'] = cache_ids[0]
                        yield f"data: {json.dumps({'type': 'end', 'content': final_res}, ensure_ascii=False)}\n\n"
                        return
                except Exception as e:
                    yield f"data: {json.dumps({'type': 'error', 'message': str(e)}, ensure_ascii=False)}\n\n"
                    
            # Fallback for analysis or single agent
            yield f"data: {json.dumps({'type': 'status', 'message': '正在处理...'}, ensure_ascii=False)}\n\n"
            agent_executor = get_agent_executor(scenario)
            try:
                result = agent_executor.invoke({"input": user_input})
                output = result['output']
                
                cleaned_output = output.strip()
                if cleaned_output.startswith("```json"): cleaned_output = cleaned_output[7:]
                elif cleaned_output.startswith("```"): cleaned_output = cleaned_output[3:]
                if cleaned_output.endswith("```"): cleaned_output = cleaned_output[:-3]
                cleaned_output = cleaned_output.strip()
                
                if cleaned_output.startswith("{") and not cleaned_output.endswith("}"):
                    cleaned_output += "}"
                    
                cache_ids = []
                if auto_save:
                    try:
                        result_json = json.loads(cleaned_output)
                        output = cleaned_output
                        if isinstance(result_json, list):
                            for item in result_json:
                                if isinstance(item, dict) and item.get('tool'):
                                    cid = cache_manager.save(item.get('tool'), item, worldview_id=worldview_id)
                                    if cid: cache_ids.append(cid)
                        elif isinstance(result_json, dict) and result_json.get('tool'):
                            cid = cache_manager.save(result_json.get('tool'), result_json, worldview_id=worldview_id)
                            if cid: cache_ids.append(cid)
                    except Exception as e:
                        print(f"[DEBUG] 自动保存失败: {e}")
                        pass
                        
                final_content = {'success': True, 'response': output}
                if cache_ids:
                    final_content['cache_ids'] = cache_ids
                    final_content['cache_id'] = cache_ids[0]
                    
                yield f"data: {json.dumps({'type': 'end', 'content': final_content}, ensure_ascii=False)}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'type': 'end', 'content': {'success': False, 'error': str(e)}}, ensure_ascii=False)}\n\n"

        return app.response_class(
            generate(),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'X-Accel-Buffering': 'no'
            }
        )
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/chat', methods=['POST'])
def chat():
    print("[DEBUG] 收到 /api/chat 请求")
    try:
        data = request.json
        print(f"[DEBUG] 请求数据: {data}")
        user_input = data.get('message', '')
        auto_save = data.get('auto_save', True)
        worldview_id = data.get('worldview_id', None)
        
        if not user_input:
            print("[DEBUG] 错误：没有输入消息")
            return jsonify({'error': '请输入消息'}), 400
        
        print(f"[DEBUG] 用户输入: {user_input[:100]}...")
        
        # 检查是否为大文本分析请求，如果是，跳过 research_agent，防止 token 超出及 JSON 截断
        is_analysis_request = user_input.startswith("请从以下文章中分析和提取世界观") or user_input.startswith("请从以下文章中提取事件时间线")
        
        # --- 新增：使用 research_agent 拆解复杂任务 ---
        if not is_analysis_request:
            try:
                print("[DEBUG] 调用 research_agent 尝试拆解任务...")
                research_chain = get_research_agent_executor()
                research_result = research_chain.invoke({"input": user_input})
                research_output = research_result.content
                
                # 清理 markdown 标记
                cleaned_research_output = research_output.strip()
                if cleaned_research_output.startswith("```json"):
                    cleaned_research_output = cleaned_research_output[7:]
                elif cleaned_research_output.startswith("```"):
                    cleaned_research_output = cleaned_research_output[3:]
                if cleaned_research_output.endswith("```"):
                    cleaned_research_output = cleaned_research_output[:-3]
                cleaned_research_output = cleaned_research_output.strip()
                
                plan = json.loads(cleaned_research_output)
                print(f"[DEBUG] research_agent 任务规划结果: {json.dumps(plan, ensure_ascii=False, indent=2)}")
                
                # 如果解析成功并且是一个数组，说明任务被拆解了
                if isinstance(plan, list) and len(plan) > 0:
                    print(f"[DEBUG] 检测到复杂任务拆解，共有 {len(plan)} 个步骤")
                    
                    agent_executor = get_agent_executor()
                    results = []
                    cache_ids = []
                    
                    for i, step in enumerate(plan):
                        tool_name = step.get('tool')
                        description = step.get('description', '')
                        params = step.get('parameters', {})
                        
                        print(f"[DEBUG] 执行步骤 {i+1}/{len(plan)}: {tool_name} - {description}")
                        
                        # 构造给 agent_executor 的输入，使其调用指定的工具
                        # 明确告诉它使用什么工具以及参数
                        step_input = f"请使用 {tool_name} 工具，完成以下任务：{description}。\n"
                        if params:
                            step_input += f"请使用以下参数：\n{json.dumps(params, ensure_ascii=False)}"
                        
                        try:
                            step_result = agent_executor.invoke({"input": step_input})
                            step_output = step_result['output']
                            
                            # 尝试解析输出
                            try:
                                # 简单的清理
                                cleaned_out = step_output.strip()
                                if cleaned_out.startswith("```json"): cleaned_out = cleaned_out[7:]
                                elif cleaned_out.startswith("```"): cleaned_out = cleaned_out[3:]
                                if cleaned_out.endswith("```"): cleaned_out = cleaned_out[:-3]
                                cleaned_out = cleaned_out.strip()
                                
                                parsed_out = json.loads(cleaned_out)
                                results.append(parsed_out)
                                
                                if auto_save:
                                    cid = cache_manager.save(tool_name, parsed_out, worldview_id=worldview_id)
                                    cache_ids.append(cid)
                                    print(f"[DEBUG] 步骤 {i+1} 已保存到缓存: {cid}")
                                    
                                    # 如果研究员任务中生成了关系网，也自动拆分为独立人物
                                    if tool_name == "generate_character_network":
                                        try:
                                            network_data = parsed_out.get("data", {})
                                            characters_list = network_data.get("characters", [])
                                            if characters_list:
                                                print(f"[DEBUG] 拆分关系网，将 {len(characters_list)} 个新人物存为独立关联人物缓存...")
                                                for new_char in characters_list:
                                                    single_char_data = {
                                                        "tool": "generate_related_character",
                                                        "status": "completed",
                                                        "data": new_char
                                                    }
                                                    char_cid = cache_manager.save("generate_related_character", single_char_data, worldview_id=worldview_id)
                                        except Exception as parse_e:
                                            print(f"[DEBUG] 尝试拆分人物关系网失败: {parse_e}")
                            except json.JSONDecodeError:
                                print(f"[DEBUG] 步骤 {i+1} 输出无法解析为 JSON: {step_output[:100]}...")
                                results.append({"tool": tool_name, "status": "completed", "data": step_output})
                        except Exception as step_e:
                            print(f"[DEBUG] 步骤 {i+1} 执行失败: {step_e}")
                            results.append({"tool": tool_name, "status": "failed", "error": str(step_e)})
                    
                    # 返回所有步骤的结果
                    return jsonify({
                        'success': True,
                        'response': json.dumps(results, ensure_ascii=False),
                        'cache_ids': cache_ids,
                        'cache_id': cache_ids[0] if cache_ids else None
                    })
                    
            except Exception as e:
                print(f"[DEBUG] research_agent 拆解失败或执行出错，将回退到默认流程: {e}")
            
        # ---------------------------------------------

        # 检查是否是"生成世界"请求
        world_gen_keywords = ['帮我生成一个', '生成一个', '创建一个', '帮我创建一个']
        world_gen_patterns = ['完整世界', '一套内容', '世界观+人物+故事', '世界观+人物+关系网+故事']
        exclude_patterns = ['人物', '角色', '创建人物', '生成角色', '人物设定', '角色设定', '单独生成世界观', '只生成世界观']
        
        is_world_gen_request = False
        world_theme = '奇幻'
        world_name = ''
        story_scale = '中等'
        
        # 检查是否包含排除模式（如"人物"、"角色"）
        has_exclude_pattern = False
        for exclude in exclude_patterns:
            if exclude in user_input:
                has_exclude_pattern = True
                break
        
        # 检查关键词（只有在没有排除模式时才检查）
        if not has_exclude_pattern:
            # 额外检查：如果只是单独"生成世界观"，不触发完整世界生成
            if '世界观' in user_input and '世界' in user_input:
                # 检查是否只有"世界观"，没有"完整"、"一套"等关键词
                if not any(keyword in user_input for keyword in ['完整', '一套', '全部', '所有', '人物+', '+人物']):
                    has_exclude_pattern = True
        
        if not has_exclude_pattern:
            for keyword in world_gen_keywords:
                if keyword in user_input:
                    for pattern in world_gen_patterns:
                        if pattern in user_input:
                            is_world_gen_request = True
                            break
                    if is_world_gen_request:
                        break
        
        # 尝试提取主题
        if is_world_gen_request:
            import re
            # 尝试匹配"xx的世界"模式
            theme_match = re.search(r'([^\s，,]+)的世界', user_input)
            if theme_match:
                world_name = theme_match.group(1)
                # 尝试识别主题类型
                theme_keywords = {
                    '奇幻': ['奇幻', '魔法', '精灵', '龙', '中世纪'],
                    '科幻': ['科幻', '未来', '太空', '科技', '机器人'],
                    '玄幻': ['玄幻', '修仙', '修真', '灵气', '武道'],
                    '武侠': ['武侠', '江湖', '武功', '门派'],
                    '现代': ['现代', '都市', '职场', '校园'],
                    '末世': ['末世', '末日', '丧尸', '废土']
                }
                for theme_type, keywords in theme_keywords.items():
                    for kw in keywords:
                        if kw in world_name:
                            world_theme = theme_type
                            break
                    if world_theme != '奇幻':
                        break
            
            # 尝试提取故事规模
            if '简短' in user_input or '短篇' in user_input:
                story_scale = '简短'
            elif '长篇' in user_input:
                story_scale = '长篇'
        
        # 如果是生成世界请求，调用任务规划功能
        if is_world_gen_request:
            print(f"[DEBUG] 检测到生成世界请求: theme={world_theme}, world_name={world_name}, story_scale={story_scale}")
            
            agent_executor = get_agent_executor()
            results = {}
            cache_ids = []
            
            try:
                total_start_time = time.time()
                print(f"[TIMER] 完整世界生成开始于: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                
                # 第一步：生成世界观
                step1_start = time.time()
                print("[DEBUG] 第一步：生成世界观...")
                worldview_prompt = f'请生成一个世界观：类型={world_theme}'
                if world_name:
                    worldview_prompt += f'，主题={world_name}'
                worldview_result = agent_executor.invoke({"input": worldview_prompt})
                worldview_output = worldview_result['output']
                results['worldview'] = json.loads(worldview_output)
                step1_duration = time.time() - step1_start
                print(f"[DEBUG] 世界观生成完成")
                print(f"[TIMER] 第一步（世界观）耗时: {step1_duration:.2f}秒")
                
                if auto_save:
                    cache_id = cache_manager.save('generate_worldview', results['worldview'])
                    cache_ids.append(cache_id)
                    print(f"[DEBUG] 世界观已保存到缓存: {cache_id}")
                
                # 第二步：生成主角人物
                step2_start = time.time()
                print("[DEBUG] 第二步：生成主角人物...")
                worldview_name = results['worldview']['data'].get('world_name', world_name or world_theme)
                character_prompt = f'请为"{worldview_name}"世界观创建一个主角人物，角色定位=主角，是否为重要人物=true'
                character_result = agent_executor.invoke({"input": character_prompt})
                character_output = character_result['output']
                results['main_character'] = json.loads(character_output)
                step2_duration = time.time() - step2_start
                print(f"[DEBUG] 主角人物生成完成")
                print(f"[TIMER] 第二步（主角）耗时: {step2_duration:.2f}秒")
                
                if auto_save:
                    worldview_id = cache_ids[0] if cache_ids else None
                    cache_id = cache_manager.save('generate_character', results['main_character'], worldview_id=worldview_id)
                    cache_ids.append(cache_id)
                    print(f"[DEBUG] 主角人物已保存到缓存: {cache_id}")
                
                # 第三步：生成人物关系网（3个关联人物）
                step3_start = time.time()
                print("[DEBUG] 第三步：生成人物关系网...")
                main_char_name = results['main_character']['data']['name']
                related_characters = []
                
                relation_types = ['朋友', '敌人', '导师']
                for i, relation_type in enumerate(relation_types):
                    rel_start = time.time()
                    print(f"[DEBUG] 生成{relation_type}...")
                    if relation_type == '导师':
                        related_prompt = f'请为"{main_char_name}"生成一个{relation_type}，世界观是"{worldview_name}"，角色定位=导师，是否为重要人物=true'
                    else:
                        related_prompt = f'请为"{main_char_name}"生成一个{relation_type}，世界观是"{worldview_name}"，角色定位=核心配角，是否为重要人物=true'
                    related_result = agent_executor.invoke({"input": related_prompt})
                    related_output = related_result['output']
                    related_char = json.loads(related_output)
                    related_characters.append(related_char)
                    rel_duration = time.time() - rel_start
                    print(f"[TIMER]   - {relation_type}耗时: {rel_duration:.2f}秒")
                    
                    if auto_save:
                        # 补充 worldview_id
                        worldview_id = cache_ids[0] if cache_ids else None
                        cache_id = cache_manager.save('generate_related_character', related_char, worldview_id=worldview_id)
                        cache_ids.append(cache_id)
                        print(f"[DEBUG] {relation_type}已保存到缓存: {cache_id}")
                
                results['character_network'] = related_characters
                step3_duration = time.time() - step3_start
                print(f"[DEBUG] 人物关系网生成完成，共{len(related_characters)}个关联人物")
                print(f"[TIMER] 第三步（关系网）耗时: {step3_duration:.2f}秒")
                
                # 第四步：生成核心故事线
                step4_start = time.time()
                print("[DEBUG] 第四步：生成核心故事线...")
                all_characters = [main_char_name] + [rc['data']['name'] for rc in related_characters]
                story_prompt = f'请生成核心故事线：时间=未来，地点={worldview_name}，主要人物={",".join(all_characters)}，故事规模={story_scale}'
                story_result = agent_executor.invoke({"input": story_prompt})
                story_output = story_result['output']
                results['core_storyline'] = json.loads(story_output)
                step4_duration = time.time() - step4_start
                print(f"[DEBUG] 核心故事线生成完成")
                print(f"[TIMER] 第四步（故事线）耗时: {step4_duration:.2f}秒")
                
                if auto_save:
                    worldview_id = cache_ids[0] if cache_ids else None
                    cache_id = cache_manager.save('generate_story', results['core_storyline'], worldview_id=worldview_id)
                    cache_ids.append(cache_id)
                    print(f"[DEBUG] 核心故事线已保存到缓存: {cache_id}")
                
                total_duration = time.time() - total_start_time
                print(f"[DEBUG] 完整世界生成完成！共保存{len(cache_ids)}个缓存项")
                print(f"[TIMER] ========== 总耗时: {total_duration:.2f}秒 ==========")
                
                # 返回完整结果
                return jsonify({
                    'success': True,
                    'response': json.dumps({
                        'tool': 'generate_world',
                        'status': 'completed',
                        'data': results
                    }, ensure_ascii=False),
                    'cache_id': cache_ids[0] if cache_ids else None,
                    'cache_ids': cache_ids
                })
                
            except Exception as e:
                print(f"[DEBUG] 生成完整世界错误: {e}")
                import traceback
                traceback.print_exc()
                # 如果任务规划失败，回退到普通Agent调用
                print("[DEBUG] 任务规划失败，回退到普通Agent调用")
        
        # 普通Agent调用
        agent_executor = get_agent_executor()
        print("[DEBUG] Agent 已初始化，开始调用...")
        
        try:
            result = agent_executor.invoke({"input": user_input})
            output = result['output']
            print(f"[DEBUG] Agent 返回结果长度: {len(output)}")
        except Exception as e:
            print(f"[DEBUG] Agent 执行出错: {e}")
            output = str(e)
            
        # 尝试清理输出中的 markdown 代码块标记，防止 JSON 解析错误
        cleaned_output = output.strip()
        if cleaned_output.startswith("```json"):
            cleaned_output = cleaned_output[7:]
        elif cleaned_output.startswith("```"):
            cleaned_output = cleaned_output[3:]
        if cleaned_output.endswith("```"):
            cleaned_output = cleaned_output[:-3]
        cleaned_output = cleaned_output.strip()
        
        # 尝试修复常见的 JSON 截断错误
        if cleaned_output.startswith("{") and not cleaned_output.endswith("}"):
            print("[DEBUG] 尝试修复截断的 JSON (补充末尾的括号)")
            # 这是一个非常简单的修复，可能不适用于复杂的截断
            cleaned_output += "}"
            
        cache_id = None
        if auto_save:
            try:
                result_json = json.loads(cleaned_output)
                output = cleaned_output # 如果解析成功，使用清理后的输出
                
                if isinstance(result_json, list):
                    print(f"[DEBUG] 检测到 {len(result_json)} 个结果，逐个保存...")
                    cache_ids = []
                    for i, item in enumerate(result_json):
                        if isinstance(item, dict):
                            tool_name = item.get('tool')
                            if tool_name:
                                item_cache_id = cache_manager.save(tool_name, item, worldview_id=worldview_id)
                                cache_ids.append(item_cache_id)
                                print(f"[DEBUG] 已保存第 {i+1}/{len(result_json)} 个结果，ID: {item_cache_id}")
                                
                                # 如果是人物关系网，额外拆分
                                if tool_name == "generate_character_network":
                                    try:
                                        network_data = item.get("data", {})
                                        characters_list = network_data.get("characters", [])
                                        if characters_list:
                                            print(f"[DEBUG] 拆分关系网，将 {len(characters_list)} 个新人物存为独立关联人物缓存...")
                                            for new_char in characters_list:
                                                single_char_data = {
                                                    "tool": "generate_related_character",
                                                    "status": "completed",
                                                    "data": new_char
                                                }
                                                char_cid = cache_manager.save("generate_related_character", single_char_data, worldview_id=worldview_id)
                                    except Exception as parse_e:
                                        print(f"[DEBUG] 尝试拆分人物关系网失败: {parse_e}")
                    if cache_ids:
                        cache_id = cache_ids[0]
                        print(f"[DEBUG] 自动保存完成，共保存 {len(cache_ids)} 个结果")
                
                elif isinstance(result_json, dict):
                    tool_name = result_json.get('tool')
                    if tool_name:
                        cache_id = cache_manager.save(tool_name, result_json, worldview_id=worldview_id)
                        print(f"[DEBUG] 已自动保存到缓存，ID: {cache_id}")
                        
                        # 特殊处理：如果是生成人物关系网，把里面的每个新人物也单独作为关联人物存下来
                        if tool_name == "generate_character_network":
                            try:
                                network_data = result_json.get("data", {})
                                characters_list = network_data.get("characters", [])
                                if characters_list:
                                    print(f"[DEBUG] 检测到人物关系网，开始将 {len(characters_list)} 个新人物拆分为独立关联人物缓存...")
                                    for new_char in characters_list:
                                        # 构造单个关联人物的结构
                                        single_char_data = {
                                            "tool": "generate_related_character",
                                            "status": "completed",
                                            "data": new_char
                                        }
                                        char_cid = cache_manager.save("generate_related_character", single_char_data, worldview_id=worldview_id)
                                        print(f"[DEBUG] 已将网络中的人物 {new_char.get('name')} 存为独立关联人物，ID: {char_cid}")
                            except Exception as parse_e:
                                print(f"[DEBUG] 尝试拆分人物关系网失败: {parse_e}")
                    else:
                        print("[DEBUG] 自动保存跳过：未找到 tool 字段")
                else:
                    print(f"[DEBUG] 自动保存跳过：结果不是 dict/list 类型，是 {type(result_json)}")
            except json.JSONDecodeError as e:
                print(f"[DEBUG] 自动保存失败：JSON 解析错误 - {e}")
            except Exception as e:
                print(f"[DEBUG] 自动保存失败: {e}")
                import traceback
                traceback.print_exc()
        
        return jsonify({
            'success': True,
            'response': output,
            'cache_id': cache_id
        })
    except Exception as e:
        print(f"[DEBUG] 错误: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/chat/stream', methods=['POST'])
def chat_stream():
    """兼容的stream端点，返回Server-Sent Events格式"""
    print("[DEBUG] 收到 /api/chat/stream 请求")
    try:
        data = request.json
        print(f"[DEBUG] 请求数据: {data}")
        user_input = data.get('message', '')
        auto_save = data.get('auto_save', True)
        
        if not user_input:
            print("[DEBUG] 错误：没有输入消息")
            return jsonify({'error': '请输入消息'}), 400
        
        print(f"[DEBUG] 用户输入: {user_input[:100]}...")
        
        # 检查是否是"生成世界"请求
        world_gen_keywords = ['帮我生成一个', '生成一个', '创建一个', '帮我创建一个']
        world_gen_patterns = ['完整世界', '一套内容', '世界观+人物+故事', '世界观+人物+关系网+故事']
        exclude_patterns = ['人物', '角色', '创建人物', '生成角色', '人物设定', '角色设定', '单独生成世界观', '只生成世界观']
        
        is_world_gen_request = False
        world_theme = '奇幻'
        world_name = ''
        story_scale = '中等'
        
        # 检查是否包含排除模式（如"人物"、"角色"）
        has_exclude_pattern = False
        for exclude in exclude_patterns:
            if exclude in user_input:
                has_exclude_pattern = True
                break
        
        # 检查关键词（只有在没有排除模式时才检查）
        if not has_exclude_pattern:
            # 额外检查：如果只是单独"生成世界观"，不触发完整世界生成
            if '世界观' in user_input and '世界' in user_input:
                # 检查是否只有"世界观"，没有"完整"、"一套"等关键词
                if not any(keyword in user_input for keyword in ['完整', '一套', '全部', '所有', '人物+', '+人物']):
                    has_exclude_pattern = True
        
        if not has_exclude_pattern:
            for keyword in world_gen_keywords:
                if keyword in user_input:
                    for pattern in world_gen_patterns:
                        if pattern in user_input:
                            is_world_gen_request = True
                            break
                    if is_world_gen_request:
                        break
        
        # 尝试提取主题
        if is_world_gen_request:
            import re
            # 尝试匹配"xx的世界"模式
            theme_match = re.search(r'([^\s，,]+)的世界', user_input)
            if theme_match:
                world_name = theme_match.group(1)
                # 尝试识别主题类型
                theme_keywords = {
                    '奇幻': ['奇幻', '魔法', '精灵', '龙', '中世纪'],
                    '科幻': ['科幻', '未来', '太空', '科技', '机器人'],
                    '玄幻': ['玄幻', '修仙', '修真', '灵气', '武道'],
                    '武侠': ['武侠', '江湖', '武功', '门派'],
                    '现代': ['现代', '都市', '职场', '校园'],
                    '末世': ['末世', '末日', '丧尸', '废土']
                }
                for theme_type, keywords in theme_keywords.items():
                    for kw in keywords:
                        if kw in world_name:
                            world_theme = theme_type
                            break
                    if world_theme != '奇幻':
                        break
            
            # 尝试提取故事规模
            if '简短' in user_input or '短篇' in user_input:
                story_scale = '简短'
            elif '长篇' in user_input:
                story_scale = '长篇'
        
        # 如果是生成世界请求，调用任务规划功能
        if is_world_gen_request:
            print(f"[DEBUG] 检测到生成世界请求: theme={world_theme}, world_name={world_name}, story_scale={story_scale}")
            
            def generate_world_progress():
                agent_executor = get_agent_executor()
                results = {}
                cache_ids = []
                
                try:
                    total_start_time = time.time()
                    print(f"[TIMER] 完整世界生成（流式）开始于: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                    
                    # 发送开始进度
                    yield f"data: {json.dumps({'type': 'progress', 'step': 1, 'total': 4, 'message': '正在生成世界观...'}, ensure_ascii=False)}\n\n"
                    
                    # 第一步：生成世界观
                    step1_start = time.time()
                    print("[DEBUG] 第一步：生成世界观...")
                    worldview_prompt = f'请生成一个世界观：类型={world_theme}'
                    if world_name:
                        worldview_prompt += f'，主题={world_name}'
                    worldview_result = agent_executor.invoke({"input": worldview_prompt})
                    worldview_output = worldview_result['output']
                    results['worldview'] = json.loads(worldview_output)
                    step1_duration = time.time() - step1_start
                    print(f"[DEBUG] 世界观生成完成")
                    print(f"[TIMER] 第一步（世界观）耗时: {step1_duration:.2f}秒")
                    
                    if auto_save:
                        cache_id = cache_manager.save('generate_worldview', results['worldview'])
                        cache_ids.append(cache_id)
                        print(f"[DEBUG] 世界观已保存到缓存: {cache_id}")
                    
                    yield f"data: {json.dumps({'type': 'progress', 'step': 2, 'total': 4, 'message': '世界观生成完成，正在生成主角人物...'}, ensure_ascii=False)}\n\n"
                    
                    # 第二步：生成主角人物
                    step2_start = time.time()
                    print("[DEBUG] 第二步：生成主角人物...")
                    worldview_name = results['worldview']['data'].get('world_name', world_name or world_theme)
                    character_prompt = f'请为"{worldview_name}"世界观创建一个主角人物，角色定位=主角，是否为重要人物=true'
                    character_result = agent_executor.invoke({"input": character_prompt})
                    character_output = character_result['output']
                    results['main_character'] = json.loads(character_output)
                    step2_duration = time.time() - step2_start
                    print(f"[DEBUG] 主角人物生成完成")
                    print(f"[TIMER] 第二步（主角）耗时: {step2_duration:.2f}秒")
                    
                    if auto_save:
                        cache_id = cache_manager.save('generate_character', results['main_character'])
                        cache_ids.append(cache_id)
                        print(f"[DEBUG] 主角人物已保存到缓存: {cache_id}")
                    
                    yield f"data: {json.dumps({'type': 'progress', 'step': 3, 'total': 4, 'message': '主角人物生成完成，正在生成人物关系网...'}, ensure_ascii=False)}\n\n"
                    
                    # 第三步：生成人物关系网（3个关联人物）
                    step3_start = time.time()
                    print("[DEBUG] 第三步：生成人物关系网...")
                    main_char_name = results['main_character']['data']['name']
                    related_characters = []
                    
                    relation_types = ['朋友', '敌人', '导师']
                    for i, relation_type in enumerate(relation_types):
                        rel_start = time.time()
                        print(f"[DEBUG] 生成{relation_type}...")
                        if relation_type == '导师':
                            related_prompt = f'请为"{main_char_name}"生成一个{relation_type}，世界观是"{worldview_name}"，角色定位=导师，是否为重要人物=true'
                        else:
                            related_prompt = f'请为"{main_char_name}"生成一个{relation_type}，世界观是"{worldview_name}"，角色定位=核心配角，是否为重要人物=true'
                        related_result = agent_executor.invoke({"input": related_prompt})
                        related_output = related_result['output']
                        related_char = json.loads(related_output)
                        related_characters.append(related_char)
                        rel_duration = time.time() - rel_start
                        print(f"[TIMER]   - {relation_type}耗时: {rel_duration:.2f}秒")
                        
                        if auto_save:
                            cache_id = cache_manager.save('generate_related_character', related_char)
                            cache_ids.append(cache_id)
                            print(f"[DEBUG] {relation_type}已保存到缓存: {cache_id}")
                        
                        yield f"data: {json.dumps({'type': 'progress', 'step': 3, 'total': 4, 'message': f'已生成{i+1}/3个关联人物...'}, ensure_ascii=False)}\n\n"
                    
                    results['character_network'] = related_characters
                    step3_duration = time.time() - step3_start
                    print(f"[DEBUG] 人物关系网生成完成，共{len(related_characters)}个关联人物")
                    print(f"[TIMER] 第三步（关系网）耗时: {step3_duration:.2f}秒")
                    
                    yield f"data: {json.dumps({'type': 'progress', 'step': 4, 'total': 4, 'message': '人物关系网生成完成，正在生成核心故事线...'}, ensure_ascii=False)}\n\n"
                    
                    # 第四步：生成核心故事线
                    step4_start = time.time()
                    print("[DEBUG] 第四步：生成核心故事线...")
                    all_characters = [main_char_name] + [rc['data']['name'] for rc in related_characters]
                    story_prompt = f'请生成核心故事线：时间=未来，地点={worldview_name}，主要人物={",".join(all_characters)}，故事规模={story_scale}'
                    story_result = agent_executor.invoke({"input": story_prompt})
                    story_output = story_result['output']
                    results['core_storyline'] = json.loads(story_output)
                    step4_duration = time.time() - step4_start
                    print(f"[DEBUG] 核心故事线生成完成")
                    print(f"[TIMER] 第四步（故事线）耗时: {step4_duration:.2f}秒")
                    
                    if auto_save:
                        cache_id = cache_manager.save('generate_story', results['core_storyline'])
                        cache_ids.append(cache_id)
                        print(f"[DEBUG] 核心故事线已保存到缓存: {cache_id}")
                    
                    total_duration = time.time() - total_start_time
                    print(f"[DEBUG] 完整世界生成完成！共保存{len(cache_ids)}个缓存项")
                    print(f"[TIMER] ========== 总耗时: {total_duration:.2f}秒 ==========")
                    
                    # 返回完整结果
                    final_output = json.dumps({
                        'tool': 'generate_world',
                        'status': 'completed',
                        'data': results
                    }, ensure_ascii=False)
                    
                    yield f"data: {json.dumps({'type': 'chunk', 'content': final_output}, ensure_ascii=False)}\n\n"
                    yield f"data: {json.dumps({'type': 'end', 'content': final_output}, ensure_ascii=False)}\n\n"
                    
                except Exception as e:
                    print(f"[DEBUG] 生成完整世界错误: {e}")
                    import traceback
                    traceback.print_exc()
                    yield f"data: {json.dumps({'type': 'error', 'message': str(e)}, ensure_ascii=False)}\n\n"
            
            return app.response_class(
                generate_world_progress(),
                mimetype='text/event-stream',
                headers={
                    'Cache-Control': 'no-cache',
                    'X-Accel-Buffering': 'no'
                }
            )
        
        # 普通Agent调用
        agent_executor = get_agent_executor()
        print("[DEBUG] Agent 已初始化，开始调用...")
        
        result = agent_executor.invoke({"input": user_input})
        output = result['output']
        print(f"[DEBUG] Agent 返回结果长度: {len(output)}")
        
        cache_id = None
        if auto_save:
            try:
                result_json = json.loads(output)
                
                if isinstance(result_json, list):
                    print(f"[DEBUG] 检测到 {len(result_json)} 个结果，逐个保存...")
                    cache_ids = []
                    for i, item in enumerate(result_json):
                        if isinstance(item, dict):
                            tool_name = item.get('tool')
                            if tool_name:
                                item_cache_id = cache_manager.save(tool_name, item)
                                cache_ids.append(item_cache_id)
                                print(f"[DEBUG] 已保存第 {i+1}/{len(result_json)} 个结果，ID: {item_cache_id}")
                    if cache_ids:
                        cache_id = cache_ids[0]
                        print(f"[DEBUG] 自动保存完成，共保存 {len(cache_ids)} 个结果")
                
                elif isinstance(result_json, dict):
                    tool_name = result_json.get('tool')
                    if tool_name:
                        cache_id = cache_manager.save(tool_name, result_json)
                        print(f"[DEBUG] 已自动保存到缓存，ID: {cache_id}")
                    else:
                        print("[DEBUG] 自动保存跳过：未找到 tool 字段")
                else:
                    print(f"[DEBUG] 自动保存跳过：结果不是 dict/list 类型，是 {type(result_json)}")
            except json.JSONDecodeError as e:
                print(f"[DEBUG] 自动保存失败：JSON 解析错误 - {e}")
            except Exception as e:
                print(f"[DEBUG] 自动保存失败: {e}")
                import traceback
                traceback.print_exc()
        
        def generate():
            yield f"data: {json.dumps({'type': 'chunk', 'content': output}, ensure_ascii=False)}\n\n"
            yield f"data: {json.dumps({'type': 'end', 'content': output}, ensure_ascii=False)}\n\n"
        
        return app.response_class(
            generate(),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'X-Accel-Buffering': 'no'
            }
        )
    except Exception as e:
        print(f"[DEBUG] 错误: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/cache/all', methods=['GET'])
def get_all_cache():
    """获取所有缓存"""
    try:
        cache_data = cache_manager.get_all()
        stats = cache_manager.get_stats()
        return jsonify({
            'success': True,
            'data': cache_data,
            'stats': stats
        })
    except Exception as e:
        print(f"[DEBUG] 获取缓存错误: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/cache/get', methods=['POST'])
def get_cache():
    """获取单个缓存项"""
    try:
        data = request.json
        item_id = data.get('id')
        
        if not item_id:
            return jsonify({'error': '请提供缓存ID'}), 400
        
        item = cache_manager.get(item_id)
        if item:
            return jsonify({'success': True, 'data': item})
        else:
            return jsonify({'error': '未找到缓存项'}), 404
    except Exception as e:
        print(f"[DEBUG] 获取缓存错误: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/cache/category', methods=['POST'])
def get_cache_by_category():
    """按分类获取缓存"""
    try:
        data = request.json
        category = data.get('category')
        
        if not category:
            return jsonify({'error': '请提供分类'}), 400
        
        items = cache_manager.get_by_category(category)
        return jsonify({'success': True, 'data': items})
    except Exception as e:
        print(f"[DEBUG] 获取缓存错误: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/cache/search', methods=['POST'])
def search_cache():
    """搜索缓存"""
    try:
        data = request.json
        keyword = data.get('keyword', '')
        
        items = cache_manager.search(keyword)
        return jsonify({'success': True, 'data': items})
    except Exception as e:
        print(f"[DEBUG] 搜索缓存错误: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/cache/update', methods=['POST'])
def update_cache():
    """更新缓存项"""
    try:
        data = request.json
        item_id = data.get('id')
        new_data = data.get('data')
        name = data.get('name')
        
        if not item_id or not new_data:
            return jsonify({'error': '请提供缓存ID和新数据'}), 400
        
        success = cache_manager.update(item_id, new_data, name)
        if success:
            return jsonify({'success': True, 'message': '更新成功'})
        else:
            return jsonify({'error': '未找到缓存项'}), 404
    except Exception as e:
        print(f"[DEBUG] 更新缓存错误: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/cache/delete', methods=['POST'])
def delete_cache():
    """删除缓存项"""
    try:
        data = request.json
        item_id = data.get('id')
        
        if not item_id:
            return jsonify({'error': '请提供缓存ID'}), 400
        
        success = cache_manager.delete(item_id)
        if success:
            return jsonify({'success': True, 'message': '删除成功'})
        else:
            return jsonify({'error': '未找到缓存项'}), 404
    except Exception as e:
        print(f"[DEBUG] 删除缓存错误: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/cache/clear', methods=['POST'])
def clear_cache():
    """清空缓存"""
    try:
        data = request.json
        category = data.get('category')
        
        if category:
            cache_manager.clear_category(category)
            message = f'已清空 {category} 分类'
        else:
            cache_manager.clear_all()
            message = '已清空所有缓存'
        
        return jsonify({'success': True, 'message': message})
    except Exception as e:
        print(f"[DEBUG] 清空缓存错误: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/generate-world', methods=['POST'])
def generate_world():
    """
    任务规划：生成完整的世界（世界观+主角+人物关系网+核心故事线）
    """
    print("[DEBUG] 收到 /api/generate-world 请求")
    try:
        data = request.json
        print(f"[DEBUG] 请求数据: {data}")
        
        world_theme = data.get('theme', '奇幻')
        world_name = data.get('world_name', '')
        story_scale = data.get('story_scale', '中等')
        auto_save = data.get('auto_save', True)
        
        print(f"[DEBUG] 开始生成完整世界: theme={world_theme}, world_name={world_name}, story_scale={story_scale}")
        
        agent_executor = get_agent_executor()
        results = {}
        cache_ids = []
        
        # 第一步：生成世界观
        print("[DEBUG] 第一步：生成世界观...")
        worldview_prompt = f'请生成一个世界观：类型={world_theme}'
        if world_name:
            worldview_prompt += f'，主题={world_name}'
        worldview_result = agent_executor.invoke({"input": worldview_prompt})
        worldview_output = worldview_result['output']
        results['worldview'] = json.loads(worldview_output)
        print(f"[DEBUG] 世界观生成完成")
        
        if auto_save:
            cache_id = cache_manager.save('generate_worldview', results['worldview'])
            cache_ids.append(cache_id)
            print(f"[DEBUG] 世界观已保存到缓存: {cache_id}")
        
        # 第二步：生成主角人物
        print("[DEBUG] 第二步：生成主角人物...")
        worldview_name = results['worldview']['data'].get('world_name', world_name or world_theme)
        character_prompt = f'请为"{worldview_name}"世界观创建一个主角人物'
        character_result = agent_executor.invoke({"input": character_prompt})
        character_output = character_result['output']
        results['main_character'] = json.loads(character_output)
        print(f"[DEBUG] 主角人物生成完成")
        
        if auto_save:
            cache_id = cache_manager.save('generate_character', results['main_character'])
            cache_ids.append(cache_id)
            print(f"[DEBUG] 主角人物已保存到缓存: {cache_id}")
        
        # 第三步：生成人物关系网（3个关联人物）
        print("[DEBUG] 第三步：生成人物关系网...")
        main_char_name = results['main_character']['data']['name']
        related_characters = []
        
        relation_types = ['朋友', '敌人', '导师']
        for relation_type in relation_types:
            print(f"[DEBUG] 生成{relation_type}...")
            related_prompt = f'请为"{main_char_name}"生成一个{relation_type}，世界观是"{worldview_name}"'
            related_result = agent_executor.invoke({"input": related_prompt})
            related_output = related_result['output']
            related_char = json.loads(related_output)
            related_characters.append(related_char)
            
            if auto_save:
                cache_id = cache_manager.save('generate_related_character', related_char)
                cache_ids.append(cache_id)
                print(f"[DEBUG] {relation_type}已保存到缓存: {cache_id}")
        
        results['character_network'] = related_characters
        print(f"[DEBUG] 人物关系网生成完成，共{len(related_characters)}个关联人物")
        
        # 第四步：生成核心故事线
        print("[DEBUG] 第四步：生成核心故事线...")
        all_characters = [main_char_name] + [rc['data']['related_character']['name'] for rc in related_characters]
        story_prompt = f'请生成核心故事线：时间=未来，地点={worldview_name}，主要人物={",".join(all_characters)}，故事规模={story_scale}'
        story_result = agent_executor.invoke({"input": story_prompt})
        story_output = story_result['output']
        results['core_storyline'] = json.loads(story_output)
        print(f"[DEBUG] 核心故事线生成完成")
        
        if auto_save:
            cache_id = cache_manager.save('generate_story', results['core_storyline'])
            cache_ids.append(cache_id)
            print(f"[DEBUG] 核心故事线已保存到缓存: {cache_id}")
        
        print(f"[DEBUG] 完整世界生成完成！共保存{len(cache_ids)}个缓存项")
        
        return jsonify({
            'success': True,
            'message': '完整世界生成成功！',
            'data': results,
            'cache_ids': cache_ids
        })
    except Exception as e:
        print(f"[DEBUG] 生成完整世界错误: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port)
