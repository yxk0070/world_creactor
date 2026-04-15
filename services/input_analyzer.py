import re
import json
from typing import Dict, Optional, List, Tuple

class InputAnalyzer:
    """
    输入分析器 - 智能分析用户输入，判断应该调用哪个工具
    """
    
    def __init__(self):
        self.tool_keywords = {
            'extract_timeline': {
                'keywords': [
                    '分析', '梳理', '时间线', '事件发展', '提取', '文章',
                    'timeline', 'analyze', 'extract', 'article'
                ],
                'high_priority': ['时间线', '事件发展', '梳理时间线', '分析文章'],
                'parameters': ['article']
            },
            'analyze_worldview': {
                'keywords': [
                    '分析', '世界观', '提取', '文章', '梳理', '世界设定',
                    'worldview', 'analyze', 'extract', 'article'
                ],
                'high_priority': ['分析世界观', '提取世界观', '世界观分析', '从文章中分析世界观'],
                'parameters': ['article']
            },
            'generate_story': {
                'keywords': [
                    '写故事', '创作', '编故事', '故事', '小说', '时间', '地点', '人物',
                    'story', 'write', 'create', 'fiction', '核心故事线', '故事规模', '关键事件'
                ],
                'high_priority': ['写故事', '编故事', '创作故事', '核心故事线'],
                'parameters': ['time', 'place', 'characters', 'genre', 'story_scale']
            },
            'generate_worldview': {
                'keywords': [
                    '世界观', '世界设定', '创建世界', '设定世界', '构建世界',
                    '势力', '世界', 'worldview', 'world', 'create world', 'faction'
                ],
                'high_priority': ['世界观', '创建世界观', '世界设定'],
                'parameters': ['genre', 'theme', 'magic_level', 'technology_level', 'factions_count']
            },
            'generate_character': {
                'keywords': [
                    '人物', '角色', '创建人物', '生成角色', '人物设定', '角色设定',
                    'character', 'role', 'create character', '重要人物'
                ],
                'high_priority': ['创建人物', '生成角色', '人物设定', '重要人物'],
                'parameters': ['worldview', 'role', 'personality_traits', 'background', 'is_important']
            },
            'generate_article_from_event': {
                'keywords': [
                    '事件', '生成文章', '展开', '描写', '具体文章',
                    'article', 'event', 'generate', 'expand'
                ],
                'high_priority': ['根据事件生成文章', '展开事件', '描写这个事件'],
                'parameters': ['event_description', 'context', 'style']
            }
        }
    
    def analyze(self, user_input: str) -> Dict:
        """
        分析用户输入，返回工具调用建议
        
        Args:
            user_input: 用户输入的文本
            
        Returns:
            包含分析结果的字典
        """
        input_lower = user_input.lower()
        
        # 1. 计算每个工具的匹配分数
        tool_scores = self._calculate_scores(input_lower, user_input)
        
        # 2. 找出最高分数的工具
        best_tool, best_score = self._find_best_tool(tool_scores)
        
        # 3. 尝试提取参数
        extracted_params = self._extract_parameters(user_input, best_tool)
        
        # 4. 生成分析结果
        result = {
            'input': user_input,
            'recommended_tool': best_tool,
            'confidence': best_score,
            'extracted_parameters': extracted_params,
            'all_scores': tool_scores,
            'needs_more_info': self._needs_more_info(best_tool, extracted_params)
        }
        
        return result
    
    def _calculate_scores(self, input_lower: str, original_input: str) -> Dict[str, float]:
        """
        计算每个工具的匹配分数
        """
        scores = {}
        
        for tool_name, config in self.tool_keywords.items():
            score = 0.0
            
            # 关键词匹配（基础分）
            for keyword in config['keywords']:
                if keyword in input_lower:
                    score += 0.5
            
            # 高优先级关键词匹配
            for keyword in config['high_priority']:
                if keyword in original_input:
                    score += 2.0
            
            # 正则匹配特定模式
            score += self._pattern_match(original_input, tool_name)
            
            scores[tool_name] = score
        
        return scores
    
    def _pattern_match(self, user_input: str, tool_name: str) -> float:
        """
        使用正则表达式匹配特定模式
        """
        score = 0.0
        
        if tool_name == 'extract_timeline':
            if re.search(r'请分析.*文章|请梳理.*时间线', user_input):
                score += 3.0
        
        elif tool_name == 'analyze_worldview':
            if re.search(r'请分析.*世界观|请从.*文章中分析|世界观分析', user_input):
                score += 3.0
        
        elif tool_name == 'generate_story':
            if re.search(r'请写.*故事|请创作.*故事|时间.*地点.*人物', user_input):
                score += 3.0
        
        elif tool_name == 'generate_worldview':
            if re.search(r'请创建.*世界观|请生成.*世界观|类型.*主题', user_input):
                score += 3.0
            if re.search(r'势力数量|factions_count', user_input):
                score += 1.0
            if re.search(r'为.*世界观创建.*人物', user_input):
                score -= 2.0
        
        elif tool_name == 'generate_character':
            if re.search(r'请创建.*人物|请生成.*角色|性格特质|角色定位', user_input):
                score += 3.0
            if re.search(r'为.*世界观创建.*人物', user_input):
                score += 2.0
                
        elif tool_name == 'generate_article_from_event':
            if re.search(r'请.*根据.*事件.*生成|展开.*事件|写.*事件', user_input):
                score += 3.0
        
        return score
    
    def _find_best_tool(self, scores: Dict[str, float]) -> Tuple[Optional[str], float]:
        """
        找出分数最高的工具
        """
        if not scores:
            return None, 0.0
        
        best_tool = max(scores.items(), key=lambda x: x[1])
        
        if best_tool[1] > 0:
            return best_tool[0], best_tool[1]
        else:
            return None, 0.0
    
    def _extract_parameters(self, user_input: str, tool_name: Optional[str]) -> Dict:
        """
        从用户输入中提取参数
        """
        params = {}
        
        if not tool_name:
            return params
        
        # 通用参数提取 - 改进版，匹配到逗号或空格为止
        param_patterns = {
            'article': r'文章[：:]\s*(.+?)(?:\n|$)',
            'time': r'时间[=:：]\s*([^,，\s]+)',
            'place': r'地点[=:：]\s*([^,，\s]+)',
            'characters': r'人物[=:：]\s*([^,，\s]+)',
            'genre': r'类型[=:：]\s*([^,，\s]+)',
            'theme': r'主题[=:：]\s*([^,，\s]+)',
            'magic_level': r'魔法水平[=:：]\s*([^,，\s]+)',
            'technology_level': r'科技水平[=:：]\s*([^,，\s]+)',
            'factions_count': r'势力数量[=:：]\s*(\d+)',
            'worldview': r'为[「\"](.+?)[」\"]世界观|世界观[=:：]\s*([^,，\s]+)',
            'role': r'角色定位[=:：]\s*([^,，\s]+)',
            'personality_traits': r'性格特质[=:：]\s*([^,，\s]+)',
            'background': r'背景故事[=:：]\s*([^,，\s]+)',
            'story_scale': r'故事规模[=:：]\s*([^,，\s]+)',
            'is_important': r'是否为重要人物[=:：]\s*(true|false|是|否)',
            'event_description': r'事件描述[=:：]\s*([^,，\s]+)',
            'context': r'上下文[=:：]\s*([^,，\s]+)',
            'style': r'风格[=:：]\s*([^,，\s]+)'
        }
        
        for param_name, pattern in param_patterns.items():
            match = re.search(pattern, user_input)
            if match:
                # 取第一个非None的捕获组
                for group in match.groups():
                    if group:
                        params[param_name] = group.strip()
                        break
        
        # 特殊处理：extract_timeline 或 analyze_worldview 可能整段都是文章
        if (tool_name == 'extract_timeline' or tool_name == 'analyze_worldview') and 'article' not in params:
            # 如果有明确的文章标识
            article_match = re.search(r'(?:文章|以下)[:：]?\s*(.+)', user_input, re.DOTALL)
            if article_match:
                params['article'] = article_match.group(1).strip()
            else:
                # 假设整个输入（除了前几个词）是文章
                words = user_input.split()
                if len(words) > 3:
                    params['article'] = ' '.join(words)
                    
        # 特殊处理：generate_article_from_event 可能整段都是事件描述
        if tool_name == 'generate_article_from_event' and 'event_description' not in params:
            event_match = re.search(r'(?:事件|以下)[:：]?\s*(.+)', user_input, re.DOTALL)
            if event_match:
                params['event_description'] = event_match.group(1).strip()
            else:
                params['event_description'] = user_input
        
        # 特殊处理：为某某世界观创建人物的情况
        if tool_name in ['generate_character', 'generate_story'] and 'worldview' not in params:
            worldview_match = re.search(r'为[「\""\']?(.+?)[「\""\']?世界观|世界观[=:：]\s*([^,，\s]+)', user_input)
            if worldview_match:
                # worldview_match.group(1) is from "为xxx世界观", group(2) is from "世界观=xxx"
                params['worldview'] = (worldview_match.group(1) or worldview_match.group(2) or "").strip()
        
        # 转换数值类型
        if 'factions_count' in params:
            try:
                params['factions_count'] = int(params['factions_count'])
            except ValueError:
                pass
        
        # 转换is_important为布尔值
        if 'is_important' in params:
            val = params['is_important'].lower()
            params['is_important'] = val in ['true', '是', 'yes', '1']
        
        # 自动识别重要人物：根据角色定位判断
        if tool_name == 'generate_character' and 'is_important' not in params:
            role = params.get('role', '')
            if role in ['主角', '反派', '导师', '核心配角']:
                params['is_important'] = True
            elif role in ['路人配角']:
                params['is_important'] = False
        
        return params
    
    def _needs_more_info(self, tool_name: Optional[str], params: Dict) -> bool:
        """
        判断是否需要更多信息才能调用工具
        """
        if not tool_name:
            return True
        
        required_params = {
            'extract_timeline': ['article'],
            'analyze_worldview': ['article'],
            'generate_story': [], # 放宽条件，让模型自己判断是否需要更多信息
            'generate_worldview': ['genre'],
            'generate_character': ['worldview'],
            'generate_article_from_event': ['event_description']
        }
        
        required = required_params.get(tool_name, [])
        missing = [param for param in required if param not in params]
        
        return len(missing) > 0
    
    def get_tool_description(self, tool_name: str) -> str:
        """
        获取工具的描述
        """
        descriptions = {
            'extract_timeline': '从文章中提取事件时间线',
            'analyze_worldview': '从文章中提取和分析世界观',
            'generate_story': '根据时间、地点、人物创作故事',
            'generate_worldview': '生成完整的世界观设定（含势力）',
            'generate_character': '结合世界观生成人物设定',
            'generate_article_from_event': '根据事件节点生成具体文章'
        }
        return descriptions.get(tool_name, '未知工具')
    
    def get_missing_params_hint(self, tool_name: str, params: Dict) -> List[str]:
        """
        获取缺失参数的提示信息
        """
        hints = []
        
        if tool_name == 'extract_timeline':
            if 'article' not in params:
                hints.append('请提供要分析的文章内容')
        
        elif tool_name == 'analyze_worldview':
            if 'article' not in params:
                hints.append('请提供要分析世界观的文章内容')
        
        elif tool_name == 'generate_story':
            # 移除强制要求，如果缺失参数只是建议
            pass
        
        elif tool_name == 'generate_worldview':
            if 'genre' not in params:
                hints.append('请指定世界观类型（如：奇幻、科幻、武侠等）')
        
        elif tool_name == 'generate_character':
            if 'worldview' not in params:
                hints.append('请提供世界观背景或世界观名称')
                
        elif tool_name == 'generate_article_from_event':
            if 'event_description' not in params:
                hints.append('请提供事件节点的描述')
        
        return hints


# 单例实例
analyzer = InputAnalyzer()


if __name__ == "__main__":
    test_cases = [
        "请分析以下文章：2020年1月，新冠疫情在中国武汉首次被发现。",
        "请写一个故事：时间=未来，地点=火星基地，人物=宇航员",
        "请创建一个世界观：类型=奇幻，主题=魔法与科技共存",
        "请为奥术机械纪元世界观创建一个主角人物",
        "你好，今天天气怎么样？"
    ]
    
    print("=" * 60)
    print("输入分析器测试")
    print("=" * 60)
    
    for i, test_input in enumerate(test_cases, 1):
        print(f"\n[测试 {i}] {test_input}")
        result = analyzer.analyze(test_input)
        print(f"    推荐工具: {result['recommended_tool']}")
        print(f"    置信度: {result['confidence']}")
        print(f"    提取参数: {result['extracted_parameters']}")
        print(f"    需要更多信息: {result['needs_more_info']}")
