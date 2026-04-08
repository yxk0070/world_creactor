import warnings
import os
warnings.filterwarnings("ignore", category=DeprecationWarning)
warnings.filterwarnings("ignore", category=UserWarning)

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.tools import tool
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder


load_dotenv()


@tool
def extract_timeline(article: str) -> str:
    """
    从文章中提取事件时间线。当用户需要分析一篇文章、整理时间线、
    或者想要了解某个事件的发展过程时使用此工具。
    
    Args:
        article: 要分析的文章文本
        
    Returns:
        格式化的事件时间线
    """
    return f"正在分析文章:\n{article[:200]}..."


@tool
def generate_story(time: str, place: str, characters: str, genre: str = "冒险") -> str:
    """
    根据时间、地点、人物生成故事。当用户需要创作故事、
    或者提供了时间地点人物信息想要生成故事时使用此工具。
    
    Args:
        time: 故事发生的时间
        place: 故事发生的地点
        characters: 故事的主要人物
        genre: 故事类型（冒险/悬疑/爱情/科幻/童话等）
        
    Returns:
        生成的故事
    """
    return f"正在生成故事：时间={time}, 地点={place}, 人物={characters}, 类型={genre}"


def main():
    api_key = os.getenv("ARK_API_KEY")
    base_url = os.getenv("ARK_BASE_URL", "https://ark.cn-beijing.volces.com/api/v3")
    model = os.getenv("ARK_MODEL", "ep-20260304154408-lf678")
    
    llm = ChatOpenAI(
        model=model,
        temperature=0.7,
        openai_api_key=api_key,
        openai_api_base=base_url
    )
    
    tools = [extract_timeline, generate_story]

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", """你是一个智能助手，可以根据用户的需求选择合适的工具来完成任务。

你有两个工具可用：
1. extract_timeline - 用于分析文章并提取事件时间线
2. generate_story - 用于根据时间、地点、人物等信息创作故事

【判断规则】
- 如果用户提供了一篇文章、或者提到"分析"、"梳理"、"时间线"、"事件发展"等关键词 → 使用 extract_timeline
- 如果用户提供了时间、地点、人物等信息，或者提到"写故事"、"创作"、"编故事"等关键词 → 使用 generate_story
- 如果信息不完整，先询问用户需要什么类型的帮助

【故事生成要求】
如果使用 generate_story，请按照以下格式输出：
【故事标题】
...

【故事内容】
...

【时间线提取要求】
如果使用 extract_timeline，请按照以下格式输出：
1. 【时间】事件描述
2. 【时间】事件描述
..."""),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ]
    )

    agent = create_openai_tools_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

    print("=" * 60)
    print("智能 Agent - 自动判断工具")
    print("=" * 60)
    print("\n这个智能 Agent 可以根据你的输入自动判断使用哪个工具：")
    print("  📊 如果你想分析文章 → 自动使用时间线提取工具")
    print("  ✍️  如果你想创作故事 → 自动使用故事生成工具")
    print("=" * 60 + "\n")

    test_cases = [
        {
            "name": "测试 1 - 时间线提取",
            "input": """请分析以下文章并生成时间线：
2020年1月，新冠疫情在中国武汉首次被发现。
2020年1月23日，武汉宣布封城。
2020年3月，世界卫生组织宣布新冠疫情为全球大流行。
2020年12月，首批新冠疫苗获得紧急使用授权。
"""
        },
        {
            "name": "测试 2 - 故事生成",
            "input": """请根据以下信息创作一个冒险故事：
时间：古代
地点：神秘的森林
人物：勇敢的少年探险家
类型：冒险"""
        }
    ]

    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{'=' * 60}")
        print(f"{test_case['name']}")
        print('=' * 60)
        print(f"\n输入内容：\n{test_case['input']}")
        print("\n" + "=" * 60)
        print("Agent 正在分析并选择工具...")
        print("=" * 60 + "\n")
        
        result = agent_executor.invoke({"input": test_case['input']})
        
        print("\n" + "=" * 60)
        print(f"{test_case['name']} - 结果")
        print("=" * 60)
        print(result['output'])


def interactive_mode():
    """
    交互式模式，让用户输入内容
    """
    api_key = os.getenv("ARK_API_KEY")
    base_url = os.getenv("ARK_BASE_URL", "https://ark.cn-beijing.volces.com/api/v3")
    model = os.getenv("ARK_MODEL", "ep-20260304154408-lf678")
    
    llm = ChatOpenAI(
        model=model,
        temperature=0.7,
        openai_api_key=api_key,
        openai_api_base=base_url
    )
    
    tools = [extract_timeline, generate_story]

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", """你是一个智能助手，可以根据用户的需求选择合适的工具来完成任务。

你有两个工具可用：
1. extract_timeline - 用于分析文章并提取事件时间线
2. generate_story - 用于根据时间、地点、人物等信息创作故事

【判断规则】
- 如果用户提供了一篇文章、或者提到"分析"、"梳理"、"时间线"、"事件发展"等关键词 → 使用 extract_timeline
- 如果用户提供了时间、地点、人物等信息，或者提到"写故事"、"创作"、"编故事"等关键词 → 使用 generate_story
- 如果信息不完整，先询问用户需要什么类型的帮助

【故事生成要求】
如果使用 generate_story，请按照以下格式输出：
【故事标题】
...

【故事内容】
...

【时间线提取要求】
如果使用 extract_timeline，请按照以下格式输出：
1. 【时间】事件描述
2. 【时间】事件描述
..."""),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ]
    )

    agent = create_openai_tools_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=False)

    print("=" * 60)
    print("智能 Agent - 交互式模式")
    print("=" * 60)
    print("\n这个智能 Agent 可以根据你的输入自动判断使用哪个工具：")
    print("  📊 如果你想分析文章 → 自动使用时间线提取工具")
    print("  ✍️  如果你想创作故事 → 自动使用故事生成工具")
    print("\n输入 'quit' 或 'exit' 退出程序")
    print("=" * 60 + "\n")

    while True:
        user_input = input("\n请输入你的需求：").strip()
        
        if user_input.lower() in ['quit', 'exit']:
            print("\n感谢使用，再见！")
            break
        
        if not user_input:
            print("请输入内容！")
            continue
        
        print("\n" + "=" * 60)
        print("Agent 正在分析并处理...")
        print("=" * 60 + "\n")
        
        try:
            result = agent_executor.invoke({"input": user_input})
            print("\n" + "=" * 60)
            print("结果：")
            print("=" * 60)
            print(result['output'])
            print("=" * 60)
        except Exception as e:
            print(f"\n处理过程中出现错误：{e}")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--interactive":
        interactive_mode()
    else:
        main()
