export function ArticleRenderer({ data }: { data: any }) {
  console.log("ArticleRenderer -> 接收到的原始 data:", data);

  // 兼容历史数据，文章数据可能嵌套在 data.data.data 或 data.data 中
  let articleData = data;
  if (data?.data?.data?.content || data?.data?.data?.title) {
    articleData = data.data.data;
    console.log("ArticleRenderer -> 解析层级: data.data.data");
  } else if (data?.data?.content || data?.data?.title || data?.data?.is_full_article) {
    articleData = data.data;
    console.log("ArticleRenderer -> 解析层级: data.data");
  } else {
    console.log("ArticleRenderer -> 解析层级: 原始 data");
  }

  console.log("ArticleRenderer -> 最终用于渲染的 articleData:", articleData);

  if (articleData.is_full_article && articleData.chapters) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <h2 style={{
            color: "var(--text-primary)",
            fontSize: "28px",
            fontWeight: "800",
            margin: "0 0 8px 0",
            textAlign: "center",
          }}>
          {articleData.title}
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "14px", margin: "0 0 24px 0" }}>
          连载全文 • 共 {articleData.chapters.length} 章
        </p>

        {articleData.chapters.map((chapter: any, index: number) => (
          <div key={index} style={{
            background: "var(--bg-glass)",
            borderRadius: "16px",
            padding: "32px",
            border: "1px solid var(--border-dark-80)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            marginBottom: "24px"
          }}>
            <h3 style={{
              color: "var(--accent-primary)",
              fontSize: "20px",
              fontWeight: "700",
              margin: "0 0 20px 0",
              paddingBottom: "12px",
              borderBottom: "1px dashed var(--border-dark)"
            }}>
              {chapter.chapter_title}
            </h3>
            <div style={{
              color: "var(--text-secondary)",
              fontSize: "16px",
              lineHeight: "1.9",
              whiteSpace: "pre-wrap",
              letterSpacing: "0.5px"
            }}>
              {chapter.content}
            </div>
            
            {chapter.event_description && (
              <div style={{
                marginTop: "24px",
                background: "var(--bg-card-60)",
                borderRadius: "8px",
                padding: "12px 16px",
                borderLeft: "4px solid var(--border-dark)",
                fontSize: "13px",
                color: "var(--text-tertiary)"
              }}>
                <strong style={{ color: "var(--text-muted)" }}>节点参考：</strong>
                {chapter.event_description}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div
        style={{
          background: "var(--bg-glass)",
          borderRadius: "12px",
          padding: "24px",
          border: "1px solid var(--border-dark-80)",
        }}
      >
        <h2
          style={{
            color: "var(--text-primary)",
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
                    background: "var(--accent-bg)",
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
            color: "var(--text-secondary)",
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
            background: "var(--bg-card-60)",
            borderRadius: "12px",
            padding: "16px",
            borderLeft: "4px solid var(--accent-primary)",
          }}
        >
          <h4
            style={{
              color: "var(--text-muted)",
              fontSize: "12px",
              margin: "0 0 8px 0",
              textTransform: "uppercase",
            }}
          >
            原始事件描述
          </h4>
          <p style={{ color: "var(--text-tertiary)", margin: 0, fontSize: "14px" }}>
            {articleData.event_description}
          </p>
        </div>
      )}
    </div>
  );
}
