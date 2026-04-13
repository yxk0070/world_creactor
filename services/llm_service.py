import os
from langchain_openai import ChatOpenAI
from langchain.output_parsers import PydanticOutputParser
from langchain.prompts import PromptTemplate
from pydantic import BaseModel
from typing import Type, TypeVar, Any

T = TypeVar('T', bound=BaseModel)

def get_llm(model: str = None, temperature: float = 0.7, max_tokens: int = 8192) -> ChatOpenAI:
    model_name = model or os.getenv("ARK_MODEL", "ep-20260304154408-lf678")
    api_key = os.getenv("ARK_API_KEY")
    base_url = os.getenv("ARK_BASE_URL", "https://ark.cn-beijing.volces.com/api/v3")
    
    return ChatOpenAI(
        model=model_name,
        api_key=api_key,
        base_url=base_url,
        temperature=temperature,
        max_tokens=max_tokens
    )

def generate_with_schema(prompt_text: str, schema: Type[T], **kwargs) -> T:
    """使用 Pydantic 约束大模型输出严格 JSON"""
    llm = get_llm()
    parser = PydanticOutputParser(pydantic_object=schema)
    
    prompt = PromptTemplate(
        template="{prompt_text}\n\n{format_instructions}\n\n请直接返回纯 JSON 文本，不要带有任何 Markdown 格式标记（如 ```json 等）。",
        input_variables=["prompt_text"],
        partial_variables={"format_instructions": parser.get_format_instructions()}
    )
    
    chain = prompt | llm | parser
    
    # 尝试解析，如果有异常由上层捕获
    try:
        result = chain.invoke({"prompt_text": prompt_text})
        return result
    except Exception as e:
        print(f"[LLM 解析失败] {e}")
        raise e
