import React from "react";
import { useTimelineAnalysis } from "../hooks/useTimelineAnalysis";
import { StorylineRenderer } from "../components/StorylineRenderer";
import { styles } from "./TimelineAnalysisPage.styles";

export function TimelineAnalysisPage() {
  const {
    article,
    setArticle,
    isLoading,
    result,
    streamContent,
    showStream,
    navigate,
    handleSubmit,
    checkTimelineData,
  } = useTimelineAnalysis();

  const renderTimeline = (data: any) => {
    let timelineData = data;

    if (data.success && data.response) {
      try {
        const parsedResponse = JSON.parse(data.response);
        timelineData = parsedResponse;
      } catch (e) {
        console.log("解析response失败:", e);
        timelineData = data.response;
      }
    }

    if (timelineData.data) {
      timelineData = timelineData.data;
      if (timelineData.data) {
        timelineData = timelineData.data;
      }
    }

    const events = timelineData.events || timelineData.key_events || [];

    if (!events || events.length === 0) {
      return (
        <div style={{ padding: "16px" }}>
          <p
            style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "16px" }}
          >
            以下是分析结果的完整内容：
          </p>
          <pre
            style={{
              background: "var(--bg-glass-80)",
              padding: "16px",
              borderRadius: "8px",
              color: "var(--text-tertiary)",
              fontSize: "12px",
              lineHeight: "1.6",
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
    }

    // 复用故事线渲染器
    return (
      <StorylineRenderer
        data={{
          title: timelineData.title || "故事线分析",
          core_theme: timelineData.core_theme || "时间线提取",
          story_scale: timelineData.story_scale,
          genre: timelineData.genre,
          key_events: events,
          id: data.cache_id || timelineData.id || timelineData.cache_id,
        }}
      />
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate("/")} style={styles.backButton}>
          ← 返回
        </button>
        <h1 style={styles.title}>故事线分析</h1>
      </div>

      <div style={styles.content}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputSection}>
            <label style={styles.label}>
              粘贴文章内容
              <textarea
                value={article}
                onChange={(e) => setArticle(e.target.value)}
                placeholder="请粘贴您想要分析的文章内容..."
                style={styles.textarea}
                maxLength={4000}
              />
            </label>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  color: article.length > 3800 ? "#ef4444" : "var(--text-muted)",
                }}
              >
                {article.length} / 4000 字
              </span>
              {article.length > 3000 && (
                <span style={{ fontSize: "12px", color: "#fbbf24" }}>
                  ⚠️ 文章较长，可能会导致分析结果被截断
                </span>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading || article.length === 0}
              style={styles.button}
            >
              {isLoading ? "分析中..." : "开始分析"}
            </button>
          </div>
        </form>

        {showStream && (
          <div style={styles.streamingSection}>
            <h3 style={styles.sectionTitle}>分析状态</h3>
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
            <h3 style={styles.sectionTitle}>分析结果</h3>
            <div style={styles.resultContent}>
              {checkTimelineData(result) ? (
                renderTimeline(result)
              ) : result &&
                typeof result.response === "string" &&
                result.response.includes("JSONDecodeError") ? (
                <div>
                  <h4 style={{ color: "#ef4444", margin: "0 0 8px 0" }}>
                    分析过程出错
                  </h4>
                  <p
                    style={{
                      color: "#fca5a5",
                      fontSize: "14px",
                      marginBottom: "16px",
                    }}
                  >
                    抱歉，由于模型生成的内容格式不完整（内容被截断），导致无法正常解析。请尝试减少输入文章的长度或重新分析。
                  </p>
                </div>
              ) : (
                <div style={{ padding: "16px" }}>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "14px",
                      marginBottom: "16px",
                    }}
                  >
                    以下是分析结果的完整内容：
                  </p>
                  <pre
                    style={{
                      background: "var(--bg-glass-80)",
                      padding: "16px",
                      borderRadius: "8px",
                      color: "var(--text-tertiary)",
                      fontSize: "12px",
                      lineHeight: "1.6",
                      overflowX: "auto",
                    }}
                  >
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
