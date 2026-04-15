import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "../contexts/TaskContext";

interface GenerationResult {
  success?: boolean;
  response?: string;
  data?: any;
  error?: string;
}

export function useWorldview() {
  const [genre, setGenre] = useState("");
  const [theme, setTheme] = useState("");
  const [magicLevel, setMagicLevel] = useState("");
  const [technologyLevel, setTechnologyLevel] = useState("");
  const [factionsCount, setFactionsCount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [streamContent, setStreamContent] = useState("");
  const [showStream, setShowStream] = useState(false);
  const navigate = useNavigate();
  const { addTask, updateTask } = useTasks();

  const checkWorldName = (data: any): boolean => {
    if (!data) return false;

    if (data.success && data.response) {
      try {
        const parsedResponse = JSON.parse(data.response);
        if (parsedResponse.tool === "generate_worldview") {
          return true;
        }
      } catch (e) {
        console.log("解析response检查失败:", e);
      }
    }

    return !!(
      data.world_name ||
      data.data?.world_name ||
      data.data?.data?.world_name ||
      data.tool === "generate_worldview" ||
      data.data?.tool === "generate_worldview"
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setStreamContent("正在生成世界观...");
    setShowStream(true);

    const taskId = addTask({
      title: "生成世界观",
      message: "正在请求大模型...",
    });

    try {
      let prompt = "请生成一个世界观";
      if (genre) prompt += `：类型=${genre}`;
      if (theme) prompt += `，主题=${theme}`;
      if (magicLevel) prompt += `，个体战斗力水平=${magicLevel}`;
      if (technologyLevel) prompt += `，科技水平=${technologyLevel}`;
      if (factionsCount) prompt += `，势力数量=${factionsCount}`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          auto_save: true,
        }),
      });

      const data = await response.json();
      console.log("API返回的完整数据:", data);
      if (data.success) {
        setStreamContent("生成完成！");

        let finalResult = data;
        try {
          if (data.response) {
            let parsedData;
            if (typeof data.response === "string") {
              let cleanStr = data.response.trim();
              if (cleanStr.startsWith("```json")) cleanStr = cleanStr.substring(7);
              else if (cleanStr.startsWith("```")) cleanStr = cleanStr.substring(3);
              if (cleanStr.endsWith("```")) cleanStr = cleanStr.substring(0, cleanStr.length - 3);
              cleanStr = cleanStr.trim();
              if (cleanStr.startsWith("{") && !cleanStr.endsWith("}")) cleanStr += "}";
              parsedData = JSON.parse(cleanStr);
            } else {
              parsedData = data.response;
            }
            
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
          console.warn("Worldview parse response fallback:", e);
          if (data.cache_id) finalResult.cache_id = data.cache_id;
        }

        setResult(finalResult);
        updateTask(taskId, { status: "completed", message: "世界观生成完成" });
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
    genre,
    setGenre,
    theme,
    setTheme,
    magicLevel,
    setMagicLevel,
    technologyLevel,
    setTechnologyLevel,
    factionsCount,
    setFactionsCount,
    isLoading,
    result,
    setResult,
    streamContent,
    showStream,
    navigate,
    handleSubmit,
    checkWorldName,
  };
}
