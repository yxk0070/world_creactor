import { useChat } from "../hooks/useChat";
import { useRef, useEffect } from "react";

export function MainPage() {
  const { message, setMessage, chatHistory, isGenerating, handleSubmit } =
    useChat();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整 textarea 高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [message]);

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "32px",
      }}
    >
      <div
        style={{
          background: "rgba(30, 41, 59, 0.85)",
          border: "1px solid rgba(71, 85, 105, 0.5)",
          borderRadius: "20px",
          padding: "32px",
          marginBottom: "24px",
        }}
      >
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "8px",
            color: "#f8fafc",
          }}
        >
          💬 智能 Agent 对话
        </h1>
        <p style={{ color: "#94a3b8", marginBottom: "24px" }}>
          输入你的需求，让 AI 帮你生成世界观、人物、故事等
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "12px" }}>
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
            placeholder="例如：帮我生成一个奇幻世界... (Shift+Enter 换行，Enter 发送)"
            disabled={isGenerating}
            style={{
              flex: 1,
              padding: "14px 20px",
              border: "2px solid rgba(71, 85, 105, 0.5)",
              borderRadius: "12px",
              background: "rgba(15, 23, 42, 0.8)",
              color: "#f8fafc",
              fontSize: "15px",
              minHeight: "48px",
              maxHeight: "200px",
              resize: "vertical",
              fontFamily: "inherit",
              wordBreak: "break-word",
            }}
          />
          <button
            type="submit"
            disabled={isGenerating}
            style={{
              padding: "14px 28px",
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: isGenerating ? "not-allowed" : "pointer",
              fontWeight: "600",
              fontSize: "15px",
              opacity: isGenerating ? 0.6 : 1,
            }}
          >
            {isGenerating ? "生成中..." : "发送"}
          </button>
        </form>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {chatHistory.map((msg, idx) => (
          <div
            key={idx}
            style={{
              background:
                msg.role === "user"
                  ? "rgba(99, 102, 241, 0.2)"
                  : "rgba(30, 41, 59, 0.85)",
              border: "1px solid rgba(71, 85, 105, 0.5)",
              borderRadius: "16px",
              padding: "20px 24px",
            }}
          >
            <div
              style={{
                fontWeight: "600",
                marginBottom: "12px",
                color: msg.role === "user" ? "#a78bfa" : "#10b981",
              }}
            >
              {msg.role === "user" ? "👤 你" : "🤖 AI"}
            </div>
            <div
              style={{
                color: "#e2e8f0",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {msg.content}
            </div>
            {msg.data && (
              <div style={{ marginTop: "16px" }}>
                <details>
                  <summary style={{ color: "#94a3b8", cursor: "pointer" }}>
                    查看详细数据
                  </summary>
                  <pre
                    style={{
                      marginTop: "12px",
                      padding: "16px",
                      background: "rgba(15, 23, 42, 0.6)",
                      borderRadius: "8px",
                      fontSize: "13px",
                      color: "#94a3b8",
                      overflowX: "auto",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {JSON.stringify(msg.data, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
