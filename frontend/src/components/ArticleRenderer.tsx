export function ArticleRenderer({ data }: { data: any }) {
  console.log("ArticleRenderer -> 接收到的原始 data:", data);

  // 兼容历史数据，文章数据可能嵌套在 data.data.data 或 data.data 中
  let articleData = data;
  if (data?.data?.data?.content || data?.data?.data?.title) {
    articleData = data.data.data;
    console.log("ArticleRenderer -> 解析层级: data.data.data");
  } else if (data?.data?.content || data?.data?.title) {
    articleData = data.data;
    console.log("ArticleRenderer -> 解析层级: data.data");
  } else {
    console.log("ArticleRenderer -> 解析层级: 原始 data");
  }

  console.log("ArticleRenderer -> 最终用于渲染的 articleData:", articleData);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div
        style={{
          background: "rgba(15, 23, 42, 0.6)",
          borderRadius: "12px",
          padding: "24px",
          border: "1px solid rgba(51, 65, 85, 0.8)",
        }}
      >
        <h2
          style={{
            color: "#f8fafc",
            fontSize: "24px",
            fontWeight: "700",
            margin: "0 0 16px 0",
            textAlign: "center",
          }}
        >
          {articleData.title || "无标题文章"}
        </h2>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "24px",
            justifyContent: "center",
          }}
        >
          {articleData.characters_involved &&
            articleData.characters_involved.map(
              (char: string, index: number) => (
                <span
                  key={index}
                  style={{
                    background: "rgba(99, 102, 241, 0.2)",
                    color: "#a5b4fc",
                    padding: "4px 12px",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                >
                  👤 {char}
                </span>
              ),
            )}
          {articleData.word_count && (
            <span
              style={{
                background: "rgba(16, 185, 129, 0.2)",
                color: "#6ee7b7",
                padding: "4px 12px",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            >
              📝 约 {articleData.word_count}
            </span>
          )}
        </div>

        <div
          style={{
            color: "#e2e8f0",
            fontSize: "16px",
            lineHeight: "1.8",
            whiteSpace: "pre-wrap",
          }}
        >
          {articleData.content}
        </div>
      </div>

      {articleData.event_description && (
        <div
          style={{
            background: "rgba(30, 41, 59, 0.6)",
            borderRadius: "12px",
            padding: "16px",
            borderLeft: "4px solid #6366f1",
          }}
        >
          <h4
            style={{
              color: "#94a3b8",
              fontSize: "12px",
              margin: "0 0 8px 0",
              textTransform: "uppercase",
            }}
          >
            原始事件描述
          </h4>
          <p style={{ color: "#cbd5e1", margin: 0, fontSize: "14px" }}>
            {articleData.event_description}
          </p>
        </div>
      )}
    </div>
  );
}
