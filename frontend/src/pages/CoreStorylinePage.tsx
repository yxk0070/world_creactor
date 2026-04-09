import React from "react";
import { useCoreStoryline } from "../hooks/useCoreStoryline";
import { StorylineRenderer } from "../components/StorylineRenderer";
import { EditableResult } from "../components/EditableResult";
import { styles } from "./CoreStorylinePage.styles";

export function CoreStorylinePage() {
  const {
    selectedWorldview,
    worldviewName,
    worldviews,
    selectedCharacterIds,
    storyScale,
    setStoryScale,
    isLoading,
    result,
    setResult,
    streamContent,
    showStream,
    navigate,
    filteredCharacters,
    getCharacterName,
    handleCharacterToggle,
    handleWorldviewChange,
    handleSubmit,
  } = useCoreStoryline();

  const mainCharacters = filteredCharacters.filter(
    (c: any) => c._source !== "related",
  );
  const relatedCharacters = filteredCharacters.filter(
    (c: any) => c._source === "related",
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate("/")} style={styles.backButton}>
          ← 返回
        </button>
        <h1 style={styles.title}>生成核心故事线</h1>
      </div>

      <div style={styles.content}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputSection}>
            <label style={styles.label}>
              所属世界观（可选）
              <select
                value={selectedWorldview}
                onChange={handleWorldviewChange}
                style={styles.select}
              >
                <option value="">选择世界观...</option>
                {worldviews.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </label>

            {worldviewName && (
              <p style={styles.worldviewHint}>世界观：{worldviewName}</p>
            )}

            <label style={styles.label}>
              选择核心人物（可选）
              <div style={styles.characterList}>
                {mainCharacters.length === 0 ? (
                  <p style={styles.noCharacters}>暂无人物</p>
                ) : (
                  mainCharacters.map((char: any) => {
                    const charName = char.data?.data?.name || char.name;
                    return (
                      <label key={char.id} style={styles.characterCheckbox}>
                        <input
                          type="checkbox"
                          checked={selectedCharacterIds.includes(char.id)}
                          onChange={() => handleCharacterToggle(char.id)}
                          style={styles.checkbox}
                        />
                        <span style={styles.characterName}>{charName}</span>
                      </label>
                    );
                  })
                )}
              </div>
            </label>

            <label style={styles.label}>
              选择关联人物（可选）
              <div style={styles.characterList}>
                {relatedCharacters.length === 0 ? (
                  <p style={styles.noCharacters}>暂无关联人物</p>
                ) : (
                  relatedCharacters.map((char: any) => {
                    const charName = char.data?.data?.name || char.name;
                    return (
                      <label key={char.id} style={styles.characterCheckbox}>
                        <input
                          type="checkbox"
                          checked={selectedCharacterIds.includes(char.id)}
                          onChange={() => handleCharacterToggle(char.id)}
                          style={styles.checkbox}
                        />
                        <span style={styles.characterName}>
                          {charName}
                          <span
                            style={{
                              marginLeft: "6px",
                              fontSize: "11px",
                              background: "rgba(16, 185, 129, 0.2)",
                              color: "#10b981",
                              padding: "2px 6px",
                              borderRadius: "4px",
                            }}
                          >
                            关联人物
                          </span>
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </label>

            <div style={styles.inputRow}>
              <label style={styles.label}>
                故事规模
                <select
                  value={storyScale}
                  onChange={(e) => setStoryScale(e.target.value)}
                  style={styles.select}
                >
                  <option value="短篇">短篇</option>
                  <option value="中篇">中篇</option>
                  <option value="长篇">长篇</option>
                  <option value="史诗">史诗</option>
                </select>
              </label>
            </div>

            <button type="submit" disabled={isLoading} style={styles.button}>
              {isLoading ? "生成中..." : "生成核心故事线"}
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
              defaultTitle="核心故事线"
            >
              <div style={styles.resultContent}>
                {(() => {
                  let parsedResult = result;
                  if ((result as any).response) {
                    try {
                      parsedResult = JSON.parse((result as any).response);
                    } catch (e) {
                      console.log("解析故事线结果失败:", e);
                    }
                  } else if (typeof result === "string") {
                    try {
                      parsedResult = JSON.parse(result);
                    } catch (e) {
                      console.log("解析故事线结果失败:", e);
                    }
                  }

                  // 检查是否包含有效的结构化数据
                  const dataToCheck =
                    parsedResult?.data?.data ||
                    parsedResult?.data ||
                    parsedResult;
                  const hasStructuredData =
                    dataToCheck &&
                    (dataToCheck.key_events ||
                      dataToCheck.title ||
                      dataToCheck.core_theme);

                  if (!hasStructuredData) {
                    return (
                      <div style={{ padding: "16px" }}>
                        <p
                          style={{
                            color: "#94a3b8",
                            fontSize: "14px",
                            marginBottom: "16px",
                          }}
                        >
                          以下是故事线的完整内容：
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
                          {typeof parsedResult === "string"
                            ? parsedResult
                            : JSON.stringify(parsedResult, null, 2)}
                        </pre>
                      </div>
                    );
                  }

                  return <StorylineRenderer data={parsedResult} />;
                })()}
              </div>
            </EditableResult>
          </div>
        )}
      </div>
    </div>
  );
}
