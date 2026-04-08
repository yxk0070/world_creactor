from dotenv import load_dotenv
from langchain.tools import tool
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder


load_dotenv()


@tool
def multiply(a: int, b: int) -> int:
    """Multiply two numbers."""
    print(f"  [Tool] 调用 multiply({a}, {b})")
    return a * b


@tool
def add(a: int, b: int) -> int:
    """Add two numbers."""
    print(f"  [Tool] 调用 add({a}, {b})")
    return a + b


def simulate_agent():
    print("=" * 50)
    print("LangChain Agent 模拟演示")
    print("=" * 50)
    
    question = "What is 2 + 3 multiplied by 5?"
    print(f"\n用户问题: {question}\n")
    
    print("> 进入 Agent 执行链...")
    
    print("\n步骤 1: 分析问题，先计算 2 + 3")
    result1 = add.invoke({"a": 2, "b": 3})
    print(f"  结果: {result1}")
    
    print("\n步骤 2: 计算 {result1} × 5")
    result2 = multiply.invoke({"a": result1, "b": 5})
    print(f"  结果: {result2}")
    
    print("\n> Agent 执行链结束")
    print("=" * 50)
    print(f"最终答案: {result2}")
    print("=" * 50)


if __name__ == "__main__":
    simulate_agent()
