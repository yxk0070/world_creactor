interface DialogueRendererProps {
  data: any;
}

export function DialogueRenderer({ data }: DialogueRendererProps) {
  const dialogueData = data.data || data;
  const content = dialogueData.content || dialogueData.dialogue || JSON.stringify(dialogueData, null, 2);

  return (
    <div
      style={{
        background: "rgba(15, 23, 42, 0.6)",
        borderRadius: "16px",
        padding: "24px",
        border: "1px solid rgba(71, 85, 105, 0.4)",
      }}
    >
      <h3
        style={{
          margin: "0 0 16px 0",
          color: "#f8fafc",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span>💬</span> 对话文案
      </h3>
      <div
        style={{
          color: "#e2e8f0",
          lineHeight: "1.8",
          fontSize: "15px",
          whiteSpace: "pre-wrap",
          background: "rgba(30, 41, 59, 0.4)",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid rgba(51, 65, 85, 0.5)",
        }}
      >
        {typeof content === "string" ? content : JSON.stringify(content, null, 2)}
      </div>
    </div>
  );
}
