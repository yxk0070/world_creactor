interface WorldviewRendererProps {
  data: any;
}

export function WorldviewRenderer({ data }: WorldviewRendererProps) {
  if (!data) {
    console.log("WorldviewRenderer: data为空");
    return null;
  }

  console.log("WorldviewRenderer接收到的数据:", data);

  let worldviewData = data;

  if (worldviewData.success && worldviewData.response) {
    try {
      const parsedResponse = JSON.parse(worldviewData.response);
      console.log("解析后的response:", parsedResponse);
      worldviewData = parsedResponse;
    } catch (e) {
      console.log("解析response失败:", e);
      worldviewData = worldviewData.response;
    }
  }
  
  if (Array.isArray(worldviewData) && worldviewData.length > 0) {
    worldviewData = worldviewData[0];
  }

  if (worldviewData.data) {
    worldviewData = worldviewData.data;
    if (worldviewData.data) {
      worldviewData = worldviewData.data;
    }
  }

  console.log("解析后的worldviewData:", worldviewData);

  if (!worldviewData) {
    console.log("WorldviewRenderer: worldviewData为空");
    return null;
  }

  const world_name = worldviewData.world_name;
  const basic_settings = worldviewData.basic_settings || {};
  const geography = worldviewData.geography;
  const social_structure = worldviewData.social_structure;
  const history = worldviewData.history;
  const factions = worldviewData.factions || [];

  console.log("最终提取的字段:", {
    world_name,
    basic_settings,
    geography,
    social_structure,
    history,
    factions,
  });

  const getGenreIcon = (genre: string) => {
    const icons: Record<string, string> = {
      奇幻: "🗡️",
      科幻: "🚀",
      仙侠: "⛩️",
      武侠: "⚔️",
      现代: "🏙️",
      末世: "💀",
      玄幻: "🌌",
    };
    return icons[genre] || "🌍";
  };

  const getGenreColor = (genre: string) => {
    const colors: Record<string, string> = {
      奇幻: "#a78bfa",
      科幻: "#38bdf8",
      仙侠: "#f59e0b",
      武侠: "#ef4444",
      现代: "#22c55e",
      末世: "#78716c",
      玄幻: "#ec4899",
    };
    return colors[genre] || "#818cf8";
  };

  return (
    <div style={{ maxWidth: "100%" }}>
      {world_name && (
        <div
          style={{
            background: `linear-gradient(135deg, ${getGenreColor(
              basic_settings?.genre,
            )}33 0%, rgba(139, 92, 246, 0.1) 100%)`,
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
            border: `1px solid ${getGenreColor(basic_settings?.genre)}66`,
          }}
        >
          <h2
            style={{
              fontSize: "22px",
              fontWeight: "700",
              color: getGenreColor(basic_settings?.genre),
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {getGenreIcon(basic_settings?.genre)} {world_name}
          </h2>

          {basic_settings && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginTop: "12px",
              }}
            >
              {basic_settings.genre && (
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
                  📚 {basic_settings.genre}
                </span>
              )}
              {(basic_settings.combat_power_level ||
                basic_settings.magic_level ||
                basic_settings.power_level) && (
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
                  💪 个体战斗力水平:{" "}
                  {basic_settings.combat_power_level ||
                    basic_settings.magic_level ||
                    basic_settings.power_level ||
                    "未知"}
                </span>
              )}
              {basic_settings.technology_level && (
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
                  🔧 科技: {basic_settings.technology_level}
                </span>
              )}
            </div>
          )}

          {basic_settings?.core_theme && (
            <p
              style={{
                marginTop: "16px",
                padding: "12px 16px",
                background: "rgba(15, 23, 42, 0.6)",
                borderRadius: "8px",
                color: "#94a3b8",
                fontStyle: "italic",
                fontSize: "14px",
                lineHeight: "1.6",
                borderLeft: `3px solid ${getGenreColor(basic_settings?.genre)}`,
              }}
            >
              "{basic_settings.core_theme}"
            </p>
          )}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {geography && (
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
              🗺️ 地理环境
            </h3>
            <p
              style={{
                color: "#cbd5e1",
                fontSize: "14px",
                lineHeight: "1.8",
                margin: 0,
              }}
            >
              {geography}
            </p>
          </div>
        )}

        {social_structure && (
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
              🏛️ 社会结构
            </h3>
            <p
              style={{
                color: "#cbd5e1",
                fontSize: "14px",
                lineHeight: "1.8",
                margin: 0,
              }}
            >
              {social_structure}
            </p>
          </div>
        )}

        {history && (
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
              📜 历史背景
            </h3>
            <p
              style={{
                color: "#cbd5e1",
                fontSize: "14px",
                lineHeight: "1.8",
                margin: 0,
              }}
            >
              {history}
            </p>
          </div>
        )}

        {factions && factions.length > 0 && (
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
              👥 主要势力 ({factions.length})
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {factions.map((faction: any, index: number) => (
                <div
                  key={index}
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
                        "linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%)",
                    }}
                  />

                  <div style={{ marginLeft: "12px" }}>
                    <h4
                      style={{
                        fontSize: "15px",
                        fontWeight: "600",
                        color: "#f8fafc",
                        marginBottom: "8px",
                      }}
                    >
                      {faction.name}
                    </h4>

                    {faction.description && (
                      <p
                        style={{
                          color: "#94a3b8",
                          fontSize: "13px",
                          lineHeight: "1.6",
                          marginBottom: "12px",
                        }}
                      >
                        {faction.description}
                      </p>
                    )}

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                        marginBottom: "12px",
                      }}
                    >
                      {faction.leader && (
                        <span
                          style={{
                            background: "rgba(99, 102, 241, 0.15)",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            color: "#a5b4fc",
                            border: "1px solid rgba(99, 102, 241, 0.3)",
                          }}
                        >
                          👑 {faction.leader}
                        </span>
                      )}
                      {faction.territory && (
                        <span
                          style={{
                            background: "rgba(139, 92, 246, 0.15)",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            color: "#c4b5fd",
                            border: "1px solid rgba(139, 92, 246, 0.3)",
                          }}
                        >
                          📍 {faction.territory}
                        </span>
                      )}
                    </div>

                    {faction.ideology && (
                      <p
                        style={{
                          color: "#f59e0b",
                          fontSize: "13px",
                          fontStyle: "italic",
                          marginBottom: "12px",
                          padding: "8px 12px",
                          background: "rgba(245, 158, 11, 0.1)",
                          borderRadius: "6px",
                          borderLeft: "2px solid #f59e0b",
                        }}
                      >
                        "{faction.ideology}"
                      </p>
                    )}

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "12px",
                      }}
                    >
                      {faction.strengths && faction.strengths.length > 0 && (
                        <div>
                          <h5
                            style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#22c55e",
                              marginBottom: "6px",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            ✅ 优势
                          </h5>
                          <ul style={{ margin: 0, paddingLeft: "16px" }}>
                            {faction.strengths.map(
                              (strength: string, i: number) => (
                                <li
                                  key={i}
                                  style={{
                                    color: "#86efac",
                                    fontSize: "12px",
                                    lineHeight: "1.6",
                                    marginBottom: "4px",
                                  }}
                                >
                                  {strength}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}

                      {faction.weaknesses && faction.weaknesses.length > 0 && (
                        <div>
                          <h5
                            style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#ef4444",
                              marginBottom: "6px",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            ⚠️ 劣势
                          </h5>
                          <ul style={{ margin: 0, paddingLeft: "16px" }}>
                            {faction.weaknesses.map(
                              (weakness: string, i: number) => (
                                <li
                                  key={i}
                                  style={{
                                    color: "#fca5a5",
                                    fontSize: "12px",
                                    lineHeight: "1.6",
                                    marginBottom: "4px",
                                  }}
                                >
                                  {weakness}
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
