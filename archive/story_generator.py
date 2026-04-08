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
def generate_story(time: str, place: str, characters: str, genre: str = "冒险") -> str:
    """
    根据时间、地点、人物生成故事。
    
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
        temperature=0.8,
        openai_api_key=api_key,
        openai_api_base=base_url
    )
    
    tools = [generate_story]

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", """你是一个富有想象力的故事创作大师。根据用户提供的时间、地点、人物等信息，创作一个引人入胜的故事。

故事要求：
1. 开头要有吸引力，能迅速抓住读者
2. 情节要有起伏和冲突
3. 人物形象要鲜明
4. 结尾要完整且有意义
5. 语言生动优美，适合阅读

请按照以下结构输出故事：
【故事标题】
...

【故事内容】
..."""),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ]
    )

    agent = create_openai_tools_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

    print("=" * 60)
    print("故事创作工具")
    print("=" * 60)
    print("\n示例故事参数：")
    print("时间：一个风雨交加的夜晚")
    print("地点：古老的废弃图书馆")
    print("人物：年轻的图书管理员李明")
    print("类型：悬疑冒险")
    print("\n" + "=" * 60)
    print("正在生成故事...")
    print("=" * 60 + "\n")

    result = agent_executor.invoke({
        "input": """请根据以下信息创作一个故事：
时间：一个风雨交加的夜晚
地点：古老的废弃图书馆
人物：年轻的图书管理员李明
类型：悬疑冒险"""
    })
    
    print("\n" + "=" * 60)
    print("生成的故事：")
    print("=" * 60)
    print(result['output'])


def generate_custom_story(time: str, place: str, characters: str, genre: str = "冒险"):
    """
    生成自定义故事
    
    Args:
        time: 故事发生的时间
        place: 故事发生的地点
        characters: 故事的主要人物
        genre: 故事类型
        
    Returns:
        生成的故事
    """
    api_key = os.getenv("ARK_API_KEY")
    base_url = os.getenv("ARK_BASE_URL", "https://ark.cn-beijing.volces.com/api/v3")
    model = os.getenv("ARK_MODEL", "ep-20260304154408-lf678")
    
    llm = ChatOpenAI(
        model=model,
        temperature=0.8,
        openai_api_key=api_key,
        openai_api_base=base_url
    )
    
    tools = [generate_story]

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", """你是一个富有想象力的故事创作大师。根据用户提供的时间、地点、人物等信息，创作一个引人入胜的故事。

故事要求：
1. 开头要有吸引力，能迅速抓住读者
2. 情节要有起伏和冲突
3. 人物形象要鲜明
4. 结尾要完整且有意义
5. 语言生动优美，适合阅读

请按照以下结构输出故事：
【故事标题】
...

【故事内容】
..."""),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ]
    )

    agent = create_openai_tools_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=False)

    result = agent_executor.invoke({
        "input": f"""请根据以下信息创作一个故事：
时间：{time}
地点：{place}
人物：{characters}
类型：{genre}"""
    })
    
    return result['output']


if __name__ == "__main__":
    main()
