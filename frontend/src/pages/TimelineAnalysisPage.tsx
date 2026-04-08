import React from "react";
import { useTimelineAnalysis } from "../hooks/useTimelineAnalysis";
import { StorylineRenderer } from "../components/StorylineRenderer";

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
            style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "16px" }}
          >
            以下是分析结果的完整内容：
          </p>
          <pre
            style={{
              background: "rgba(15, 23, 42, 0.8)",
              padding: "16px",
              borderRadius: "8px",
              color: "#cbd5e1",
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
          key_events: events,
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
                  color: article.length > 3800 ? "#ef4444" : "#94a3b8",
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
                      color: "#94a3b8",
                      fontSize: "14px",
                      marginBottom: "16px",
                    }}
                  >
                    以下是分析结果的完整内容：
                  </p>
                  <pre
                    style={{
                      background: "rgba(15, 23, 42, 0.8)",
                      padding: "16px",
                      borderRadius: "8px",
                      color: "#cbd5e1",
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
    minHeight: "300px",
    padding: "12px",
    background: "rgba(15, 23, 42, 0.8)",
    border: "1px solid rgba(51, 65, 85, 0.8)",
    borderRadius: "12px",
    color: "#e2e8f0",
    fontSize: "14px",
    lineHeight: "1.6",
    resize: "vertical" as const,
    marginBottom: "8px",
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
};
