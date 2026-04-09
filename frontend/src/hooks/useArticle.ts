import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "../contexts/TaskContext";

export function useArticle() {
  const navigate = useNavigate();
  const [eventDescription, setEventDescription] = useState("");
  const [context, setContext] = useState("");
  const [style, setStyle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [streamContent, setStreamContent] = useState("");
  const [showStream, setShowStream] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const { addTask, updateTask } = useTasks();

  const [savedStories, setSavedStories] = useState<any[]>([]);
  const [selectedStoryId, setSelectedStoryId] = useState<string>("");
  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    // Load saved stories when component mounts
    const loadSavedStories = async () => {
      try {
        const response = await fetch("/api/cache/all");
        const data = await response.json();
        if (data.success && data.data && data.data.story) {
          setSavedStories(data.data.story);
        }
      } catch (error) {
        console.error("Failed to load saved stories:", error);
      }
    };

    loadSavedStories();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleSelectEvent = (story: any, event: any, index: number) => {
    let title = event.event_title || event.title || "";
    let desc = event.description || "";
    let loc = event.location ? `\n地点：${event.location}` : "";
    let chars = event.key_characters
      ? `\n关键人物：${event.key_characters.join("、")}`
      : "";
    let sig = event.significance ? `\n事件意义：${event.significance}` : "";

    setEventDescription(`【${title}】\n${desc}${loc}${chars}${sig}`);
    setSelectedEventIndex(index);

    // Set context based on the whole story
    const storyData = story.data?.data || story.data || {};
    let storyTitle = storyData.title || story.name || "故事";
    let storyTheme = storyData.core_theme
      ? `\n核心主题：${storyData.core_theme}`
      : "";
    let storySummary = storyData.story_summary
      ? `\n故事摘要：${storyData.story_summary}`
      : "";

    setContext(`所在故事：${storyTitle}${storyTheme}${storySummary}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventDescription.trim()) return;

    setIsLoading(true);
    setResult(null);
    setStreamContent("正在生成文章...");
    setShowStream(true);

    const taskId = addTask({
      title: "生成文章",
      message: `正在基于事件生成文章...`,
    });

    try {
      const actualStyle = style.trim() ? style : "叙事";
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `根据事件生成文章。事件描述：${eventDescription}。上下文：${context}。风格：${actualStyle}`,
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
          console.warn("Article parse response fallback:", e);
          if (data.cache_id) finalResult.cache_id = data.cache_id;
        }

        setResult(finalResult);
        updateTask(taskId, { status: "completed", message: "文章生成完成" });
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

  const checkArticleData = (data: any): boolean => {
    if (!data) return false;
    if (data.success && data.response) {
      try {
        const parsedResponse = JSON.parse(data.response);
        return parsedResponse.tool === "generate_article_from_event";
      } catch (e) {
        return false;
      }
    }
    if (data.data) {
      return data.data.tool === "generate_article_from_event";
    }
    return data.tool === "generate_article_from_event";
  };

  return {
    eventDescription,
    setEventDescription,
    context,
    setContext,
    style,
    setStyle,
    isLoading,
    result,
    setResult,
    streamContent,
    showStream,
    navigate,
    handleSubmit,
    checkArticleData,
    savedStories,
    selectedStoryId,
    setSelectedStoryId,
    selectedEventIndex,
    handleSelectEvent,
  };
}
