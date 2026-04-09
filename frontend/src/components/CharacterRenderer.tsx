interface CharacterRendererProps {
  data: any;
}

export function CharacterRenderer({ data }: CharacterRendererProps) {
  if (!data) {
    console.log("CharacterRenderer: data为空");
    return null;
  }

  console.log("CharacterRenderer接收到的数据:", data);

  let characterData = data;

  if (characterData.success && characterData.response) {
    try {
      const parsedResponse = JSON.parse(characterData.response);
      console.log("解析后的response:", parsedResponse);
      characterData = parsedResponse;
    } catch (e) {
      console.log("解析response失败:", e);
      characterData = characterData.response;
    }
  }

  // 提取为数组以便支持渲染多个人物
  let characterList: any[] = [];

  if (Array.isArray(characterData)) {
    characterList = characterData.map((item) => item.data || item);
  } else if (
    characterData &&
    characterData.data &&
    Array.isArray(characterData.data)
  ) {
    characterList = characterData.data;
  } else if (characterData && characterData.data) {
    characterList = [characterData.data];
  } else {
    characterList = [characterData];
  }

  // 过滤出真正包含 name 属性的人物对象
  characterList = characterList.filter((char) => char && char.name);

  if (characterList.length === 0) {
    console.log("CharacterRenderer: characterData为空或无效");
    return null;
  }

  console.log("最终提取的 characterList:", characterList);

  const getRoleIcon = (role: string) => {
    const icons: Record<string, string> = {
      主角: "👑",
      反派: "💀",
      导师: "📚",
      盟友: "🤝",
      配角: "👤",
      路人: "👥",
    };
    return icons[role] || "👤";
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      主角: "#f59e0b",
      反派: "#ef4444",
      导师: "#3b82f6",
      盟友: "#10b981",
      配角: "#6366f1",
      路人: "#64748b",
    };
    return colors[role] || "#818cf8";
  };

  return (
    <div
      style={{
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "40px",
      }}
    >
      {characterList.map((character, index) => {
        const basicInfo = character.basic_info || {};
        const lifeExperience = character.life_experience || {};

        return (
          <div
            key={index}
            style={{
              borderBottom:
                index < characterList.length - 1
                  ? "2px dashed rgba(71, 85, 105, 0.4)"
                  : "none",
              paddingBottom: index < characterList.length - 1 ? "40px" : "0",
            }}
          >
            {character.name && (
              <div
                style={{
                  background: `linear-gradient(135deg, ${getRoleColor(
                    basicInfo.role
                  )}33 0%, rgba(139, 92, 246, 0.1) 100%)`,
                  borderRadius: "12px",
                  padding: "20px",
                  marginBottom: "20px",
                  border: `1px solid ${getRoleColor(basicInfo.role)}66`,
                }}
              >
                <h2
                  style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    color: getRoleColor(basicInfo.role),
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  {getRoleIcon(basicInfo.role)} {character.name}
                </h2>

                {basicInfo && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "12px",
                      marginTop: "12px",
                    }}
                  >
                    {basicInfo.role && (
                      <span
                        style={{
                          background: "rgba(15, 23, 42, 0.6)",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          color: "#cbd5e1",
                          border: "1px solid rgba(71, 85, 105, 0.5)",
                        }}
                      >
                        🎭 {basicInfo.role}
                      </span>
                    )}
                    {basicInfo.age && (
                      <span
                        style={{
                          background: "rgba(15, 23, 42, 0.6)",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          color: "#cbd5e1",
                          border: "1px solid rgba(71, 85, 105, 0.5)",
                        }}
                      >
                        🎂 {basicInfo.age}
                      </span>
                    )}
                    {basicInfo.is_important !== undefined && (
                      <span
                        style={{
                          background: basicInfo.is_important
                            ? "rgba(245, 158, 11, 0.15)"
                            : "rgba(100, 116, 139, 0.15)",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          color: basicInfo.is_important ? "#f59e0b" : "#94a3b8",
                          border: basicInfo.is_important
                            ? "1px solid rgba(245, 158, 11, 0.3)"
                            : "1px solid rgba(100, 116, 139, 0.3)",
                        }}
                      >
                        {basicInfo.is_important ? "⭐ 重要人物" : "👤 普通角色"}
                      </span>
                    )}
                  </div>
                )}

                {basicInfo.appearance && (
                  <p
                    style={{
                      marginTop: "16px",
                      padding: "12px 16px",
                      background: "rgba(15, 23, 42, 0.6)",
                      borderRadius: "8px",
                      color: "#94a3b8",
                      fontSize: "14px",
                      lineHeight: "1.6",
                      borderLeft: `3px solid ${getRoleColor(basicInfo.role)}`,
                    }}
                  >
                    👁️ {basicInfo.appearance}
                  </p>
                )}
              </div>
            )}

            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {character.personality && (
                <div
                  style={{
                    background: "rgba(30, 41, 59, 0.85)",
                    borderRadius: "12px",
                    padding: "20px",
                    border: "1px solid rgba(71, 85, 105, 0.5)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#818cf8",
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    🧠 性格特质
                  </h3>
                  <p
                    style={{
                      color: "#cbd5e1",
                      fontSize: "14px",
                      lineHeight: "1.8",
                      margin: 0,
                    }}
                  >
                    {character.personality}
                  </p>
                </div>
              )}

              {character.background && (
                <div
                  style={{
                    background: "rgba(30, 41, 59, 0.85)",
                    borderRadius: "12px",
                    padding: "20px",
                    border: "1px solid rgba(71, 85, 105, 0.5)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#818cf8",
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    📖 背景故事
                  </h3>
                  <p
                    style={{
                      color: "#cbd5e1",
                      fontSize: "14px",
                      lineHeight: "1.8",
                      margin: 0,
                    }}
                  >
                    {character.background}
                  </p>
                </div>
              )}

              {character.abilities && character.abilities.length > 0 && (
                <div
                  style={{
                    background: "rgba(30, 41, 59, 0.85)",
                    borderRadius: "12px",
                    padding: "20px",
                    border: "1px solid rgba(71, 85, 105, 0.5)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#818cf8",
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    ⚔️ 能力与技能
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: "20px" }}>
                    {character.abilities.map(
                      (ability: string, index: number) => (
                        <li
                          key={index}
                          style={{
                            color: "#cbd5e1",
                            fontSize: "14px",
                            lineHeight: "1.8",
                            marginBottom: "6px",
                          }}
                        >
                          {ability}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {character.position_in_world && (
                <div
                  style={{
                    background: "rgba(30, 41, 59, 0.85)",
                    borderRadius: "12px",
                    padding: "20px",
                    border: "1px solid rgba(71, 85, 105, 0.5)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#818cf8",
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    🌍 世界观定位
                  </h3>
                  <p
                    style={{
                      color: "#cbd5e1",
                      fontSize: "14px",
                      lineHeight: "1.8",
                      margin: 0,
                    }}
                  >
                    {character.position_in_world}
                  </p>
                </div>
              )}

              {character.relationships &&
                character.relationships.length > 0 && (
                  <div
                    style={{
                      background: "rgba(30, 41, 59, 0.85)",
                      borderRadius: "12px",
                      padding: "20px",
                      border: "1px solid rgba(71, 85, 105, 0.5)",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#818cf8",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      🔗 人物关系
                    </h3>
                    <ul style={{ margin: 0, paddingLeft: "20px" }}>
                      {character.relationships.map(
                        (rel: any, index: number) => (
                          <li
                            key={index}
                            style={{
                              color: "#cbd5e1",
                              fontSize: "14px",
                              lineHeight: "1.8",
                              marginBottom: "6px",
                            }}
                          >
                            <strong style={{ color: "#f8fafc" }}>
                              {rel.target}
                            </strong>{" "}
                            ({rel.type}): {rel.description}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {(lifeExperience.birth ||
                lifeExperience.childhood ||
                lifeExperience.growth ||
                (lifeExperience.major_events &&
                  lifeExperience.major_events.length > 0) ||
                lifeExperience.death) && (
                <div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#818cf8",
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    📜 人生经历
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    {lifeExperience.birth && (
                      <div
                        style={{
                          background: "rgba(30, 41, 59, 0.85)",
                          borderRadius: "12px",
                          padding: "20px",
                          border: "1px solid rgba(71, 85, 105, 0.5)",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "4px",
                            height: "100%",
                            background:
                              "linear-gradient(180deg, #22c55e 0%, #10b981 100%)",
                          }}
                        />
                        <div style={{ marginLeft: "12px" }}>
                          <h4
                            style={{
                              fontSize: "15px",
                              fontWeight: "600",
                              color: "#22c55e",
                              marginBottom: "8px",
                            }}
                          >
                            👶 出生背景
                          </h4>
                          <p
                            style={{
                              color: "#94a3b8",
                              fontSize: "13px",
                              lineHeight: "1.6",
                              margin: 0,
                            }}
                          >
                            {lifeExperience.birth}
                          </p>
                        </div>
                      </div>
                    )}

                    {lifeExperience.childhood && (
                      <div
                        style={{
                          background: "rgba(30, 41, 59, 0.85)",
                          borderRadius: "12px",
                          padding: "20px",
                          border: "1px solid rgba(71, 85, 105, 0.5)",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "4px",
                            height: "100%",
                            background:
                              "linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)",
                          }}
                        />
                        <div style={{ marginLeft: "12px" }}>
                          <h4
                            style={{
                              fontSize: "15px",
                              fontWeight: "600",
                              color: "#3b82f6",
                              marginBottom: "8px",
                            }}
                          >
                            🧒 童年经历
                          </h4>
                          <p
                            style={{
                              color: "#94a3b8",
                              fontSize: "13px",
                              lineHeight: "1.6",
                              margin: 0,
                            }}
                          >
                            {lifeExperience.childhood}
                          </p>
                        </div>
                      </div>
                    )}

                    {lifeExperience.growth && (
                      <div
                        style={{
                          background: "rgba(30, 41, 59, 0.85)",
                          borderRadius: "12px",
                          padding: "20px",
                          border: "1px solid rgba(71, 85, 105, 0.5)",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "4px",
                            height: "100%",
                            background:
                              "linear-gradient(180deg, #f59e0b 0%, #d97706 100%)",
                          }}
                        />
                        <div style={{ marginLeft: "12px" }}>
                          <h4
                            style={{
                              fontSize: "15px",
                              fontWeight: "600",
                              color: "#f59e0b",
                              marginBottom: "8px",
                            }}
                          >
                            🌱 成长历程
                          </h4>
                          <p
                            style={{
                              color: "#94a3b8",
                              fontSize: "13px",
                              lineHeight: "1.6",
                              margin: 0,
                            }}
                          >
                            {lifeExperience.growth}
                          </p>
                        </div>
                      </div>
                    )}

                    {lifeExperience.major_events &&
                      lifeExperience.major_events.length > 0 && (
                        <div
                          style={{
                            background: "rgba(30, 41, 59, 0.85)",
                            borderRadius: "12px",
                            padding: "20px",
                            border: "1px solid rgba(71, 85, 105, 0.5)",
                          }}
                        >
                          <h4
                            style={{
                              fontSize: "15px",
                              fontWeight: "600",
                              color: "#8b5cf6",
                              marginBottom: "12px",
                            }}
                          >
                            🎯 重大事件
                          </h4>
                          <ul style={{ margin: 0, paddingLeft: "20px" }}>
                            {lifeExperience.major_events.map(
                              (event: string, index: number) => (
                                <li
                                  key={index}
                                  style={{
                                    color: "#cbd5e1",
                                    fontSize: "14px",
                                    lineHeight: "1.8",
                                    marginBottom: "6px",
                                  }}
                                >
                                  {event}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}

                    {lifeExperience.death && (
                      <div
                        style={{
                          background: "rgba(30, 41, 59, 0.85)",
                          borderRadius: "12px",
                          padding: "20px",
                          border: "1px solid rgba(71, 85, 105, 0.5)",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "4px",
                            height: "100%",
                            background:
                              "linear-gradient(180deg, #ef4444 0%, #dc2626 100%)",
                          }}
                        />
                        <div style={{ marginLeft: "12px" }}>
                          <h4
                            style={{
                              fontSize: "15px",
                              fontWeight: "600",
                              color: "#ef4444",
                              marginBottom: "8px",
                            }}
                          >
                            ⚰️ 死亡结局
                          </h4>
                          <p
                            style={{
                              color: "#94a3b8",
                              fontSize: "13px",
                              lineHeight: "1.6",
                              margin: 0,
                            }}
                          >
                            {lifeExperience.death}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
