import requests
import json

BASE_URL = "http://127.0.0.1:8080"

print("=" * 60)
print("测试 API 接口")
print("=" * 60)

# 测试 1: 访问首页
print("\n[1] 测试首页...")
try:
    response = requests.get(BASE_URL)
    print(f"    状态码: {response.status_code}")
    if response.status_code == 200:
        print("    ✓ 首页访问成功")
    else:
        print(f"    ✗ 首页访问失败: {response.text}")
except Exception as e:
    print(f"    ✗ 首页访问错误: {e}")

# 测试 2: 测试聊天 API
print("\n[2] 测试聊天 API...")
test_message = "请分析：2020年1月，疫情发现。2020年2月，措施出台。"
try:
    response = requests.post(
        f"{BASE_URL}/api/chat",
        json={"message": test_message},
        headers={"Content-Type": "application/json"}
    )
    print(f"    状态码: {response.status_code}")
    print(f"    响应头: {dict(response.headers)}")
    print(f"    响应内容: {response.text[:500]}")
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            print("    ✓ API 调用成功")
            print(f"    响应: {data.get('response', '')[:200]}...")
        else:
            print(f"    ✗ API 返回错误: {data.get('error')}")
    else:
        print(f"    ✗ API 调用失败")
except Exception as e:
    print(f"    ✗ API 调用错误: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
