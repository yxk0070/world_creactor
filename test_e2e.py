import requests
import json
import sseclient
import time

BASE_URL = "http://127.0.0.1:8080/api"

def run_test():
    start_time = time.time()
    
    print("========== 1. 测试: 世界观生成 (同步) ==========")
    payload1 = {
        "message": "请生成一个世界观：类型=科幻，主题=赛博朋克，个体战斗力水平=中等，科技水平=未来，势力数量=2",
        "auto_save": True
    }
    t1 = time.time()
    res1 = requests.post(f"{BASE_URL}/chat", json=payload1, timeout=300)
    print(f"状态码: {res1.status_code}, 耗时: {time.time() - t1:.2f}s")
    
    wid = None
    if res1.status_code == 200:
        data = res1.json()
        if data.get("success"):
            print("✅ 世界观生成成功!")
            wid = data.get("cache_id")
            print(f"✅ 缓存ID: {wid}")
        else:
            print("❌ 世界观生成失败:", data.get("error"))
    else:
        print("❌ 请求失败!")

    print("\n========== 2. 测试: 角色生成 (同步) ==========")
    payload2 = {
        "message": "请创建一个人物\n【要求】名字：林克\n角色定位：主角\n人物简介：底层网络黑客，靠盗取大公司数据维生",
        "auto_save": True,
        "worldview_id": wid
    }
    t2 = time.time()
    res2 = requests.post(f"{BASE_URL}/chat", json=payload2, timeout=300)
    print(f"状态码: {res2.status_code}, 耗时: {time.time() - t2:.2f}s")
    if res2.status_code == 200:
        data = res2.json()
        if data.get("success"):
            print("✅ 角色生成成功!")
            print(f"✅ 缓存ID: {data.get('cache_id')}")
        else:
            print("❌ 角色生成失败:", data.get("error"))
            
    print("\n========== 3. 测试: 核心故事线生成 (SSE流式) ==========")
    payload3 = {
        "message": "请生成核心故事线\n【要求】故事规模=迷你，是否同时生成故事细节=false\n请使用 generate_story 工具",
        "auto_save": True,
        "scenario": "小说",
        "worldview_id": wid
    }
    t3 = time.time()
    res3 = requests.post(f"{BASE_URL}/chat/workflow", json=payload3, stream=True, timeout=300)
    print(f"状态码: {res3.status_code}")
    if res3.status_code == 200:
        client = sseclient.SSEClient(res3)
        chunks = 0
        for event in client.events():
            try:
                data = json.loads(event.data)
                if data['type'] == 'chunk':
                    chunks += 1
                    # print(".", end="", flush=True)
                elif data['type'] == 'end':
                    print(f"\n✅ 故事线流式生成成功! 收到 {chunks} 个数据块, 耗时: {time.time() - t3:.2f}s")
                    break
                elif data['type'] == 'error':
                    print("\n❌ 故事线流式错误:", data.get('message'))
                    break
            except Exception as e:
                pass
                
    print("\n========== 4. 测试: 获取缓存列表 ==========")
    t4 = time.time()
    res4 = requests.get(f"{BASE_URL}/cache/all")
    print(f"状态码: {res4.status_code}, 耗时: {time.time() - t4:.2f}s")
    if res4.status_code == 200:
        data = res4.json()
        print("✅ 缓存统计:", data.get('stats'))
        
    print(f"\n========== 全量流程测试完成，总耗时: {time.time() - start_time:.2f}s ==========")

if __name__ == "__main__":
    run_test()