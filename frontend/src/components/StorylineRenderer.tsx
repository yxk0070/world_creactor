import { useState, useEffect } from "react";
import { useTasks } from "../contexts/TaskContext";

interface StorylineRendererProps {
  data: any;
}

export function StorylineRenderer({ data }: StorylineRendererProps) {
  const [localData, setLocalData] = useState<any>(null);
  const [loadingEventIndex, setLoadingEventIndex] = useState<number | null>(
    null
  );
  const { addTask, updateTask } = useTasks();

  useEffect(() => {
    if (data) {
      let storylineData = data;
      // 循环解包，直到找到真正包含 key_events 或 title 的数据层
      while (
        storylineData &&
        storylineData.data &&
        !storylineData.key_events &&
        !storylineData.title
      ) {
        storylineData = storylineData.data;
      }
      setLocalData(storylineData);
    }
  }, [data]);

  const handleGenerateDetails = async (index: number, event: any) => {
    if (loadingEventIndex !== null) return;
    setLoadingEventIndex(index);

    const eventTitle = event.event_title || event.title || `事件 ${index + 1}`;
    const taskId = addTask({
      title: `生成细节：${eventTitle}`,
      message: "正在展开细节节点...",
    });

    try {
      const prompt = `请对故事中的事件进行展开，生成5-8个细节子节点。故事上下文：${localData.story_summary || localData.core_theme || "无"}。事件标题：${eventTitle}\n事件描述：${event.description}\n\n请必须使用 expand_story_event 工具并返回其 JSON 格式结果。`;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, auto_save: false }),
      });

      const resData = await response.json();
      if (resData.success) {
        let parsed = null;
        try {
          parsed = JSON.parse(resData.response);
          if (parsed.data) parsed = parsed.data;
        } catch (e) {
          console.error("Failed to parse detail response", resData.response);
        }

        if (parsed && parsed.sub_events) {
          setLocalData((prev: any) => {
            const newData = { ...prev };
            newData.key_events[index] = {
              ...newData.key_events[index],
              sub_events: parsed.sub_events,
            };

            // 如果存在 cache_id，自动触发一次后端保存
            if (data.id || data.cacheId || data.cache_id || data.cache?.id) {
              const targetId =
                data.id || data.cacheId || data.cache_id || data.cache?.id;

              // 保证发回后端的数据结构与原始保持一致，避免被包裹多层 data
              let payloadData = { ...data };
              if (payloadData.data && payloadData.data.data) {
                payloadData.data.data = newData;
              } else if (payloadData.data) {
                payloadData.data = newData;
              } else {
                payloadData = newData;
              }

              fetch("/api/cache/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id: targetId,
                  data: payloadData,
                }),
              }).catch((e) =>
                console.error("Failed to sync sub_events to cache:", e)
              );
            }

            return newData;
          });

          updateTask(taskId, {
            status: "completed",
            message: "细节生成完成！",
          });
        } else {
          updateTask(taskId, {
            status: "error",
            message: "返回数据结构不匹配",
          });
        }
      } else {
        updateTask(taskId, {
          status: "error",
          message: resData.error || "请求失败",
        });
      }
    } catch (error) {
      console.error("生成细节失败:", error);
      updateTask(taskId, {
        status: "error",
        message: "网络请求异常",
      });
    } finally {
      setLoadingEventIndex(null);
    }
  };

  if (!localData) return null;

  const { title, story_scale, genre, core_theme, key_events } = localData;

  return (
    <div style={{ maxWidth: "100%" }}>
      {title && (
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
            border: "1px solid rgba(99, 102, 241, 0.3)",
          }}
        >
          <h2
            style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "#a78bfa",
              marginBottom: "12px",
            }}
          >
            📜 {title}
          </h2>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {story_scale && (
              <span
                style={{
                  background: "rgba(16, 185, 129, 0.2)",
                  color: "#10b981",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                {story_scale}
              </span>
            )}
            {genre && (
              <span
                style={{
                  background: "rgba(245, 158, 11, 0.2)",
                  color: "#f59e0b",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                {genre}
              </span>
            )}
          </div>
          {core_theme && (
            <p
              style={{
                marginTop: "12px",
                color: "#cbd5e1",
                fontSize: "14px",
                lineHeight: "1.6",
                fontStyle: "italic",
              }}
            >
              💡 {core_theme}
            </p>
          )}
        </div>
      )}

      {key_events && key_events.length > 0 && (
        <div style={{ position: "relative" }}>
          {key_events.map((event: any, index: number) => {
            const isFirst = index === 0;
            const isLast = index === key_events.length - 1;
            const hasNext = !isLast;

            return (
              <div
                key={event.event_order || index}
                style={{ position: "relative" }}
              >
                {hasNext && (
                  <div
                    style={{
                      position: "absolute",
                      left: "19px",
                      top: "48px",
                      bottom: "-24px",
                      width: "2px",
                      background:
                        "linear-gradient(180deg, #6366f1 0%, rgba(99, 102, 241, 0.3) 100%)",
                    }}
                  />
                )}

                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    marginBottom: "24px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "700",
                      fontSize: "14px",
                      flexShrink: 0,
                      boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)",
                      zIndex: 1,
                    }}
                  >
                    {event.event_order || index + 1}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        background: "rgba(30, 41, 59, 0.8)",
                        borderRadius: "12px",
                        padding: "16px",
                        border: "1px solid rgba(71, 85, 105, 0.5)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "8px",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#e2e8f0",
                            margin: 0,
                          }}
                        >
                          {event.event_title ||
                            `事件 ${event.event_order || index + 1}`}
                        </h3>

                        {(!event.sub_events ||
                          event.sub_events.length === 0) && (
                          <button
                            onClick={() => handleGenerateDetails(index, event)}
                            disabled={loadingEventIndex !== null}
                            style={{
                              padding: "4px 8px",
                              fontSize: "12px",
                              cursor:
                                loadingEventIndex !== null
                                  ? "not-allowed"
                                  : "pointer",
                              background: "rgba(99, 102, 241, 0.2)",
                              color: "#a5b4fc",
                              border: "1px solid rgba(99, 102, 241, 0.3)",
                              borderRadius: "4px",
                              opacity:
                                loadingEventIndex !== null &&
                                loadingEventIndex !== index
                                  ? 0.5
                                  : 1,
                            }}
                          >
                            {loadingEventIndex === index
                              ? "生成中..."
                              : "✨ 生成细节"}
                          </button>
                        )}
                      </div>

                      {event.description && (
                        <p
                          style={{
                            color: "#cbd5e1",
                            fontSize: "14px",
                            lineHeight: "1.7",
                            marginBottom: "12px",
                          }}
                        >
                          {event.description}
                        </p>
                      )}

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                          marginBottom: "8px",
                        }}
                      >
                        {event.location && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              background: "rgba(59, 130, 246, 0.2)",
                              color: "#60a5fa",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "12px",
                            }}
                          >
                            📍 {event.location}
                          </span>
                        )}
                        {event.key_characters &&
                          event.key_characters.map(
                            (char: string, i: number) => (
                              <span
                                key={i}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  background: "rgba(236, 72, 153, 0.2)",
                                  color: "#f472b6",
                                  padding: "4px 10px",
                                  borderRadius: "6px",
                                  fontSize: "12px",
                                }}
                              >
                                👤 {char}
                              </span>
                            )
                          )}
                      </div>

                      {event.significance && (
                        <div
                          style={{
                            background: "rgba(139, 92, 246, 0.15)",
                            borderRadius: "8px",
                            padding: "8px 12px",
                            borderLeft: "3px solid #a78bfa",
                          }}
                        >
                          <span
                            style={{
                              color: "#c4b5fd",
                              fontSize: "12px",
                              fontStyle: "italic",
                            }}
                          >
                            {event.significance}
                          </span>
                        </div>
                      )}

                      {/* 渲染子节点细节 */}
                      {event.sub_events && event.sub_events.length > 0 && (
                        <div
                          style={{
                            marginTop: "16px",
                            paddingLeft: "16px",
                            borderLeft: "2px solid rgba(71, 85, 105, 0.4)",
                          }}
                        >
                          {event.sub_events.map(
                            (sub: any, subIndex: number) => (
                              <div
                                key={subIndex}
                                style={{ marginBottom: "12px" }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    marginBottom: "4px",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "#8b5cf6",
                                      fontSize: "12px",
                                      fontWeight: "bold",
                                    }}
                                  >
                                    ◆
                                  </span>
                                  <span
                                    style={{
                                      color: "#e2e8f0",
                                      fontSize: "14px",
                                      fontWeight: "600",
                                    }}
                                  >
                                    {sub.title}
                                  </span>
                                </div>
                                <div
                                  style={{
                                    color: "#cbd5e1",
                                    fontSize: "13px",
                                    lineHeight: "1.6",
                                    paddingLeft: "16px",
                                  }}
                                >
                                  {sub.description}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
