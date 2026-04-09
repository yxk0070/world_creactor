export const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "32px",
  },
  headerCard: {
    background: "rgba(30, 41, 59, 0.85)",
    border: "1px solid rgba(71, 85, 105, 0.5)",
    borderRadius: "20px",
    padding: "32px",
    marginBottom: "24px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "8px",
    color: "#f8fafc",
  },
  subtitle: {
    color: "#94a3b8",
    marginBottom: "24px",
  },
  form: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-end" as const,
  },
  textarea: {
    flex: 1,
    padding: "14px 20px",
    border: "2px solid rgba(71, 85, 105, 0.5)",
    borderRadius: "12px",
    background: "rgba(15, 23, 42, 0.8)",
    color: "#f8fafc",
    fontSize: "15px",
    minHeight: "52px",
    maxHeight: "200px",
    resize: "none" as const,
    fontFamily: "inherit",
    wordBreak: "break-word" as const,
    boxSizing: "border-box" as const,
    overflowY: "auto" as const,
    lineHeight: "1.5",
  },
  submitBtn: (isGenerating: boolean) => ({
    padding: "14px 28px",
    height: "52px",
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: isGenerating ? "not-allowed" : "pointer",
    fontWeight: "600",
    fontSize: "15px",
    opacity: isGenerating ? 0.6 : 1,
    whiteSpace: "nowrap" as const,
  }),
  historyContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "24px",
  },
  messageRow: (isUser: boolean) => ({
    display: "flex",
    justifyContent: isUser ? "flex-end" : "flex-start",
    width: "100%",
  }),
  messageBubble: (isUser: boolean) => ({
    maxWidth: isUser ? "80%" : "100%",
    background: isUser
      ? "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)"
      : "rgba(30, 41, 59, 0.85)",
    border: isUser ? "none" : "1px solid rgba(71, 85, 105, 0.5)",
    borderRadius: isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
    padding: "20px 24px",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  }),
  messageHeader: (isUser: boolean) => ({
    fontWeight: "600",
    marginBottom: "12px",
    color: isUser ? "rgba(255, 255, 255, 0.9)" : "#10b981",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  }),
  messageText: (isUser: boolean) => ({
    color: isUser ? "#ffffff" : "#e2e8f0",
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-word" as const,
    lineHeight: "1.6",
  }),
  cardContainer: {
    marginTop: "24px",
  },
  cardList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
  },
  workflowContainer: {
    background: "rgba(30, 41, 59, 0.85)",
    border: "1px solid rgba(71, 85, 105, 0.5)",
    borderRadius: "16px",
    padding: "24px",
    marginTop: "8px",
  },
  workflowTitle: {
    color: "#f8fafc",
    margin: "0 0 16px 0",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  workflowIcon: {
    display: "inline-block",
    animation: "spin 2s linear infinite",
  },
  workflowList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  },
  workflowStep: (status: string) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    background:
      status === "running"
        ? "rgba(99, 102, 241, 0.1)"
        : "rgba(15, 23, 42, 0.6)",
    border:
      status === "running"
        ? "1px solid rgba(99, 102, 241, 0.5)"
        : "1px solid rgba(51, 65, 85, 0.5)",
    borderRadius: "8px",
    color:
      status === "pending"
        ? "#94a3b8"
        : status === "failed"
          ? "#ef4444"
          : "#f8fafc",
    transition: "all 0.3s ease",
  }),
  workflowStepIcon: (status: string) => ({
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    background:
      status === "completed"
        ? "#10b981"
        : status === "running"
          ? "#6366f1"
          : "#334155",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "bold",
    color: "white",
  }),
  workflowStepText: {
    flex: 1,
  },
  workflowStepDesc: {
    fontWeight: "600",
  },
  workflowStepTool: {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "4px",
  },
  workflowStatusText: (status: string) => ({
    fontSize: "12px",
    color:
      status === "running"
        ? "#a5b4fc"
        : status === "completed"
          ? "#6ee7b7"
          : status === "failed"
            ? "#fca5a5"
            : "#64748b",
  }),
};
