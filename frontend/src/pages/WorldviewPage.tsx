import React from "react";
import { useWorldview } from "../hooks/useWorldview";
import { WorldviewRenderer } from "../components/WorldviewRenderer";
import { EditableResult } from "../components/EditableResult";
import { styles } from "./WorldviewPage.styles";

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
