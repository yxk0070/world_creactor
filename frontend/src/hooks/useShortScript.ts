import { useState, useEffect } from "react";
import { useTasks } from "../contexts/TaskContext";

interface Storyline {
  id: string;
  title: string;
  data: any;
}

export function useShortScript() {
  const [eventDescription, setEventDescription] = useState("");
  const [context, setContext] = useState("");
  const [style, setStyle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [streamContent, setStreamContent] = useState<string>("");
  const [showStream, setShowStream] = useState(false);
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
  }, []);

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
      if (event.context) setContext(event.context);
    }
  };

  const generateScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventDescription.trim() || isLoading) return;

    setIsLoading(true);
    setResult(null);
    setShowStream(true);
    setStreamContent("正在启动生成流...");

    const taskId = addTask({
      title: "生成短句/分镜脚本",
      message: "正在启动生成流...",
    });

    const actualStyle = style.trim() ? style : "快节奏分镜";
    const prompt = `请根据以下事件节点生成一个短句脚本/分镜脚本：\n\n事件描述：${eventDescription}\n上下文：${context}\n脚本风格：${actualStyle}\n\n请使用 generate_short_script 工具`;

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
          let finalResult = parsedData;
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            finalResult = parsedData[0];
          }

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
    context,
    setContext,
    style,
    setStyle,
    isLoading,
    result,
    setResult,
    generateScript,
    storylines,
    selectedStorylineId,
    setSelectedStorylineId,
    availableEvents,
    handleEventSelect,
    streamContent,
    showStream,
  };
}
