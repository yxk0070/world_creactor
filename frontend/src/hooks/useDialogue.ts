import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useTasks } from "../contexts/TaskContext";

interface Storyline {
  id: string;
  title: string;
  data: any;
}

export function useDialogue() {
  const [eventDescription, setEventDescription] = useState("");
  const [characters, setCharacters] = useState("");
  const [context, setContext] = useState("");
  const [style, setStyle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [streamContent, setStreamContent] = useState("");
  const [showStream, setShowStream] = useState(false);
  const location = useLocation();
  const { addTask, updateTask } = useTasks();

  // 故事线选择相关状态
  const [storylines, setStorylines] = useState<Storyline[]>([]);
  const [selectedStorylineId, setSelectedStorylineId] = useState("");
  const [availableEvents, setAvailableEvents] = useState<any[]>([]);

  // 加载故事线
  useEffect(() => {
    const fetchStorylines = async () => {
      try {
        const response = await fetch("/api/cache/category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category: "story" }),
        });
        const data = await response.json();
        if (data.success && data.data) {
          const stories = data.data.map((item: any) => ({
            id: item.id,
            title: item.data?.title || item.data?.data?.title || "未命名故事线",
            data: item.data?.data || item.data,
          }));
          setStorylines(stories);
        }
      } catch (error) {
        console.error("获取故事线失败:", error);
      }
    };
    fetchStorylines();

    if (location.state && location.state.articleContext) {
      try {
        const articleCtx = JSON.parse(location.state.articleContext);
        if (articleCtx && (articleCtx.content || articleCtx.script)) {
          setEventDescription(articleCtx.content || articleCtx.script || "");
          setContext(
            articleCtx.title ||
              articleCtx.event_description ||
              "从文章/短剧派生"
          );
        }
      } catch (e) {}
    }
  }, [location.state]);

  // 当选择的故事线改变时，提取其所有主事件和细节事件
  useEffect(() => {
    if (!selectedStorylineId) {
      setAvailableEvents([]);
      return;
    }

    const story = storylines.find((s) => s.id === selectedStorylineId);
    if (!story || !story.data?.key_events) {
      setAvailableEvents([]);
      return;
    }

    const events: any[] = [];
    story.data.key_events.forEach((mainEvent: any) => {
      // 仅插入细节子事件
      if (mainEvent.sub_events && Array.isArray(mainEvent.sub_events)) {
        mainEvent.sub_events.forEach((subEvent: any) => {
          events.push({
            type: "sub",
            label: `【${mainEvent.event_title}】细节：${subEvent.title}`,
            value: subEvent.description,
            characters: mainEvent.key_characters?.join("，") || "",
            context: `主事件背景：${mainEvent.description}`,
          });
        });
      }
    });

    setAvailableEvents(events);
  }, [selectedStorylineId, storylines]);

  const handleEventSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (!selectedValue) return;

    const event = availableEvents.find((ev) => ev.value === selectedValue);
    if (event) {
      setEventDescription(event.value);
      if (event.characters) setCharacters(event.characters);
      if (event.context) setContext(event.context);
    }
  };

  const generateDialogue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventDescription.trim() || isLoading) return;

    setIsLoading(true);
    setResult(null);
    setShowStream(true);
    setStreamContent("正在启动生成流...");

    const taskId = addTask({
      title: "生成对话文案",
      message: "正在启动生成流...",
    });

    const actualStyle = style.trim() ? style : "日常交谈";
    const prompt = `请根据以下事件节点生成一段对话文案：\n\n事件描述：${eventDescription}\n参与人物：${characters}\n上下文：${context}\n对话风格：${actualStyle}\n\n请使用 generate_dialogue 工具`;

    try {
      const response = await fetch("/api/chat/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, auto_save: true }),
      });

      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let finalData = null;
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");

        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim().startsWith("data: ")) {
            try {
              const data = JSON.parse(line.trim().substring(6));
              if (data.type === "status" || data.type === "step_start") {
                setStreamContent(data.message);
                updateTask(taskId, { message: data.message });
              } else if (data.type === "end") {
                finalData = data.content;
              } else if (data.type === "error") {
                throw new Error(data.message);
              }
            } catch (e) {
              console.warn("Parse error for line:", line, e);
            }
          }
        }
      }

      if (finalData && finalData.success) {
        setStreamContent("生成完成！");
        try {
          const parsedData = JSON.parse(finalData.response);
          // 注意：parsedData 可能是一个数组，并且每个元素的结构是 {"tool": "xxx", "status": "xxx", "data": {...}}
          // 或者直接是一个对象
          let finalResult = parsedData;
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            finalResult = parsedData[0];
          }

          // 保持完整结构，只注入 cache_id
          if (finalData.cache_id) {
            finalResult.cache_id = finalData.cache_id;
          } else if (finalData.cache_ids && finalData.cache_ids.length > 0) {
            finalResult.cache_id = finalData.cache_ids[0];
          }

          setResult(finalResult);
        } catch (e) {
          let finalFallback = finalData.data || finalData;
          if (finalData.cache_id) {
            finalFallback.cache_id = finalData.cache_id;
          } else if (finalData.cache_ids && finalData.cache_ids.length > 0) {
            finalFallback.cache_id = finalData.cache_ids[0];
          }
          setResult(finalFallback);
        }
        updateTask(taskId, { status: "completed", message: "生成完成" });
      } else {
        const errorMsg = finalData?.error || "未知错误";
        setStreamContent("生成失败：" + errorMsg);
        updateTask(taskId, { status: "error", message: errorMsg });
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      setStreamContent("生成失败：" + errorMessage);
      updateTask(taskId, { status: "error", message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    eventDescription,
    setEventDescription,
    characters,
    setCharacters,
    context,
    setContext,
    style,
    setStyle,
    isLoading,
    result,
    setResult,
    generateDialogue,
    storylines,
    selectedStorylineId,
    setSelectedStorylineId,
    availableEvents,
    handleEventSelect,
    streamContent,
    showStream,
  };
}
