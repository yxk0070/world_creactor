interface StorylineRendererProps {
  data: any;
}

export function StorylineRenderer({ data }: StorylineRendererProps) {
  if (!data) return null;

  // 处理可能存在的数据层级嵌套
  let storylineData = data;
  if (data.data) {
    storylineData = data.data;
    if (storylineData.data) {
      storylineData = storylineData.data;
    }
  }

  const { title, story_scale, genre, core_theme, key_events } = storylineData;

  return (
    <div style={{ maxWidth: "100%" }}>
      {title && (
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
            border: "1px solid rgba(99, 102, 241, 0.3)",
          }}
        >
          <h2
            style={{
              fontSize: "22px",
              fontWeight: "700",
              color: "#a78bfa",
              marginBottom: "12px",
            }}
          >
            📜 {title}
          </h2>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {story_scale && (
              <span
                style={{
                  background: "rgba(16, 185, 129, 0.2)",
                  color: "#10b981",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                {story_scale}
              </span>
            )}
            {genre && (
              <span
                style={{
                  background: "rgba(245, 158, 11, 0.2)",
                  color: "#f59e0b",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                {genre}
              </span>
            )}
          </div>
          {core_theme && (
            <p
              style={{
                marginTop: "12px",
                color: "#cbd5e1",
                fontSize: "14px",
                lineHeight: "1.6",
                fontStyle: "italic",
              }}
            >
              💡 {core_theme}
            </p>
          )}
        </div>
      )}

      {key_events && key_events.length > 0 && (
        <div style={{ position: "relative" }}>
          {key_events.map((event: any, index: number) => {
            const isFirst = index === 0;
            const isLast = index === key_events.length - 1;
            const hasNext = !isLast;

            return (
              <div
                key={event.event_order || index}
                style={{ position: "relative" }}
              >
                {hasNext && (
                  <div
                    style={{
                      position: "absolute",
                      left: "19px",
                      top: "48px",
                      bottom: "-24px",
                      width: "2px",
                      background:
                        "linear-gradient(180deg, #6366f1 0%, rgba(99, 102, 241, 0.3) 100%)",
                    }}
                  />
                )}

                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    marginBottom: "24px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "700",
                      fontSize: "14px",
                      flexShrink: 0,
                      boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)",
                      zIndex: 1,
                    }}
                  >
                    {event.event_order || index + 1}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        background: "rgba(30, 41, 59, 0.8)",
                        borderRadius: "12px",
                        padding: "16px",
                        border: "1px solid rgba(71, 85, 105, 0.5)",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#e2e8f0",
                          marginBottom: "8px",
                        }}
                      >
                        {event.event_title ||
                          `事件 ${event.event_order || index + 1}`}
                      </h3>

                      {event.description && (
                        <p
                          style={{
                            color: "#cbd5e1",
                            fontSize: "14px",
                            lineHeight: "1.7",
                            marginBottom: "12px",
                          }}
                        >
                          {event.description}
                        </p>
                      )}

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                          marginBottom: "8px",
                        }}
                      >
                        {event.location && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              background: "rgba(59, 130, 246, 0.2)",
                              color: "#60a5fa",
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "12px",
                            }}
                          >
                            📍 {event.location}
                          </span>
                        )}
                        {event.key_characters &&
                          event.key_characters.map(
                            (char: string, i: number) => (
                              <span
                                key={i}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "4px",
                                  background: "rgba(236, 72, 153, 0.2)",
                                  color: "#f472b6",
                                  padding: "4px 10px",
                                  borderRadius: "6px",
                                  fontSize: "12px",
                                }}
                              >
                                👤 {char}
                              </span>
                            )
                          )}
                      </div>

                      {event.significance && (
                        <div
                          style={{
                            background: "rgba(139, 92, 246, 0.15)",
                            borderRadius: "8px",
                            padding: "8px 12px",
                            borderLeft: "3px solid #a78bfa",
                          }}
                        >
                          <span
                            style={{
                              color: "#c4b5fd",
                              fontSize: "12px",
                              fontStyle: "italic",
                            }}
                          >
                            {event.significance}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
