import React from "react";
import { useArticle } from "../hooks/useArticle";
import { EditableResult } from "../components/EditableResult";

export function ArticlePage() {
  const {
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
  } = useArticle();

  const renderArticle = (data: any) => {
    let articleData = data;

    if (data.success && data.response) {
      try {
        const parsedResponse = JSON.parse(data.response);
        articleData = parsedResponse;
      } catch (e) {
        console.log("解析response失败:", e);
        articleData = data.response;
      }
    }

    if (articleData.data) {
      articleData = articleData.data;
      if (articleData.data) {
        articleData = articleData.data;
      }
    }

    if (!articleData.content) {
      return (
        <div style={styles.fallback}>
          <p style={styles.fallbackText}>以下是生成的完整内容：</p>
          <pre style={styles.rawResult}>
            {JSON.stringify(articleData, null, 2)}
          </pre>
        </div>
      );
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            background: "rgba(15, 23, 42, 0.6)",
            borderRadius: "12px",
            padding: "24px",
            border: "1px solid rgba(51, 65, 85, 0.8)",
          }}
        >
          <h2
            style={{
              color: "#f8fafc",
              fontSize: "24px",
              fontWeight: "700",
              margin: "0 0 16px 0",
              textAlign: "center",
            }}
          >
            {articleData.title || "无标题文章"}
          </h2>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "24px",
              justifyContent: "center",
            }}
          >
            {articleData.characters_involved &&
              articleData.characters_involved.map(
                (char: string, index: number) => (
                  <span
                    key={index}
                    style={{
                      background: "rgba(99, 102, 241, 0.2)",
                      color: "#a5b4fc",
                      padding: "4px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                  >
                    👤 {char}
                  </span>
                )
              )}
            {articleData.word_count && (
              <span
                style={{
                  background: "rgba(16, 185, 129, 0.2)",
                  color: "#6ee7b7",
                  padding: "4px 12px",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              >
                📝 约 {articleData.word_count}
              </span>
            )}
          </div>

          <div
            style={{
              color: "#e2e8f0",
              fontSize: "16px",
              lineHeight: "1.8",
              whiteSpace: "pre-wrap",
            }}
          >
            {articleData.content}
          </div>
        </div>

        {articleData.event_description && (
          <div
            style={{
              background: "rgba(30, 41, 59, 0.6)",
              borderRadius: "12px",
              padding: "16px",
              borderLeft: "4px solid #6366f1",
            }}
          >
            <h4
              style={{
                color: "#94a3b8",
                fontSize: "12px",
                margin: "0 0 8px 0",
                textTransform: "uppercase",
              }}
            >
              原始事件描述
            </h4>
            <p style={{ color: "#cbd5e1", margin: 0, fontSize: "14px" }}>
              {articleData.event_description}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate("/")} style={styles.backButton}>
          ← 返回
        </button>
        <h1 style={styles.title}>事件生成文章</h1>
      </div>

      <div style={styles.content}>
        <div style={styles.inputSection}>
          <label style={styles.label}>
            从历史故事线中选择事件（可选）
            <select
              value={selectedStoryId}
              onChange={(e) => setSelectedStoryId(e.target.value)}
              style={styles.select}
            >
              <option value="">-- 选择一个故事 --</option>
              {savedStories.map((story) => (
                <option key={story.id} value={story.id}>
                  {story.name} ({new Date(story.created_at).toLocaleString()})
                </option>
              ))}
            </select>
          </label>

          {selectedStoryId && (
            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  borderRadius: "12px",
                  padding: "16px",
                  border: "1px solid rgba(51, 65, 85, 0.8)",
                  maxHeight: "300px",
                  overflowY: "auto",
                }}
              >
                <h4
                  style={{
                    color: "#cbd5e1",
                    margin: "0 0 12px 0",
                    fontSize: "14px",
                  }}
                >
                  点击事件以快速填充：
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  {(() => {
                    const story = savedStories.find(
                      (s) => s.id === selectedStoryId
                    );
                    if (!story || !story.data) return null;

                    // Handle different possible structures for events
                    let events = [];
                    if (story.data.key_events) {
                      events = story.data.key_events;
                    } else if (story.data.data && story.data.data.key_events) {
                      events = story.data.data.key_events;
                    } else if (story.data.data && story.data.data.events) {
                      events = story.data.data.events;
                    } else if (story.data.events) {
                      events = story.data.events;
                    }

                    if (!events || events.length === 0) {
                      return (
                        <div style={{ color: "#94a3b8", padding: "12px" }}>
                          该故事线没有可用的事件
                        </div>
                      );
                    }

                    return events.map((event: any, idx: number) => {
                      const isSelected = selectedEventIndex === idx;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelectEvent(story, event, idx)}
                          style={{
                            background: isSelected
                              ? "rgba(99, 102, 241, 0.2)"
                              : "rgba(30, 41, 59, 0.8)",
                            padding: "12px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            border: isSelected
                              ? "1px solid rgba(99, 102, 241, 0.8)"
                              : "1px solid rgba(71, 85, 105, 0.5)",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background =
                                "rgba(71, 85, 105, 0.5)";
                              e.currentTarget.style.borderColor = "#6366f1";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background =
                                "rgba(30, 41, 59, 0.8)";
                              e.currentTarget.style.borderColor =
                                "rgba(71, 85, 105, 0.5)";
                            }
                          }}
                        >
                          <div
                            style={{
                              color: isSelected ? "#a5b4fc" : "#f8fafc",
                              fontWeight: "600",
                              marginBottom: "4px",
                              fontSize: "14px",
                            }}
                          >
                            {event.event_order}.{" "}
                            {event.event_title || event.title}
                          </div>
                          <div
                            style={{
                              color: isSelected ? "#c7d2fe" : "#94a3b8",
                              fontSize: "12px",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {event.description}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputSection}>
            <label style={styles.label}>
              事件描述
              <textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="请粘贴或输入时间线中的事件节点描述..."
                style={{ ...styles.textarea, minHeight: "120px" }}
                required
              />
            </label>

            <label style={styles.label}>
              上下文信息 (可选)
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="可以输入相关的世界观设定、人物背景、前因后果等..."
                style={{ ...styles.textarea, minHeight: "80px" }}
              />
            </label>

            <label style={styles.label}>
              文章风格
              <input
                type="text"
                list="style-options"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="选择或输入文章风格..."
                style={styles.input}
              />
              <datalist id="style-options">
                <option value="叙事">叙事（平铺直叙，注重动作与事件）</option>
                <option value="抒情">抒情（注重人物心理与情感描写）</option>
                <option value="写实">写实（细节丰富，贴近现实）</option>
                <option value="剧本">剧本（以对话和舞台指示为主）</option>
                <option value="史诗">史诗（宏大叙事，带有历史厚重感）</option>
                <option value="武侠">武侠（江湖风气，动作描写细腻）</option>
                <option value="悬疑">悬疑（扣人心弦，气氛压抑）</option>
              </datalist>
            </label>

            <button type="submit" disabled={isLoading} style={styles.button}>
              {isLoading ? "生成中..." : "生成文章"}
            </button>
          </div>
        </form>

        {showStream && (
          <div style={styles.streamingSection}>
            <h3 style={styles.sectionTitle}>生成状态</h3>
            <div style={styles.streamingContent}>
              <div style={styles.streamingText}>
                <span style={styles.typingIndicator}>●</span>
                {streamContent}
              </div>
            </div>
          </div>
        )}

        {result && (
          <div style={styles.resultSection}>
            <h3 style={styles.sectionTitle}>生成结果</h3>
            <EditableResult
              data={result}
              cacheId={(result as any).cache_id}
              onSave={(newData) => setResult(newData)}
              defaultTitle="事件文章"
            >
              <div style={styles.resultContent}>
                {checkArticleData(result) ? (
                  renderArticle(result)
                ) : (
                  <div style={styles.fallback}>
                    <p style={styles.fallbackText}>以下是生成的完整内容：</p>
                    <pre style={styles.rawResult}>
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </EditableResult>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    padding: "24px",
  },
  header: {
    maxWidth: "900px",
    margin: "0 auto 24px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  backButton: {
    padding: "8px 16px",
    background: "rgba(99, 102, 241, 0.2)",
    color: "#a5b4fc",
    border: "1px solid rgba(99, 102, 241, 0.3)",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#f8fafc",
    margin: 0,
  },
  content: {
    maxWidth: "900px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column" as const,
    gap: "24px",
  },
  form: {
    width: "100%",
  },
  inputSection: {
    background: "rgba(30, 41, 59, 0.85)",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid rgba(71, 85, 105, 0.5)",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#cbd5e1",
    marginBottom: "8px",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(51, 65, 85, 0.8)",
    borderRadius: "12px",
    color: "#e2e8f0",
    fontSize: "14px",
    lineHeight: "1.6",
    resize: "vertical" as const,
    marginBottom: "16px",
    boxSizing: "border-box" as const,
  },
  input: {
    width: "100%",
    padding: "12px",
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(51, 65, 85, 0.8)",
    borderRadius: "12px",
    color: "#e2e8f0",
    fontSize: "14px",
    marginBottom: "16px",
    boxSizing: "border-box" as const,
  },
  select: {
    width: "100%",
    padding: "12px",
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(51, 65, 85, 0.8)",
    borderRadius: "12px",
    color: "#e2e8f0",
    fontSize: "14px",
    marginBottom: "16px",
    cursor: "pointer",
    boxSizing: "border-box" as const,
  },
  button: {
    width: "100%",
    padding: "14px 24px",
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  streamingSection: {
    background: "rgba(30, 41, 59, 0.85)",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid rgba(71, 85, 105, 0.5)",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#e2e8f0",
    margin: "0 0 16px",
  },
  streamingContent: {
    background: "rgba(15, 23, 42, 0.6)",
    borderRadius: "12px",
    padding: "20px",
  },
  streamingText: {
    color: "#a78bfa",
    fontSize: "14px",
    lineHeight: "1.8",
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-word" as const,
  },
  typingIndicator: {
    display: "inline-block",
    marginRight: "8px",
    animation: "pulse 1s infinite",
  },
  resultSection: {
    background: "rgba(30, 41, 59, 0.85)",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid rgba(71, 85, 105, 0.5)",
  },
  resultContent: {
    maxHeight: "600px",
    overflowY: "auto" as const,
    paddingRight: "8px",
  },
  fallback: {
    padding: "16px",
  },
  fallbackText: {
    color: "#94a3b8",
    fontSize: "14px",
    marginBottom: "16px",
  },
  rawResult: {
    background: "rgba(15, 23, 42, 0.8)",
    padding: "16px",
    borderRadius: "8px",
    color: "#cbd5e1",
    fontSize: "12px",
    lineHeight: "1.6",
    overflowX: "auto" as const,
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-word" as const,
  },
};
