import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "../contexts/TaskContext";

interface AnalysisResult {
  success?: boolean;
  response?: string;
  data?: any;
  error?: string;
}

export function useWorldviewAnalysis() {
  const [article, setArticle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [streamContent, setStreamContent] = useState("");
  const [showStream, setShowStream] = useState(false);
  const navigate = useNavigate();
  const { addTask, updateTask } = useTasks();

  const checkWorldviewData = (data: any): boolean => {
    if (!data) return false;

    if (data.success && data.response) {
      try {
        const parsedResponse = JSON.parse(data.response);
        if (parsedResponse.tool === "analyze_worldview") {
          return true;
        }
      } catch (e) {
        console.log("解析response检查失败:", e);
      }
    }

    return !!(
      data.data?.basic_settings ||
      data.data?.geography ||
      data.tool === "analyze_worldview" ||
      data.data?.tool === "analyze_worldview"
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!article.trim() || isLoading) return;

    setIsLoading(true);
    setShowStream(true);
    setResult(null);
    setStreamContent("正在分析世界观...");

    const taskId = addTask({
      title: "世界观分析",
      message: "正在从文章中提取设定...",
    });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `请从以下文章中分析和提取世界观：\n\n${article}`,
          auto_save: true,
        }),
      });

      const data = await response.json();
      console.log("API返回的完整数据:", data);
      if (data.success) {
        setStreamContent("分析完成！");
        setResult(data);
        updateTask(taskId, { status: "completed", message: "分析完成" });
      } else {
        const errorMsg = data.error || "未知错误";
        setStreamContent("分析失败：" + errorMsg);
        updateTask(taskId, {
          status: "error",
          message: "分析失败：" + errorMsg,
        });
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      setStreamContent("分析失败：" + errorMessage);
      updateTask(taskId, {
        status: "error",
        message: "分析出错：" + errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    article,
    setArticle,
    isLoading,
    result,
    streamContent,
    showStream,
    navigate,
    handleSubmit,
    checkWorldviewData,
  };
}
