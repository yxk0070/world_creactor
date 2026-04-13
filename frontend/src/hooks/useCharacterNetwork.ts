import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTasks } from "../contexts/TaskContext";

interface Worldview {
  id: string;
  name: string;
  data?: any;
}

interface Character {
  id: string;
  name: string;
  worldview_id?: string;
  data?: any;
}

interface GenerationResult {
  success?: boolean;
  response?: string;
  data?: any;
  error?: string;
}

export function useCharacterNetwork() {
  const [selectedWorldviewId, setSelectedWorldviewId] = useState("");
  const [worldviews, setWorldviews] = useState<Worldview[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [networkSize, setNetworkSize] = useState("3");
  const [relationshipTypes, setRelationshipTypes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [streamContent, setStreamContent] = useState("");
  const [showStream, setShowStream] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { addTask, updateTask } = useTasks();

  const filteredCharacters = selectedWorldviewId
    ? characters.filter((char) => {
        // 如果后端保存了 worldview_id，直接使用
        if (char.worldview_id === selectedWorldviewId) return true;

        // 否则通过匹配世界观名称来筛选
        const selectedWorldview = worldviews.find(
          (w) => w.id === selectedWorldviewId
        );
        if (!selectedWorldview) return false;

        const worldName =
          selectedWorldview.data?.data?.world_name || selectedWorldview.name;

        // 如果该人物记录了 worldview_id 并且匹配当前选中的 id，直接返回 true
        if (char.worldview_id === selectedWorldviewId) return true;

        // 尝试从人物数据中获取世界观名称
        const charWorldName =
          char.data?.parameters?.worldview ||
          char.data?.data?.worldview ||
          char.data?.worldview ||
          char.data?.data?.world_name;

        // 尝试在背景故事中寻找世界观名称的匹配
        const background =
          char.data?.data?.background || char.data?.background || "";

        // 如果这个人物是在选择了该世界观的情况下生成的，它的参数中应该带有正确的 worldview
        const isWorldNameMatch =
          charWorldName &&
          worldName &&
          (charWorldName === worldName ||
            charWorldName.includes(worldName) ||
            worldName.includes(charWorldName));

        const isBackgroundMatch =
          background && worldName && background.includes(worldName);

        // 如果名字包含世界观名字（作为备用匹配）
        const isNameMatch =
          char.name && worldName && char.name.includes(worldName);

        return isWorldNameMatch || isBackgroundMatch || isNameMatch;
      })
    : characters;

  useEffect(() => {
    loadWorldviews();
    loadCharacters();

    // 如果有角色传过来，尝试在列表中找到它并选中
    if (location.state && location.state.characterContext) {
      try {
        const charCtx = JSON.parse(location.state.characterContext);
        if (charCtx && charCtx.name) {
          // 由于异步加载，可能稍后才需要选中，我们可以等字符加载完再选中
          // 这里先存储到一个ref或者在loadCharacters的.then中处理，简单起见直接设置一个定时器
          setTimeout(() => {
            setCharacters((prevChars) => {
              const found = prevChars.find((c) => c.name === charCtx.name);
              if (found) {
                setSelectedCharacters([found.id]);
              }
              return prevChars;
            });
          }, 500);
        }
      } catch (e) {}
    }
  }, [location.state]);

  useEffect(() => {
    if (selectedWorldviewId) {
      setSelectedCharacters((prev) => {
        const selectedWorldview = worldviews.find(
          (w) => w.id === selectedWorldviewId
        );
        if (!selectedWorldview) return [];
        const worldName =
          selectedWorldview.data?.data?.world_name || selectedWorldview.name;

        return prev.filter((charId) => {
          const char = characters.find((c) => c.id === charId);
          if (!char) return false;

          if (char.worldview_id === selectedWorldviewId) return true;

          const charWorldName =
            char.data?.parameters?.worldview ||
            char.data?.data?.worldview ||
            char.data?.worldview ||
            char.data?.data?.world_name;

          const background =
            char.data?.data?.background || char.data?.background || "";

          const isWorldNameMatch =
            charWorldName &&
            worldName &&
            (charWorldName === worldName ||
              charWorldName.includes(worldName) ||
              worldName.includes(charWorldName));

          const isBackgroundMatch =
            background && worldName && background.includes(worldName);
          const isNameMatch =
            char.name && worldName && char.name.includes(worldName);

          return isWorldNameMatch || isBackgroundMatch || isNameMatch;
        });
      });
    }
  }, [selectedWorldviewId, characters, worldviews]);

  const loadWorldviews = async () => {
    try {
      const [res1, res2] = await Promise.all([
        fetch("/api/cache/category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: "worldview" }),
        }),
        fetch("/api/cache/category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: "worldview_analysis" }),
        }),
      ]);
      const data1 = await res1.json();
      const data2 = await res2.json();

      let combined: Worldview[] = [];
      if (data1.success) combined = [...combined, ...data1.data];
      if (data2.success) combined = [...combined, ...data2.data];

      setWorldviews(combined);
    } catch (error) {
      console.error("加载世界观失败:", error);
    }
  };

  const loadCharacters = async () => {
    try {
      const response = await fetch("/api/cache/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: "character" }),
      });
      const data = await response.json();
      if (data.success) {
        setCharacters(data.data);
      }
    } catch (error) {
      console.error("加载人物失败:", error);
    }
  };

  const handleCharacterToggle = (characterId: string) => {
    setSelectedCharacters((prev) => {
      if (prev.includes(characterId)) {
        return prev.filter((id) => id !== characterId);
      } else {
        return [...prev, characterId];
      }
    });
  };

  const getCharacterName = (characterId: string) => {
    const character = characters.find((c) => c.id === characterId);
    if (character) {
      return character.data?.data?.name || character.name;
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setStreamContent("正在生成人物关系网...");
    setShowStream(true);

    const taskId = addTask({
      title: "生成关系网",
      message: "正在梳理人物关系...",
    });

    try {
      let prompt = "请生成人物关系网";

      if (selectedWorldviewId) {
        const worldview = worldviews.find((w) => w.id === selectedWorldviewId);
        if (worldview) {
          const wd = worldview.data?.data || worldview.data || {};
          prompt += `\n【世界观设定】\n名称：${
            wd.world_name || worldview.name
          }\n背景与规则：${wd.history || ""} ${
            wd.basic_settings?.core_theme || ""
          }\n社会与势力：${wd.social_structure || ""} ${(wd.factions || [])
            .map((f: any) => f.name)
            .join("、")}`;
        }
      }

      if (selectedCharacters.length > 0) {
        const charNames = selectedCharacters.map(getCharacterName).join("、");
        prompt += `，核心人物="${charNames}"`;
      }

      if (networkSize) prompt += `，关系网规模="${networkSize}个新人物"`;
      if (relationshipTypes) prompt += `，关系类型="${relationshipTypes}"`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          worldview_id: selectedWorldviewId || undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setStreamContent("生成完成！");

        let finalResult = data;
        try {
          if (data.response) {
            const parsedData = JSON.parse(data.response);
            if (Array.isArray(parsedData) && parsedData.length > 0) {
              finalResult = parsedData[0];
            } else if (parsedData && typeof parsedData === "object") {
              finalResult = parsedData;
            }
          }

          if (data.cache_id) {
            finalResult.cache_id = data.cache_id;
          } else if (data.cache_ids && data.cache_ids.length > 0) {
            finalResult.cache_id = data.cache_ids[0];
          }
        } catch (e) {
          console.warn("CharacterNetwork parse response fallback:", e);
          if (data.cache_id) finalResult.cache_id = data.cache_id;
        }

        setResult(finalResult);
        updateTask(taskId, { status: "completed", message: "关系网生成完成" });
      } else {
        const errorMsg = data.error || "未知错误";
        setStreamContent("生成失败：" + errorMsg);
        updateTask(taskId, {
          status: "error",
          message: "生成失败：" + errorMsg,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      setStreamContent("生成失败：" + errorMessage);
      updateTask(taskId, {
        status: "error",
        message: "生成出错：" + errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    selectedWorldviewId,
    setSelectedWorldviewId,
    worldviews,
    selectedCharacters,
    characters,
    networkSize,
    setNetworkSize,
    relationshipTypes,
    setRelationshipTypes,
    isLoading,
    result,
    setResult,
    streamContent,
    showStream,
    navigate,
    filteredCharacters,
    handleCharacterToggle,
    getCharacterName,
    handleSubmit,
  };
}
