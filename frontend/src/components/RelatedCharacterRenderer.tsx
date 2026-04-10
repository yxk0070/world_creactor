export function RelatedCharacterRenderer({ data }: { data: any }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div
        style={{
          background: "var(--bg-card-80)",
          borderRadius: "12px",
          padding: "20px",
          border: "1px solid var(--border-dark)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h4 style={{ margin: 0, color: "var(--text-primary)", fontSize: "20px" }}>
            {data.name}
          </h4>
          <div style={{ display: "flex", gap: "8px" }}>
            <span
              style={{
                background: "var(--accent-bg)",
                color: "#a5b4fc",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            >
              {data.role}
            </span>
            <span
              style={{
                background: "rgba(16, 185, 129, 0.2)",
                color: "#6ee7b7",
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            >
              {data.relationship_to_core}
            </span>
          </div>
        </div>

        <p
          style={{
            color: "var(--text-tertiary)",
            fontSize: "14px",
            marginBottom: "16px",
            lineHeight: "1.6",
          }}
        >
          <strong>背景：</strong> {data.background}
        </p>

        {data.personality_traits && data.personality_traits.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <strong
              style={{
                color: "var(--text-muted)",
                fontSize: "14px",
                display: "block",
                marginBottom: "8px",
              }}
            >
              性格特征：
            </strong>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {data.personality_traits.map((trait: string, idx: number) => (
                <span
                  key={idx}
                  style={{
                    background: "var(--bg-glass)",
                    color: "var(--text-tertiary)",
                    padding: "4px 12px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    border: "1px solid var(--border-light)",
                  }}
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.relationships && data.relationships.length > 0 && (
          <div>
            <strong
              style={{
                color: "var(--text-muted)",
                fontSize: "14px",
                display: "block",
                marginBottom: "8px",
              }}
            >
              详细关系：
            </strong>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {data.relationships.map((rel: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--bg-glass)",
                    padding: "12px",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                >
                  <div style={{ color: "var(--text-primary)", marginBottom: "4px" }}>
                    与{" "}
                    <span style={{ color: "#38bdf8", fontWeight: "bold" }}>
                      {rel.target}
                    </span>
                    <span style={{ margin: "0 8px", color: "var(--text-muted)" }}>-</span>
                    <span style={{ color: "#10b981" }}>{rel.type}</span>
                  </div>
                  <div style={{ color: "var(--text-muted)" }}>{rel.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
