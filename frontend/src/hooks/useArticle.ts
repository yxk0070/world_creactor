import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
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

    if (location.state && location.state.storylineContext) {
      try {
        const storyCtx = JSON.parse(location.state.storylineContext);
        if (storyCtx && storyCtx.key_events) {
          // 这里可以进行自动填充，比如自动选中第一个事件
          setEventDescription(
            storyCtx.key_events[0]?.description ||
              storyCtx.key_events[0]?.title ||
              ""
          );
          setContext(
            `所在故事：${storyCtx.title || ""}\n核心主题：${storyCtx.core_theme || ""}`
          );
        }
      } catch (e) {}
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [location.state]);

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

  const generateFullArticle = async () => {
    if (!selectedStoryId || isLoading) return;

    const story = savedStories.find((s) => s.id === selectedStoryId);
    const events = story?.data?.key_events || story?.data?.data?.key_events;
    if (!events || events.length === 0) return;

    setIsLoading(true);
    setResult(null);
    setShowStream(true);
    setStreamContent("正在初始化全文连载生成...");

    const title =
      story.data?.title ||
      story.data?.data?.title ||
      story.name ||
      "未命名故事";
    const taskId = addTask({
      title: `生成全文：${title}`,
      message: "准备生成各章节...",
    });

    const actualStyle = style.trim() ? style : "叙事";
    let combinedResults: any[] = [];

    // 从故事线中提取出通用的 Context
    const storyTheme =
      story.data?.core_theme || story.data?.data?.core_theme || "";
    const storySummary =
      story.data?.story_summary || story.data?.data?.story_summary || "";
    const baseContext = `所在故事：${title}\n核心主题：${storyTheme}\n故事摘要：${storySummary}`;

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const chapterTitle = event.event_title || event.title || `第 ${i + 1} 章`;
      setStreamContent(
        `正在生成 ${chapterTitle} (${i + 1}/${events.length})...`
      );
      updateTask(taskId, {
        message: `正在生成 ${chapterTitle} (${i + 1}/${events.length})...`,
      });

      let eventDesc = `【${chapterTitle}】\n${event.description || ""}`;
      if (event.location) eventDesc += `\n地点：${event.location}`;
      if (event.key_characters)
        eventDesc += `\n关键人物：${event.key_characters.join("、")}`;
      if (event.significance) eventDesc += `\n事件意义：${event.significance}`;

      const prompt = `请根据以下事件节点生成文章章节：\n\n事件描述：${eventDesc}\n上下文：${baseContext}\n文章风格：${actualStyle}\n\n请使用 generate_article_from_event 工具`;

      try {
        const response = await fetch("/api/chat/workflow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: prompt, auto_save: false }), // 最后统一保存
        });

        if (!response.body) throw new Error("No response body");
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let finalData = null;
        let buffer = "";

        let currentChapterContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "end") {
                  finalData = data.content;
                } else if (data.type === "chunk") {
                  currentChapterContent += data.content;
                  // 实时预览当前正在生成的章节
                  setResult({
                    tool: "generate_article_from_event",
                    is_full_article: true,
                    title: title,
                    chapters: [
                      ...combinedResults,
                      {
                        chapter_title: chapterTitle,
                        content: currentChapterContent,
                        event_description: eventDesc
                      }
                    ]
                  });
                } else if (data.type === "error") {
                  console.error(data.message);
                }
              } catch (e) {}
            }
          }
        }

        if (finalData && finalData.success) {
          let parsed = finalData.response;
          try {
            parsed = typeof parsed === "string" ? JSON.parse(parsed) : parsed;
            if (Array.isArray(parsed) && parsed.length > 0) parsed = parsed[0];
            if (parsed.data) parsed = parsed.data;
          } catch (e) {}

          combinedResults.push({
            chapter_title: chapterTitle,
            content: parsed.content || parsed,
            event_description: eventDesc,
          });

          // 增量更新渲染，让用户看到进度
          setResult({
            tool: "generate_article_from_event",
            is_full_article: true,
            title: title,
            chapters: combinedResults,
          });
        }
      } catch (error) {
        console.error(`生成第 ${i + 1} 章失败:`, error);
      }
    }

    setStreamContent("全文生成完成！");
    updateTask(taskId, { status: "completed", message: "全文生成完成" });
    setIsLoading(false);

    // 最终将合并结果保存到 cache
    try {
      const saveRes = await fetch("/api/cache/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "generate_article_from_event",
          data: {
            tool: "generate_article_from_event",
            is_full_article: true,
            title: title,
            chapters: combinedResults,
          },
        }),
      });
      const saveData = await saveRes.json();
      if (saveData.success) {
        setResult((prev: any) => ({ ...prev, cache_id: saveData.id }));
      }
    } catch (e) {}
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
    generateFullArticle,
  };
}
