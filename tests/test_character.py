import requests
import json

BASE_URL = "http://127.0.0.1:8080"

print("=" * 60)
print("测试人物生成工具")
print("=" * 60)

# 测试人物生成
print("\n[测试] 人物生成...")
test_message = '请为"奥术机械纪元"世界观创建一个主角人物，性格特质：勇敢、机智、好奇心强，角色定位：主角'
try:
    response = requests.post(
        f"{BASE_URL}/api/chat",
        json={"message": test_message},
        headers={"Content-Type": "application/json"}
    )
    print(f"    状态码: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            print("    ✓ 人物生成成功！")
            print("\n" + "=" * 60)
            print("生成的人物：")
            print("=" * 60)
            print(data.get('response', ''))
        else:
            print(f"    ✗ API 返回错误: {data.get('error')}")
    else:
        print(f"    ✗ API 调用失败")
except Exception as e:
    print(f"    ✗ API 调用错误: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
