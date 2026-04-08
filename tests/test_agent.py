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
    从文章中提取事件时间线。
    """
    print(f"[DEBUG] extract_timeline 被调用，article: {article[:100]}...")
    return f"正在分析文章:\n{article[:200]}..."


@tool
def generate_story(time: str, place: str, characters: str, genre: str = "冒险") -> str:
    """
    根据时间、地点、人物生成故事。
    """
    print(f"[DEBUG] generate_story 被调用，time={time}, place={place}, characters={characters}")
    return f"正在生成故事：时间={time}, 地点={place}, 人物={characters}, 类型={genre}"


def test_agent():
    print("=" * 60)
    print("测试 Agent")
    print("=" * 60)
    
    api_key = os.getenv("ARK_API_KEY")
    base_url = os.getenv("ARK_BASE_URL", "https://ark.cn-beijing.volces.com/api/v3")
    model = os.getenv("ARK_MODEL", "ep-20260304154408-lf678")
    
    print(f"\n[DEBUG] API Key: {api_key[:10]}...")
    print(f"[DEBUG] Base URL: {base_url}")
    print(f"[DEBUG] Model: {model}")
    
    llm = ChatOpenAI(
        model=model,
        temperature=0.7,
        openai_api_key=api_key,
        openai_api_base=base_url
    )
    
    tools = [extract_timeline, generate_story]

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", """你是一个智能助手，可以根据用户的需求选择合适的工具来完成任务。"""),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ]
    )

    agent = create_openai_tools_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

    print("\n" + "=" * 60)
    print("测试 1: 时间线提取")
    print("=" * 60)
    
    try:
        result = agent_executor.invoke({
            "input": "请分析：2020年1月，疫情发现。2020年2月，措施出台。"
        })
        print("\n[DEBUG] 结果:")
        print(result['output'])
    except Exception as e:
        print(f"\n[ERROR] {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    test_agent()
