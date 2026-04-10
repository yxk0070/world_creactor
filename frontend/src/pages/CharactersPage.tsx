import React from "react";
import { useCharacters } from "../hooks/useCharacters";
import { CharacterRenderer } from "../components/CharacterRenderer";
import { EditableResult } from "../components/EditableResult";
import { styles } from "./CharactersPage.styles";

export function CharactersPage() {
  const {
    worldviewName,
    selectedWorldview,
    worldviews,
    name,
    setName,
    role,
    setRole,
    personality,
    setPersonality,
    background,
    setBackground,
    isLoading,
    result,
    setResult,
    streamContent,
    showStream,
    navigate,
    handleWorldviewChange,
    handleSubmit,
    checkCharacter,
  } = useCharacters();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate("/")} style={styles.backButton}>
          ← 返回
        </button>
        <h1 style={styles.title}>创建人物</h1>
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
              名字
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入人物名字..."
                style={styles.input}
              />
            </label>

            <div style={styles.inputRow}>
              <label style={styles.label}>
                角色定位
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={styles.select}
                >
                  <option value="">选择定位...</option>
                  <option value="主角">主角</option>
                  <option value="反派">反派</option>
                  <option value="导师">导师</option>
                  <option value="盟友">盟友</option>
                  <option value="配角">配角</option>
                  <option value="路人">路人</option>
                </select>
              </label>

              <label style={styles.label}>
                性格特质
                <input
                  type="text"
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  placeholder="例如：勇敢、多疑、温柔..."
                  style={styles.input}
                />
              </label>
            </div>

            <label style={styles.label}>
              人物简介/背景 (可选)
              <textarea
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                placeholder="例如：曾是一名落魄的书生，后来偶得机缘..."
                style={
                  {
                    ...styles.input,
                    minHeight: "80px",
                    resize: "vertical",
                  } as any
                }
              />
            </label>

            <button type="submit" disabled={isLoading} style={styles.button}>
              {isLoading ? "生成中..." : "创建人物"}
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
              defaultTitle="人物设定"
            >
              <div style={styles.resultContent}>
                {checkCharacter(result) ? (
                  <CharacterRenderer data={result} />
                ) : (
                  <div style={{ padding: "16px" }}>
                    <p
                      style={{
                        color: "var(--text-muted)",
                        fontSize: "14px",
                        marginBottom: "16px",
                      }}
                    >
                      以下是人物的完整内容：
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
