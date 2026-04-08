import requests
import json

BASE_URL = "http://127.0.0.1:8080"

print("=" * 60)
print("测试世界观生成工具")
print("=" * 60)

# 测试世界观生成
print("\n[测试] 世界观生成...")
test_message = "请创建一个世界观：类型=奇幻，主题=魔法与科技共存，魔法水平=高，科技水平=中世纪"
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
            print("    ✓ 世界观生成成功！")
            print("\n" + "=" * 60)
            print("生成的世界观：")
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
