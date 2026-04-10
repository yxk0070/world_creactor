import { JsonRenderer } from "./JsonRenderer";

export function CharacterNetworkRenderer({ data }: { data: any }) {
  let networkData = data;
  if (data?.data && data.data.characters) {
    networkData = data.data;
  }

  const characters = networkData?.characters || [];
  const summary = networkData?.network_summary;

  if (!characters.length) {
    return <JsonRenderer data={data} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {summary && (
        <div
          style={{
            background: "var(--bg-glass)",
            padding: "16px",
            borderRadius: "12px",
            borderLeft: "4px solid var(--accent-primary)",
          }}
        >
          <h4
            style={{
              margin: "0 0 8px 0",
              color: "var(--text-secondary)",
              fontSize: "16px",
            }}
          >
            关系网概览
          </h4>
          <p
            style={{
              margin: 0,
              color: "var(--text-muted)",
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
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "16px",
        }}
      >
        {characters.map((char: any, index: number) => (
          <div
            key={index}
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
                marginBottom: "12px",
              }}
            >
              <h4 style={{ margin: 0, color: "var(--text-primary)", fontSize: "18px" }}>
                {char.name}
              </h4>
              <span
                style={{
                  background: "var(--accent-bg)",
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
                color: "var(--text-tertiary)",
                fontSize: "14px",
                marginBottom: "16px",
                lineHeight: "1.5",
              }}
            >
              {char.background}
            </p>

            {char.relationships && char.relationships.length > 0 && (
              <div>
                <h5
                  style={{
                    margin: "0 0 8px 0",
                    color: "var(--text-muted)",
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
                  {char.relationships.map((rel: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        background: "var(--bg-glass)",
                        padding: "10px",
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                    >
                      <div style={{ color: "var(--text-primary)", marginBottom: "4px" }}>
                        与{" "}
                        <span style={{ color: "#38bdf8", fontWeight: "bold" }}>
                          {rel.target}
                        </span>
                        <span style={{ margin: "0 8px", color: "var(--text-muted)" }}>
                          -
                        </span>
                        <span style={{ color: "#10b981" }}>{rel.type}</span>
                      </div>
                      <div style={{ color: "var(--text-muted)" }}>{rel.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
