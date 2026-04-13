import os
import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional


class CacheManager:
    """缓存管理器 - 负责管理生成结果的缓存"""
    
    def __init__(self, cache_dir: Optional[str] = None):
        self.cache_dir = cache_dir or os.environ.get("CACHE_DIR", "/tmp/world_creator_cache")
        self.cache_file = os.path.join(self.cache_dir, "cache.json")
        self.cache = self._load_cache()
        self._ensure_cache_dir_exists()
    
    def _ensure_cache_dir_exists(self):
        """确保缓存目录存在"""
        os.makedirs(self.cache_dir, exist_ok=True)
    
    def _load_cache(self) -> Dict:
        """从文件加载缓存"""
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, 'r', encoding='utf-8') as f:
                    cache = json.load(f)
                    empty_cache = self._get_empty_cache_structure()
                    for key in empty_cache:
                        if key not in cache:
                            cache[key] = empty_cache[key]
                    return cache
            except Exception as e:
                print(f"[警告] 加载缓存失败: {e}")
                return self._get_empty_cache_structure()
        return self._get_empty_cache_structure()
    
    def _get_empty_cache_structure(self) -> Dict:
        """获取空的缓存结构"""
        return {
            "worldview": [],
            "character": [],
            "story": [],
            "article": [],
            "dialogue": [],
            "script": []
        }
    
    def _save_cache(self):
        """保存缓存到文件"""
        try:
            with open(self.cache_file, 'w', encoding='utf-8') as f:
                json.dump(self.cache, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"[错误] 保存缓存失败: {e}")
    
    def _get_category_by_tool(self, tool_name: str) -> Optional[str]:
        """根据工具名称获取对应的缓存分类"""
        category_map = {
            "generate_worldview": "worldview",
            "analyze_worldview": "worldview",
            "generate_character": "character",
            "generate_related_character": "character",
            "generate_character_network": "character",
            "generate_story": "story",
            "extract_timeline": "story",
            "generate_article_from_event": "article",
            "generate_dialogue": "dialogue",
            "generate_short_script": "script"
        }
        return category_map.get(tool_name)
    
    def save(self, tool_name: str, data: Dict, name: Optional[str] = None, worldview_id: Optional[str] = None) -> str:
        """
        保存内容到缓存
        
        Args:
            tool_name: 工具名称
            data: 要保存的数据（完整的返回结果）
            name: 自定义名称（可选）
            worldview_id: 关联的世界观ID（可选）
            
        Returns:
            缓存项的ID
        """
        category = self._get_category_by_tool(tool_name)
        if not category:
            raise ValueError(f"未知的工具名称: {tool_name}")
        
        item_id = str(uuid.uuid4())
        
        cache_item = {
            "id": item_id,
            "name": name or self._generate_default_name(tool_name, data),
            "tool_name": tool_name,
            "data": data,
            "worldview_id": worldview_id,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        self.cache[category].append(cache_item)
        self._save_cache()
        
        print(f"[缓存] 已保存 {tool_name} 结果 (ID: {item_id})")
        return item_id
    
    def _generate_default_name(self, tool_name: str, data: Dict) -> str:
        """生成默认名称"""
        try:
            if not isinstance(data, dict):
                return f"未命名_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                
            if tool_name == "generate_worldview" or tool_name == "analyze_worldview":
                return data.get("data", {}).get("world_name", "未命名世界观")
            elif tool_name == "generate_character":
                return data.get("data", {}).get("name", "未命名人物")
            elif tool_name == "generate_related_character":
                name = data.get("data", {}).get("name", "未命名")
                rels = data.get("data", {}).get("relationships", [])
                if rels and isinstance(rels, list) and len(rels) > 0:
                    base_char = rels[0].get("target", "某人")
                    relation = rels[0].get("type", "关联")
                    return f"{name} - {base_char}的{relation}"
                return name
            elif tool_name == "generate_character_network":
                world_name = data.get("data", {}).get("worldview", "未知世界")
                core_chars = data.get("data", {}).get("core_characters", [])
                if isinstance(core_chars, list) and core_chars:
                    return f"{world_name}关系网 - 以{core_chars[0]}为核心"
                return f"{world_name}人物关系网"
            elif tool_name == "generate_story":
                return data.get("data", {}).get("title", "未命名故事")
            elif tool_name == "extract_timeline":
                return data.get("data", {}).get("title", f"时间线分析_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
            # analyze_worldview is handled above
            elif tool_name == "generate_article_from_event":
                return data.get("data", {}).get("title", f"事件文章_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
            elif tool_name == "generate_dialogue":
                return f"对话文案_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            elif tool_name == "generate_short_script":
                return f"短剧脚本_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            return "未命名"
        except Exception as e:
            print(f"[警告] 生成默认名称失败: {e}")
            return f"未命名_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    
    def get(self, item_id: str) -> Optional[Dict]:
        """根据ID获取缓存项"""
        for category in self.cache.values():
            for item in category:
                if item["id"] == item_id:
                    return item
        return None

    def update(self, item_id: str, data: Dict, name: Optional[str] = None) -> bool:
        """更新缓存项的数据"""
        for category_name, category_list in self.cache.items():
            for item in category_list:
                if item["id"] == item_id:
                    item["data"] = data
                    if name:
                        item["name"] = name
                    item["updated_at"] = datetime.now().isoformat()
                    self._save_cache()
                    print(f"[缓存] 已更新缓存项 (ID: {item_id})")
                    return True
        print(f"[缓存] 未找到要更新的缓存项 (ID: {item_id})")
        return False
    
    def get_by_category(self, category: str) -> List[Dict]:
        """获取指定分类的所有缓存项"""
        return self.cache.get(category, [])
    
    def get_by_worldview(self, worldview_id: str, category: Optional[str] = None) -> List[Dict]:
        """根据世界观ID获取缓存项
        
        Args:
            worldview_id: 世界观ID
            category: 可选的分类限制
            
        Returns:
            匹配的缓存项列表
        """
        results = []
        categories = [category] if category else self.cache.keys()
        
        for cat in categories:
            for item in self.cache.get(cat, []):
                if item.get("worldview_id") == worldview_id:
                    results.append(item)
        
        return results
    
    def delete(self, item_id: str) -> bool:
        """删除指定ID的缓存项"""
        for category in self.cache.values():
            for i, item in enumerate(category):
                if item["id"] == item_id:
                    category.pop(i)
                    self._save_cache()
                    print(f"[缓存] 已删除缓存项 (ID: {item_id})")
                    return True
        print(f"[缓存] 未找到要删除的缓存项 (ID: {item_id})")
        return False
        
    def search(self, keyword: str) -> List[Dict]:
        """全局搜索缓存项
        
        Args:
            keyword: 搜索关键词
            
        Returns:
            匹配的缓存项列表
        """
        results = []
        if not keyword:
            return results
            
        keyword = keyword.lower()
        for category, items in self.cache.items():
            for item in items:
                # 在名称、工具名中搜索
                if keyword in item.get("name", "").lower() or keyword in item.get("tool_name", "").lower():
                    results.append(item)
                    continue
                    
                # 在数据内部进行浅层搜索
                data = item.get("data", {})
                # 解包数据
                while True:
                    if isinstance(data, list) and len(data) > 0:
                        data = data[0]
                    elif isinstance(data, dict) and "data" in data:
                        data = data["data"]
                    else:
                        break
                        
                if isinstance(data, dict):
                    # 搜索常见的文本字段
                    searchable_fields = ["world_name", "core_setting", "name", "role", "title", "story_summary", "content", "dialogue", "script", "event_description"]
                    for field in searchable_fields:
                        val = data.get(field)
                        if val and isinstance(val, str) and keyword in val.lower():
                            results.append(item)
                            break
                            
        return results
    
    def clear_category(self, category: str) -> bool:
        """清空指定分类的缓存"""
        if category in self.cache:
            count = len(self.cache[category])
            self.cache[category] = []
            self._save_cache()
            print(f"[缓存] 已清空 {category} 分类的 {count} 个缓存项")
            return True
        return False
    
    def clear_all(self):
        """清空所有缓存"""
        self.cache = self._get_empty_cache_structure()
        self._save_cache()
        print("[缓存] 已清空所有缓存")
    
    def get_all(self) -> Dict[str, List[Dict]]:
        """获取所有缓存项，按创建时间倒序排列"""
        sorted_cache = {}
        for category, items in self.cache.items():
            sorted_cache[category] = sorted(
                items, 
                key=lambda x: x.get("created_at", ""), 
                reverse=True
            )
        return sorted_cache
    
    def get_stats(self) -> Dict[str, int]:
        """获取缓存统计"""
        stats = {}
        for category, items in self.cache.items():
            stats[category] = len(items)
        return stats


# 单例实例
cache_manager = CacheManager()
