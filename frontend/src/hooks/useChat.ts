import { useState } from "react";
import { useScenario } from "../contexts/ScenarioContext";

export interface WorkflowStep {
  step: number;
  tool: string;
  description: string;
  parameters: any;
  status: "pending" | "running" | "completed" | "failed";
  result?: any;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  data?: any;
}

export function useChat() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [workflowPlan, setWorkflowPlan] = useState<WorkflowStep[]>([]);
  const [workflowStatus, setWorkflowStatus] = useState<string>("");
  const { scenario } = useScenario();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isGenerating) return;

    const userMessage: Message = { role: "user", content: message };
    setChatHistory((prev) => [...prev, userMessage]);
    setIsGenerating(true);
    setWorkflowPlan([]);
    setWorkflowStatus("正在分析任务意图...");

    try {
      const response = await fetch("/api/chat/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, auto_save: true, scenario }),
      });

      if (!response.body) throw new Error("No readable stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      let isFinished = false;

      while (!isFinished) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.substring(6));

              if (data.type === "status") {
                setWorkflowStatus(data.message);
              } else if (data.type === "progress") {
                // 兼容之前 /api/chat/stream 的进度结构
                setWorkflowStatus(data.message);
                setWorkflowPlan((prev) => {
                  if (prev.length === 0) {
                    return Array.from({ length: data.total }).map((_, i) => ({
                      step: i + 1,
                      tool: "未知",
                      description: `步骤 ${i + 1}`,
                      parameters: {},
                      status:
                        i + 1 === data.step
                          ? "running"
                          : i + 1 < data.step
                            ? "completed"
                            : "pending",
                    }));
                  }

                  const newPlan = [...prev];
                  newPlan.forEach((p, i) => {
                    if (i + 1 < data.step) p.status = "completed";
                    else if (i + 1 === data.step) {
                      p.status = "running";
                      p.description = data.message;
                    }
                  });
                  return newPlan;
                });
              } else if (data.type === "plan") {
                setWorkflowPlan(
                  data.plan.map((p: any) => ({ ...p, status: "pending" })),
                );
                setWorkflowStatus("");
              } else if (data.type === "step_start") {
                setWorkflowPlan((prev) => {
                  const newPlan = [...prev];
                  if (newPlan[data.step]) {
                    newPlan[data.step].status = "running";
                    newPlan[data.step].description = data.message.replace(
                      "执行中: ",
                      "",
                    );
                  }
                  return newPlan;
                });
                setWorkflowStatus(data.message);
              } else if (data.type === "chunk") {
                setChatHistory((prev: Message[]) => {
                  const newMsgs = [...prev];
                  const lastMsg = newMsgs[newMsgs.length - 1];
                  if (lastMsg && lastMsg.role === "assistant") {
                    lastMsg.content += data.content;
                  } else {
                    newMsgs.push({ role: "assistant", content: data.content });
                  }
                  return newMsgs;
                });
              } else if (data.type === "step_end") {
                setWorkflowPlan((prev) => {
                  const newPlan = [...prev];
                  if (newPlan[data.step]) {
                    newPlan[data.step].status =
                      data.result?.status === "failed" ? "failed" : "completed";
                    newPlan[data.step].result = data.result;
                  }
                  return newPlan;
                });
              } else if (data.type === "end") {
                isFinished = true;
                const finalData = data.content;
                if (finalData.success) {
                  let parsedData = null;
                  let contentStr =
                    finalData.response || finalData.message || "";

                  try {
                    if (
                      typeof contentStr === "string" &&
                      (contentStr.startsWith("{") || contentStr.startsWith("["))
                    ) {
                      parsedData = JSON.parse(contentStr);
                      contentStr = "✨ 已为您生成对应内容，请查看下方卡片。";
                    } else if (finalData.data) {
                      parsedData = finalData.data;
                      contentStr = "✨ 已为您生成对应内容，请查看下方卡片。";
                    }
                  } catch (e) {
                    // ignore
                  }

                  const assistantMessage: Message = {
                    role: "assistant",
                    content: contentStr,
                    data: parsedData,
                  };
                  setChatHistory((prev) => {
                    const newMsgs = [...prev];
                    const lastMsg = newMsgs[newMsgs.length - 1];
                    if (lastMsg && lastMsg.role === "assistant") {
                      // 替换之前的 chunk 累积内容为最终整理的内容
                      newMsgs[newMsgs.length - 1] = assistantMessage;
                      return newMsgs;
                    }
                    return [...prev, assistantMessage];
                  });
                  setWorkflowPlan([]);
                  setWorkflowStatus("");
                } else {
                  console.error(finalData.error);
                  setWorkflowStatus(`执行失败: ${finalData.error}`);
                  // 不要立即清空计划，让用户看到失败状态
                }
              } else if (data.type === "error") {
                console.error(data.message);
                setWorkflowStatus(`执行失败: ${data.message}`);
                isFinished = true;
              }
            } catch (e) {
              console.error("SSE parse error", e, line);
            }
          }
        }
      }

      // 如果流结束了但还有剩余的 buffer 没处理
      if (buffer && buffer.startsWith("data: ")) {
        try {
          const data = JSON.parse(buffer.substring(6));
          if (data.type === "end") {
            const finalData = data.content;
            if (finalData.success) {
              let parsedData = null;
              let contentStr = finalData.response || finalData.message || "";
              try {
                if (
                  typeof contentStr === "string" &&
                  (contentStr.startsWith("{") || contentStr.startsWith("["))
                ) {
                  parsedData = JSON.parse(contentStr);
                  contentStr = "✨ 已为您生成对应内容，请查看下方卡片。";
                } else if (finalData.data) {
                  parsedData = finalData.data;
                  contentStr = "✨ 已为您生成对应内容，请查看下方卡片。";
                }
              } catch (e) {}
              setChatHistory((prev) => [
                ...prev,
                { role: "assistant", content: contentStr, data: parsedData },
              ]);
              setWorkflowPlan([]);
              setWorkflowStatus("");
            }
          }
        } catch (e) {}
      }
    } catch (error) {
      console.error("请求失败:", error);
    } finally {
      setIsGenerating(false);
      setMessage("");
      setWorkflowPlan([]);
      setWorkflowStatus("");
    }
  };

  return {
    message,
    setMessage,
    chatHistory,
    isGenerating,
    handleSubmit,
    workflowPlan,
    workflowStatus,
    scenario,
  };
}
