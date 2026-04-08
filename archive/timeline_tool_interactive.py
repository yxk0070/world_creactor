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


def analyze_article(article: str):
    """
    分析文章并生成时间线
    
    Args:
        article: 要分析的文章
        
    Returns:
        分析结果
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


def main():
    print("=" * 60)
    print("文章事件线梳理工具 - 交互式版本")
    print("=" * 60)
    print("\n使用说明：")
    print("1. 输入你要分析的文章（可以粘贴多行文本）")
    print("2. 输入完成后，在新的一行输入 'END' 来结束输入")
    print("3. 输入 'quit' 或 'exit' 退出程序")
    print("=" * 60 + "\n")
    
    while True:
        print("\n请输入文章内容（输入 END 结束，quit 退出）：")
        print("-" * 60)
        
        lines = []
        while True:
            try:
                line = input()
                if line.strip().upper() == 'END':
                    break
                if line.strip().lower() in ['quit', 'exit']:
                    print("\n感谢使用，再见！")
                    return
                lines.append(line)
            except EOFError:
                break
        
        article = '\n'.join(lines).strip()
        
        if not article:
            print("\n文章内容为空，请重新输入。")
            continue
        
        print("\n" + "=" * 60)
        print("正在分析文章...")
        print("=" * 60 + "\n")
        
        try:
            result = analyze_article(article)
            print("\n" + "=" * 60)
            print("分析结果：")
            print("=" * 60)
            print(result)
            print("=" * 60)
        except Exception as e:
            print(f"\n分析过程中出现错误：{e}")


if __name__ == "__main__":
    main()
