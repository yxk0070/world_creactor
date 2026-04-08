import { JsonRenderer } from "./JsonRenderer";

export function CharacterNetworkRenderer({ data }: { data: any }) {
  const characters = data?.characters || [];
  const summary = data?.network_summary;

  if (!characters.length) {
    return <JsonRenderer data={data} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
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
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
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
              <h4 style={{ margin: 0, color: "#f8fafc", fontSize: "18px" }}>
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

            {char.relationships && char.relationships.length > 0 && (
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
                  {char.relationships.map((rel: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        background: "rgba(15, 23, 42, 0.6)",
                        padding: "10px",
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                    >
                      <div style={{ color: "#f8fafc", marginBottom: "4px" }}>
                        与{" "}
                        <span style={{ color: "#38bdf8", fontWeight: "bold" }}>
                          {rel.target}
                        </span>
                        <span style={{ margin: "0 8px", color: "#94a3b8" }}>
                          -
                        </span>
                        <span style={{ color: "#10b981" }}>{rel.type}</span>
                      </div>
                      <div style={{ color: "#94a3b8" }}>{rel.description}</div>
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
