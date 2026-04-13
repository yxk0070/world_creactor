import React from "react";
import { useArticle } from "../hooks/useArticle";
import { EditableResult } from "../components/EditableResult";
import { ArticleRenderer } from "../components/ArticleRenderer";
import { styles } from "./ArticlePage.styles";

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
    generateFullArticle,
  } = useArticle();

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
                  background: "var(--bg-glass)",
                  borderRadius: "12px",
                  padding: "16px",
                  border: "1px solid var(--border-dark-80)",
                  maxHeight: "300px",
                  overflowY: "auto",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <h4
                    style={{
                      color: "var(--text-tertiary)",
                      margin: 0,
                      fontSize: "14px",
                    }}
                  >
                    点击事件以快速填充：
                  </h4>
                  <button
                    type="button"
                    onClick={generateFullArticle}
                    disabled={isLoading}
                    style={{
                      padding: "6px 12px",
                      background: "var(--accent-primary)",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      fontSize: "12px",
                      fontWeight: "600",
                      opacity: isLoading ? 0.7 : 1,
                    }}
                  >
                    {isLoading ? "生成中..." : "🚀 生成全文 (连载)"}
                  </button>
                </div>
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
                        <div
                          style={{
                            color: "var(--text-muted)",
                            padding: "12px",
                          }}
                        >
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
                              ? "var(--accent-bg)"
                              : "var(--bg-card-80)",
                            padding: "12px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            border: isSelected
                              ? "1px solid rgba(99, 102, 241, 0.8)"
                              : "1px solid var(--border-dark)",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background =
                                "var(--border-dark)";
                              e.currentTarget.style.borderColor =
                                "var(--accent-primary)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.background =
                                "var(--bg-card-80)";
                              e.currentTarget.style.borderColor =
                                "var(--border-dark)";
                            }
                          }}
                        >
                          <div
                            style={{
                              color: isSelected
                                ? "#a5b4fc"
                                : "var(--text-primary)",
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
                              color: isSelected
                                ? "#c7d2fe"
                                : "var(--text-muted)",
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
                <option value="二次元">
                  二次元（轻小说风格，心理描写丰富，颜文字/内心吐槽）
                </option>
                <option value="古典小说">
                  古典小说（半文半白，章回体风格，用词古风）
                </option>
                <option value="书面报告">
                  书面报告（公文体，客观、严谨、条理清晰）
                </option>
                <option value="翻译腔">
                  翻译腔（类似译制片，句子冗长，定语后置，"哦，我的老天"）
                </option>
                <option value="评书">
                  评书（说书人口吻，"且听下回分解"，节奏明快）
                </option>
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
              deriveOptions={[
                {
                  label: "基于此生成短剧脚本",
                  to: "/short-script",
                  stateKey: "articleContext",
                },
                {
                  label: "基于此生成对话文案",
                  to: "/dialogue",
                  stateKey: "articleContext",
                },
              ]}
            >
              <div style={styles.resultContent}>
                {checkArticleData(result) ? (
                  <ArticleRenderer data={result} />
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
