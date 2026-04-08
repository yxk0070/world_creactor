import React, { useState, useEffect } from "react";
import { useTasks, Task } from "../contexts/TaskContext";

// 动态文案列表
const LOADING_MESSAGES = [
  "正在深入思考...",
  "正在构思细节...",
  "努力码字中...",
  "查阅世界设定...",
  "编织因果逻辑...",
];

// 单个任务的卡片组件，负责自己的动态文案轮播
function TaskCard({ task }: { task: Task }) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (task.status !== "running") return;

    // 每 2.5 秒切换一次文案
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [task.status]);

  // 如果状态是运行中，优先显示动态文案，否则显示原本传进来的 message
  const displayMessage =
    task.status === "running" ? LOADING_MESSAGES[msgIndex] : task.message;

  return (
    <div
      style={{
        ...styles.taskCard,
        borderColor:
          task.status === "running"
            ? "rgba(99, 102, 241, 0.5)"
            : task.status === "completed"
            ? "rgba(16, 185, 129, 0.5)"
            : "rgba(239, 68, 68, 0.5)",
        // 添加动态渐变背景
        background:
          task.status === "running"
            ? "linear-gradient(90deg, rgba(30,41,59,0.95) 0%, rgba(45,61,90,0.95) 50%, rgba(30,41,59,0.95) 100%)"
            : task.status === "completed"
            ? "rgba(6, 78, 59, 0.95)"
            : "rgba(127, 29, 29, 0.95)",
        backgroundSize: task.status === "running" ? "200% 100%" : "auto",
        animation:
          task.status === "running"
            ? "waveBackground 2s ease-in-out infinite"
            : "none",
      }}
    >
      <div style={styles.taskHeader}>
        <span
          style={{
            ...styles.taskIcon,
            display: "inline-block",
            // 取消了原来的旋转动画
            animation: "none",
            transformOrigin: "center center",
          }}
        >
          {task.status === "running" && "⏳"}
          {task.status === "completed" && "✅"}
          {task.status === "error" && "❌"}
        </span>
        <span style={styles.taskTitle}>{task.title}</span>
      </div>
      {displayMessage && (
        <div style={styles.taskMessage}>
          {displayMessage}
          {task.status === "running" && <span style={styles.dots}>...</span>}
        </div>
      )}
    </div>
  );
}

export function TaskSidebar() {
  const { tasks } = useTasks();

  if (tasks.length === 0) return null;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>
        正在进行的任务 ({tasks.filter((t) => t.status === "running").length})
      </h3>
      <div style={styles.taskList}>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

const styles = {
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
