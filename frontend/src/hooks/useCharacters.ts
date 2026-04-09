import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "../contexts/TaskContext";

interface Worldview {
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

export function useCharacters() {
  const [worldviewName, setWorldviewName] = useState("");
  const [selectedWorldview, setSelectedWorldview] = useState("");
  const [worldviews, setWorldviews] = useState<Worldview[]>([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [personality, setPersonality] = useState("");
  const [background, setBackground] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [streamContent, setStreamContent] = useState("");
  const [showStream, setShowStream] = useState(false);
  const navigate = useNavigate();
  const { addTask, updateTask } = useTasks();

  useEffect(() => {
    loadWorldviews();
  }, []);

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

  const checkCharacter = (data: any): boolean => {
    if (!data) return false;

    if (data.success && data.response) {
      try {
        const parsedResponse = JSON.parse(data.response);
        if (
          parsedResponse.tool === "generate_character" ||
          parsedResponse.tool === "generate_related_character"
        ) {
          return true;
        }
      } catch (e) {
        console.log("解析response检查失败:", e);
      }
    }

    return !!(
      data.name ||
      data.data?.name ||
      data.data?.data?.name ||
      data.tool === "generate_character" ||
      data.tool === "generate_related_character" ||
      data.data?.tool === "generate_character" ||
      data.data?.tool === "generate_related_character"
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setStreamContent("正在生成人物...");
    setShowStream(true);

    const taskId = addTask({
      title: "生成人物",
      message: `正在生成人物 ${name || ""}...`,
    });

    try {
      let prompt = "请创建一个人物";
      if (selectedWorldview) {
        const worldview = worldviews.find((w) => w.id === selectedWorldview);
        if (worldview) {
          const wd = worldview.data?.data || worldview.data || {};
          prompt += `\n【世界观设定】\n名称：${
            wd.world_name || worldviewName
          }\n背景与规则：${wd.history || ""} ${
            wd.basic_settings?.core_theme || ""
          }\n社会与势力：${wd.social_structure || ""} ${(wd.factions || [])
            .map((f: any) => f.name)
            .join("、")}`;
        } else if (worldviewName) {
          prompt += `：为"${worldviewName}"世界观`;
        }
      } else if (worldviewName) {
        prompt += `：为"${worldviewName}"世界观`;
      }

      prompt += "\n【人物要求】";
      if (name) prompt += `\n名字：${name}`;
      if (role) prompt += `\n角色定位：${role}`;
      if (personality) prompt += `\n性格特质：${personality}`;
      if (background) prompt += `\n人物简介/背景：${background}`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          worldview_id: selectedWorldview || undefined,
        }),
      });

      const data = await response.json();
      console.log("API返回的完整数据:", data);
      if (data.success) {
        setStreamContent("生成完成！");
        
        let finalResult = data;
        try {
          if (data.response) {
            const parsedData = JSON.parse(data.response);
            if (Array.isArray(parsedData) && parsedData.length > 0) {
              finalResult = parsedData[0];
            } else if (parsedData && typeof parsedData === 'object') {
              finalResult = parsedData;
            }
          }
          
          if (data.cache_id) {
             finalResult.cache_id = data.cache_id;
          } else if (data.cache_ids && data.cache_ids.length > 0) {
             finalResult.cache_id = data.cache_ids[0];
          }
        } catch (e) {
          console.warn("Character parse response fallback:", e);
          if (data.cache_id) finalResult.cache_id = data.cache_id;
        }

        setResult(finalResult);
        updateTask(taskId, { status: "completed", message: "人物生成完成" });
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
    worldviewName,
    setWorldviewName,
    selectedWorldview,
    worldviews,
    name,
    setName,
    role,
    setRole,
    personality,
    setPersonality,
    background,
    setBackground,
    isLoading,
    result,
    setResult,
    streamContent,
    showStream,
    navigate,
    handleWorldviewChange,
    handleSubmit,
    checkCharacter,
  };
}
