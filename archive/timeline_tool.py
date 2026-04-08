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
    
    Args:
        article: 要分析的文章文本
        
    Returns:
        格式化的事件时间线
    """
    return f"正在分析文章:\n{article[:200]}..."


def main():
    api_key = os.getenv("ARK_API_KEY")
    base_url = os.getenv("ARK_BASE_URL", "https://ark.cn-beijing.volces.com/api/v3")
    model = os.getenv("ARK_MODEL", "ep-20260304154408-lf678")
    
    llm = ChatOpenAI(
        model=model,
        temperature=0,
        openai_api_key=api_key,
        openai_api_base=base_url
    )
    
    tools = [extract_timeline]

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", """你是一个专业的文章分析助手，擅长从文章中提取关键事件并整理成清晰的时间线。

请按照以下格式输出时间线：
1. 【时间】事件描述
2. 【时间】事件描述
...

如果文章中没有明确的时间，请使用逻辑顺序编号。"""),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ]
    )

    agent = create_openai_tools_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

    sample_article = """
    2020年1月，新冠疫情在中国武汉首次被发现。
    2020年1月23日，武汉宣布封城。
    2020年3月，世界卫生组织宣布新冠疫情为全球大流行。
    2020年12月，首批新冠疫苗获得紧急使用授权。
    2021年，全球开始大规模疫苗接种。
    2022年，奥密克戎变异株在全球传播。
    2023年，各国逐步放松疫情管控措施。
    """

    print("=" * 60)
    print("文章事件线梳理工具")
    print("=" * 60)
    print("\n示例文章：")
    print(sample_article)
    print("\n" + "=" * 60)
    print("正在分析文章并生成事件线...")
    print("=" * 60 + "\n")

    result = agent_executor.invoke({
        "input": f"请分析以下文章并生成事件时间线：\n\n{sample_article}"
    })
    
    print("\n" + "=" * 60)
    print("分析结果：")
    print("=" * 60)
    print(result['output'])


def analyze_custom_article(article: str):
    """
    分析自定义文章
    
    Args:
        article: 要分析的文章
    """
    api_key = os.getenv("ARK_API_KEY")
    base_url = os.getenv("ARK_BASE_URL", "https://ark.cn-beijing.volces.com/api/v3")
    model = os.getenv("ARK_MODEL", "ep-20260304154408-lf678")
    
    llm = ChatOpenAI(
        model=model,
        temperature=0,
        openai_api_key=api_key,
        openai_api_base=base_url
    )
    
    tools = [extract_timeline]

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", """你是一个专业的文章分析助手，擅长从文章中提取关键事件并整理成清晰的时间线。

请按照以下格式输出时间线：
1. 【时间】事件描述
2. 【时间】事件描述
...

如果文章中没有明确的时间，请使用逻辑顺序编号。"""),
            ("human", "{input}"),
            MessagesPlaceholder(variable_name="agent_scratchpad"),
        ]
    )

    agent = create_openai_tools_agent(llm, tools, prompt)
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=False)

    result = agent_executor.invoke({
        "input": f"请分析以下文章并生成事件时间线：\n\n{article}"
    })
    
    return result['output']


if __name__ == "__main__":
    main()
