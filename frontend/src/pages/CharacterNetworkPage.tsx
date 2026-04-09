import React from "react";
import { useCharacterNetwork } from "../hooks/useCharacterNetwork";
import { EditableResult } from "../components/EditableResult";
import { styles } from "./CharacterNetworkPage.styles";

export function CharacterNetworkPage() {
  const {
    selectedWorldviewId,
    setSelectedWorldviewId,
    worldviews,
    selectedCharacters,
    networkSize,
    setNetworkSize,
    relationshipTypes,
    setRelationshipTypes,
    isLoading,
    result,
    setResult,
    streamContent,
    showStream,
    navigate,
    filteredCharacters,
    handleCharacterToggle,
    getCharacterName,
    handleSubmit,
  } = useCharacterNetwork();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate("/")} style={styles.backButton}>
          ← 返回
        </button>
        <h1 style={styles.title}>生成人物关系网</h1>
      </div>

      <div style={styles.content}>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputSection}>
            <label style={styles.label}>
              所属世界观（可选）
              <select
                value={selectedWorldviewId}
                onChange={(e) => setSelectedWorldviewId(e.target.value)}
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

            <label style={styles.label}>
              选择核心人物（可选）
              <div style={styles.characterList}>
                {filteredCharacters.length === 0 ? (
                  <p style={styles.noCharacters}>暂无人物</p>
                ) : (
                  filteredCharacters.map((char) => {
                    const charName = char.data?.data?.name || char.name;
                    return (
                      <label key={char.id} style={styles.characterCheckbox}>
                        <input
                          type="checkbox"
                          checked={selectedCharacters.includes(char.id)}
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

            <div style={styles.inputRow}>
              <label style={styles.label}>
                关系网规模
                <select
                  value={networkSize}
                  onChange={(e) => setNetworkSize(e.target.value)}
                  style={styles.select}
                >
                  <option value="2">2个新人物</option>
                  <option value="3">3个新人物</option>
                  <option value="5">5个新人物</option>
                  <option value="8">8个新人物</option>
                </select>
              </label>
            </div>

            <label style={styles.label}>
              关系类型偏好（可选）
              <input
                type="text"
                value={relationshipTypes}
                onChange={(e) => setRelationshipTypes(e.target.value)}
                placeholder="例如：爱情、友情、敌对、师徒..."
                style={styles.input}
              />
            </label>

            <button type="submit" disabled={isLoading} style={styles.button}>
              {isLoading ? "生成中..." : "生成人物关系网"}
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
              defaultTitle="人物关系网"
            >
              <div style={styles.resultContent}>
                {(() => {
                  let parsedResult = result;
                  if ((result as any).response) {
                    try {
                      parsedResult = JSON.parse((result as any).response);
                    } catch (e) {
                      console.log("解析关系网结果失败:", e);
                    }
                  } else if (typeof result === "string") {
                    try {
                      parsedResult = JSON.parse(result);
                    } catch (e) {
                      console.log("解析关系网结果失败:", e);
                    }
                  }

                  const networkData =
                    parsedResult?.data?.data ||
                    parsedResult?.data ||
                    parsedResult;
                  const characters = networkData?.characters || [];
                  const summary = networkData?.network_summary;

                  if (!characters.length) {
                    return (
                      <pre style={styles.resultText}>
                        {typeof parsedResult === "string"
                          ? parsedResult
                          : JSON.stringify(parsedResult, null, 2)}
                      </pre>
                    );
                  }

                  return (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "24px",
                      }}
                    >
                      {summary && (
                        <div
                          style={{
                            background: "rgba(15, 23, 42, 0.6)",
                            padding: "16px",
                            borderRadius: "12px",
                            borderLeft: "4px solid #6366f1",
                          }}
                        >
                          <h4
                            style={{
                              margin: "0 0 8px 0",
                              color: "#e2e8f0",
                              fontSize: "16px",
                            }}
                          >
                            关系网概览
                          </h4>
                          <p
                            style={{
                              margin: 0,
                              color: "#94a3b8",
                              fontSize: "14px",
                              lineHeight: "1.6",
                            }}
                          >
                            {summary}
                          </p>
                        </div>
                      )}

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(300px, 1fr))",
                          gap: "16px",
                        }}
                      >
                        {characters.map((char: any, index: number) => (
                          <div
                            key={index}
                            style={{
                              background: "rgba(30, 41, 59, 0.8)",
                              borderRadius: "12px",
                              padding: "20px",
                              border: "1px solid rgba(71, 85, 105, 0.5)",
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
                                  margin: 0,
                                  color: "#f8fafc",
                                  fontSize: "18px",
                                }}
                              >
                                {char.name}
                              </h4>
                              <span
                                style={{
                                  background: "rgba(99, 102, 241, 0.2)",
                                  color: "#a5b4fc",
                                  padding: "4px 10px",
                                  borderRadius: "6px",
                                  fontSize: "12px",
                                }}
                              >
                                {char.basic_info?.role || char.role}
                              </span>
                            </div>

                            <p
                              style={{
                                color: "#cbd5e1",
                                fontSize: "14px",
                                marginBottom: "16px",
                                lineHeight: "1.5",
                              }}
                            >
                              {char.background}
                            </p>

                            {char.relationships &&
                              char.relationships.length > 0 && (
                                <div>
                                  <h5
                                    style={{
                                      margin: "0 0 8px 0",
                                      color: "#94a3b8",
                                      fontSize: "14px",
                                    }}
                                  >
                                    人物关系：
                                  </h5>
                                  <div
                                    style={{
                                      display: "flex",
                                      flexDirection: "column",
                                      gap: "8px",
                                    }}
                                  >
                                    {char.relationships.map(
                                      (rel: any, relIndex: number) => (
                                        <div
                                          key={relIndex}
                                          style={{
                                            background: "rgba(15, 23, 42, 0.4)",
                                            padding: "8px 12px",
                                            borderRadius: "6px",
                                            borderLeft: "2px solid #a5b4fc",
                                            fontSize: "13px",
                                          }}
                                        >
                                          <span
                                            style={{
                                              color: "#e2e8f0",
                                              fontWeight: "500",
                                            }}
                                          >
                                            与{" "}
                                            {rel.target_character || rel.target}
                                            ：
                                          </span>
                                          <span
                                            style={{
                                              color: "#94a3b8",
                                              marginLeft: "8px",
                                            }}
                                          >
                                            {rel.relation_type || rel.type} -{" "}
                                            {rel.description}
                                          </span>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </EditableResult>
          </div>
        )}
      </div>
    </div>
  );
}
