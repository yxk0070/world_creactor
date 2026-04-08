import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

interface Network {
  id: string;
  name: string;
  data?: any;
}

interface GenerationResult {
  success?: boolean;
  response?: string;
  data?: any;
  error?: string;
}

export function useCoreStoryline() {
  const [selectedWorldview, setSelectedWorldview] = useState("");
  const [worldviewName, setWorldviewName] = useState("");
  const [worldviews, setWorldviews] = useState<Worldview[]>([]);
  const [selectedCharacterIds, setSelectedCharacterIds] = useState<string[]>(
    []
  );
  const [allCharacters, setAllCharacters] = useState<Character[]>([]);
  const [storyScale, setStoryScale] = useState("中等");
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [networks, setNetworks] = useState<Network[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [streamContent, setStreamContent] = useState("");
  const [showStream, setShowStream] = useState(false);
  const navigate = useNavigate();
  const { addTask, updateTask } = useTasks();

  const filteredCharacters = selectedWorldview
    ? allCharacters.filter((char) => {
        const selectedWorldviewObj = worldviews.find(
          (w) => w.id === selectedWorldview
        );
        if (!selectedWorldviewObj) return false;
        const worldName =
          selectedWorldviewObj.data?.data?.world_name ||
          selectedWorldviewObj.name;

        if (char.worldview_id === selectedWorldview) return true;

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
      })
    : allCharacters;

  useEffect(() => {
    loadWorldviews();
    loadCharacters();
  }, []);

  useEffect(() => {
    if (selectedWorldview) {
      setSelectedCharacterIds((prev) => {
        const selectedWorldviewObj = worldviews.find(
          (w) => w.id === selectedWorldview
        );
        if (!selectedWorldviewObj) return [];
        const worldName =
          selectedWorldviewObj.data?.data?.world_name ||
          selectedWorldviewObj.name;

        return prev.filter((charId) => {
          const char = allCharacters.find((c) => c.id === charId);
          if (!char) return false;

          if (char.worldview_id === selectedWorldview) return true;

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
  }, [selectedWorldview, allCharacters, worldviews]);

  const getCharacterName = (characterId: string) => {
    const character = allCharacters.find((c) => c.id === characterId);
    if (character) {
      return character.data?.data?.name || character.name;
    }
    return "";
  };

  const getCharacterDetails = (characterId: string) => {
    const character = allCharacters.find((c) => c.id === characterId);
    if (character) {
      const cd = character.data?.data || character.data || {};
      const name = cd.name || character.name || "未知";
      const role = cd.basic_info?.role || cd.role || "";
      const bg = cd.background || "";
      const personality = cd.personality || "";

      let details = name;
      const extras = [];
      if (role) extras.push(`身份:${role}`);
      if (personality) extras.push(`性格:${personality}`);
      if (bg) extras.push(`背景:${bg}`);

      if (extras.length > 0) {
        details += ` (${extras.join(", ")})`;
      }
      return details;
    }
    return "";
  };

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

      let combined: any[] = [];
      if (data1.success) combined = [...combined, ...data1.data];
      if (data2.success) combined = [...combined, ...data2.data];

      setWorldviews(combined);
    } catch (error) {
      console.error("加载世界观失败:", error);
    }
  };

  const loadCharacters = async () => {
    try {
      const [res1, res2] = await Promise.all([
        fetch("/api/cache/category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: "character" }),
        }),
        fetch("/api/cache/category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: "generate_related_character" }),
        }),
      ]);
      const data1 = await res1.json();
      const data2 = await res2.json();

      let combined: any[] = [];
      if (data1.success) {
        combined = [
          ...combined,
          ...data1.data.map((c: any) => ({ ...c, _source: "main" })),
        ];
      }
      if (data2.success) {
        combined = [
          ...combined,
          ...data2.data.map((c: any) => ({ ...c, _source: "related" })),
        ];
      }

      setAllCharacters(combined);
    } catch (error) {
      console.error("加载人物失败:", error);
    }
  };

  const handleCharacterToggle = (characterId: string) => {
    setSelectedCharacterIds((prev) => {
      if (prev.includes(characterId)) {
        return prev.filter((id) => id !== characterId);
      } else {
        return [...prev, characterId];
      }
    });
  };

  const handleWorldviewChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedWorldview(value);
    if (value) {
      const worldview = worldviews.find((w) => w.id === value);
      if (worldview) {
        const worldName = worldview.data?.data?.world_name || worldview.name;
        setWorldviewName(worldName);
      }
    } else {
      setWorldviewName("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setStreamContent("正在生成核心故事线...");
    setShowStream(true);

    const taskId = addTask({
      title: "生成故事线",
      message: `为世界观 ${worldviewName || "未知"} 生成中...`,
    });

    try {
      let prompt = "请生成核心故事线";
      if (selectedWorldview) {
        const worldview = worldviews.find((w) => w.id === selectedWorldview);
        if (worldview) {
          const wd = worldview.data?.data || worldview.data || {};
          prompt += `\n【世界观设定】\n名称：${
            wd.world_name || worldviewName
          }\n背景与规则：${wd.history || ""} ${
            wd.basic_settings?.core_theme || ""
          }\n地理与场景：${wd.geography || ""}\n社会与势力：${
            wd.social_structure || ""
          } ${(wd.factions || []).map((f: any) => f.name).join("、")}`;
        } else if (worldviewName) {
          prompt += `，世界观=${worldviewName}`;
        }
      } else if (worldviewName) {
        prompt += `，世界观=${worldviewName}`;
      }

      const charDetails = selectedCharacterIds
        .map(getCharacterDetails)
        .filter(Boolean)
        .join("；\n");
      if (charDetails) prompt += `\n【核心人物信息】\n${charDetails}`;

      prompt += `\n【要求】故事规模=${storyScale}`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          worldview_id: selectedWorldview || undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setStreamContent("生成完成！");
        setResult(data);
        updateTask(taskId, { status: "completed", message: "故事线生成完成" });
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
    selectedWorldview,
    setSelectedWorldview,
    worldviewName,
    setWorldviewName,
    worldviews,
    selectedCharacterIds,
    allCharacters,
    storyScale,
    setStoryScale,
    isLoading,
    result,
    setResult,
    streamContent,
    showStream,
    navigate,
    filteredCharacters,
    getCharacterName,
    handleCharacterToggle,
    handleWorldviewChange,
    handleSubmit,
  };
}
