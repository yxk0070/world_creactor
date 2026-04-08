import React from "react";
import { useWorldview } from "../hooks/useWorldview";
import { WorldviewRenderer } from "../components/WorldviewRenderer";
import { EditableResult } from "../components/EditableResult";

export function WorldviewPage() {
  const {
    genre,
    setGenre,
    theme,
    setTheme,
    magicLevel,
    setMagicLevel,
    technologyLevel,
    setTechnologyLevel,
    factionsCount,
    setFactionsCount,
    isLoading,
    result,
    setResult,
    streamContent,
    showStream,
    navigate,
    handleSubmit,
    checkWorldName,
  } = useWorldview();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate("/")} style={styles.backButton}>
          ← 返回
        </button>
        <h1 style={styles.title}>创建世界观</h1>
      </div>

      <div style={styles.content}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputSection}>
            <label style={styles.label}>
              类型
              <input
                type="text"
                list="genre-options"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="选择或输入类型..."
                style={styles.input}
              />
              <datalist id="genre-options">
                <option value="奇幻" />
                <option value="科幻" />
                <option value="仙侠" />
                <option value="武侠" />
                <option value="现代" />
                <option value="末世" />
                <option value="玄幻" />
              </datalist>
            </label>

            <label style={styles.label}>
              核心主题
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="例如：复仇、成长、冒险..."
                style={styles.input}
              />
            </label>

            <div style={styles.inputRow}>
              <label style={styles.label}>
                个体战斗力水平
                <select
                  value={magicLevel}
                  onChange={(e) => setMagicLevel(e.target.value)}
                  style={styles.select}
                >
                  <option value="">选择水平...</option>
                  <option value="无">无</option>
                  <option value="低">低</option>
                  <option value="中等">中等</option>
                  <option value="高">高</option>
                  <option value="极高">极高</option>
                </select>
              </label>

              <label style={styles.label}>
                科技水平
                <select
                  value={technologyLevel}
                  onChange={(e) => setTechnologyLevel(e.target.value)}
                  style={styles.select}
                >
                  <option value="">选择水平...</option>
                  <option value="原始">原始</option>
                  <option value="古代">古代</option>
                  <option value="近代">近代</option>
                  <option value="现代">现代</option>
                  <option value="近未来">近未来</option>
                  <option value="远未来">远未来</option>
                </select>
              </label>
            </div>

            <label style={styles.label}>
              势力数量
              <select
                value={factionsCount}
                onChange={(e) => setFactionsCount(e.target.value)}
                style={styles.select}
              >
                <option value="">选择数量...</option>
                <option value="2-3">2-3个</option>
                <option value="4-6">4-6个</option>
                <option value="7-10">7-10个</option>
                <option value="10+">10个以上</option>
              </select>
            </label>

            <button type="submit" disabled={isLoading} style={styles.button}>
              {isLoading ? "生成中..." : "生成世界观"}
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
              defaultTitle="世界观设定"
            >
              <div style={styles.resultContent}>
                {checkWorldName(result) ? (
                  <WorldviewRenderer data={result} />
                ) : (
                  <div style={{ padding: "16px" }}>
                    <p
                      style={{
                        color: "#94a3b8",
                        fontSize: "14px",
                        marginBottom: "16px",
                      }}
                    >
                      以下是世界观的完整内容：
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
    flex: 1,
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
  inputRow: {
    display: "flex",
    gap: "16px",
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
