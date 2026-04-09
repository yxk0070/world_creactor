export const styles = {
  container: {
    position: "fixed" as const,
    right: "24px",
    top: "100px",
    width: "300px",
    maxHeight: "calc(100vh - 120px)",
    overflowY: "auto" as const,
    zIndex: 1000,
    background: "rgba(15, 23, 42, 0.85)",
    backdropFilter: "blur(12px)",
    borderRadius: "16px",
    border: "1px solid rgba(71, 85, 105, 0.5)",
    padding: "16px",
    boxShadow:
      "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#cbd5e1",
    margin: "0 0 16px 0",
    paddingBottom: "12px",
    borderBottom: "1px solid rgba(71, 85, 105, 0.5)",
  },
  taskList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  },
  taskCard: {
    padding: "12px",
    borderRadius: "10px",
    borderLeft: "4px solid",
    transition: "all 0.3s ease",
  },
  taskHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "4px",
  },
  taskIcon: {
    fontSize: "14px",
    animation: "spin 2s linear infinite",
  },
  taskTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#f8fafc",
  },
  taskMessage: {
    fontSize: "12px",
    color: "#94a3b8",
    paddingLeft: "22px",
  },
  dots: {
    display: "inline-block",
    width: "12px",
    textAlign: "left" as const,
  },
};
