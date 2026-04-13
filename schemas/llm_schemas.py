from pydantic import BaseModel, Field
from typing import List, Optional

class WorldviewBasicSettings(BaseModel):
    genre: str = Field(description="题材类型（如：奇幻/科幻/武侠/现代等）")
    combat_power_level: str = Field(description="个体战斗力水平（无/低/中等/高/极高）")
    technology_level: str = Field(description="科技水平（古代/近代/现代/未来）")
    core_theme: str = Field(description="核心主题")

class Faction(BaseModel):
    name: str = Field(description="势力名称")
    leader: str = Field(description="势力首领")
    territory: str = Field(description="势力地盘")
    ideology: str = Field(description="势力理念")

class WorldviewData(BaseModel):
    world_name: str = Field(description="世界观名称")
    basic_settings: WorldviewBasicSettings
    geography: str = Field(description="地理环境描述")
    social_structure: str = Field(description="社会结构描述")
    factions: List[Faction] = Field(description="主要势力列表")
    key_locations: List[str] = Field(description="关键地点列表")
    important_concepts: List[str] = Field(description="重要概念列表")

class CharacterBasicInfo(BaseModel):
    gender: str = Field(description="性别")
    age: int = Field(description="年龄")
    role: str = Field(description="在故事中的角色（主角/反派/导师等）")
    appearance: str = Field(description="外貌特征")
    personality: str = Field(description="性格特点")

class CharacterAbilities(BaseModel):
    combat_style: str = Field(description="战斗风格")
    special_skills: List[str] = Field(description="特殊技能列表")
    weaknesses: List[str] = Field(description="弱点列表")

class CharacterLifeExperience(BaseModel):
    background: str = Field(description="背景故事")
    key_events: List[str] = Field(description="关键事件列表")
    motivation: str = Field(description="核心动机")
    death: Optional[str] = Field(description="死亡结局（可选）", default=None)

class CharacterRelationship(BaseModel):
    target: str = Field(description="目标人物名称")
    type: str = Field(description="关系类型")
    description: str = Field(description="关系描述")

class CharacterData(BaseModel):
    name: str = Field(description="人物名称")
    basic_info: CharacterBasicInfo
    abilities: CharacterAbilities
    life_experience: CharacterLifeExperience
    relationships: List[CharacterRelationship] = Field(description="人际关系列表")

class StorySubEvent(BaseModel):
    sub_order: int = Field(description="子事件序号")
    title: str = Field(description="子事件标题")
    description: str = Field(description="子事件描述")

class StoryEvent(BaseModel):
    event_order: int = Field(description="事件序号")
    event_title: str = Field(description="事件标题")
    description: str = Field(description="事件详细描述")
    key_characters: List[str] = Field(description="关键人物列表")
    location: str = Field(description="事件发生地点")
    significance: str = Field(description="事件意义")
    sub_events: List[StorySubEvent] = Field(description="子事件列表", default_factory=list)
    transition_to_next: str = Field(description="到下一个事件的过渡篇章", default="")

class StoryData(BaseModel):
    title: str = Field(description="故事标题")
    core_theme: str = Field(description="核心主题")
    story_summary: str = Field(description="故事摘要")
    key_events: List[StoryEvent] = Field(description="关键事件列表")

class TimelineEvent(BaseModel):
    number: int = Field(description="事件编号")
    title: str = Field(description="事件标题")
    time: str = Field(description="事件发生时间")
    location: str = Field(description="地点")
    description: str = Field(description="事件描述")
    characters: List[str] = Field(description="关键人物列表")
    importance: str = Field(description="重要性（高/中/低）")

class TimelineData(BaseModel):
    events: List[TimelineEvent] = Field(description="时间线事件列表")
