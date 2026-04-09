import React from "react";
import { useWorldviewAnalysis } from "../hooks/useWorldviewAnalysis";
import { WorldviewRenderer } from "../components/WorldviewRenderer";
import { styles } from "./WorldviewAnalysisPage.styles";

export function WorldviewAnalysisPage() {
  const {
    article,
    setArticle,
    isLoading,
    result,
    streamContent,
    showStream,
    navigate,
    handleSubmit,
    checkWorldviewData,
  } = useWorldviewAnalysis();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate("/")} style={styles.backButton}>
          ← 返回
        </button>
        <h1 style={styles.title}>世界观分析</h1>
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
              {checkWorldviewData(result) ? (
                <WorldviewRenderer data={result} />
              ) : result &&
                typeof result.response === "string" &&
                result.response.includes("JSONDecodeError") ? (
                <WorldviewRenderer
                  data={{
                    data: {
                      world_name: "分析过程出错",
                      history:
                        "抱歉，由于模型生成的内容格式不完整（内容被截断），导致无法正常解析。请尝试减少输入文章的长度或重新分析。",
                      basic_settings: {
                        genre: "未知",
                        magic_level: "未知",
                        technology_level: "未知",
                        core_theme: "未知",
                      },
                      geography: "无数据",
                      social_structure: "无数据",
                      factions: [],
                    },
                  }}
                />
              ) : (
                <div style={styles.fallback}>
                  <p style={styles.fallbackText}>以下是分析结果的完整内容：</p>
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
