import React from "react";

interface DialogueRendererProps {
  data: any;
}

export function DialogueRenderer({ data }: DialogueRendererProps) {
  let dialogueData = data;
  
  if (dialogueData?.success && dialogueData?.response) {
    try {
      const parsedResponse = JSON.parse(dialogueData.response);
      dialogueData = parsedResponse;
    } catch (e) {
      dialogueData = dialogueData.response;
    }
  }

  // 递归解包数据
  while (true) {
    if (Array.isArray(dialogueData) && dialogueData.length > 0) {
      dialogueData = dialogueData[0];
    } else if (dialogueData && dialogueData.data) {
      dialogueData = dialogueData.data;
    } else {
      break;
    }
  }
  
  const content = dialogueData?.content || dialogueData?.dialogue || (typeof dialogueData === "string" ? dialogueData : JSON.stringify(dialogueData, null, 2));

  // 简单的文案解析器
  const parseDialogue = (text: string) => {
    return text.split("\n").map((line, index) => {
      line = line.trim();
      if (!line) return null;

      // 场景或括号说明：【场景...】或 [场景...]
      if (line.match(/^【.*】$/) || line.match(/^\[.*\]$/)) {
        return { id: index, type: "scene", text: line };
      }

      // 角色对话：角色名（动作）：对话内容
      const match = line.match(/^([^(（:：]+)(?:[(（](.*?)[)）])?[：:]([\s\S]*)$/);
      if (match) {
        return {
          id: index,
          type: "dialogue",
          character: match[1].trim(),
          action: match[2] ? match[2].trim() : null,
          dialogue: match[3].trim(),
        };
      }

      // 其他动作或旁白
      return { id: index, type: "action", text: line };
    }).filter(Boolean);
  };

  const parsedLines = typeof content === "string" ? parseDialogue(content) : [];

  // 获取一些颜色映射给角色名
  const getColorForCharacter = (name: string) => {
    const colors = ["#60a5fa", "#34d399", "#f472b6", "#fbbf24", "#c084fc", "#38bdf8", "#fb923c"];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div
      style={{
        background: "var(--bg-glass)",
        borderRadius: "16px",
        padding: "24px",
        border: "1px solid var(--border-light)",
      }}
    >
      <h3
        style={{
          margin: "0 0 20px 0",
          color: "var(--text-primary)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "18px"
        }}
      >
        <span style={{ fontSize: "24px" }}>💬</span> 对话文案
      </h3>
      
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          background: "var(--bg-card)",
          padding: "24px",
          borderRadius: "12px",
          border: "1px solid var(--border-dark)",
        }}
      >
        {parsedLines.length > 0 ? (
          parsedLines.map((line: any) => {
            if (line.type === "scene") {
              return (
                <div key={line.id} style={{ 
                  textAlign: "center", 
                  margin: "12px 0",
                  color: "var(--text-muted)",
                  fontSize: "14px",
                  fontWeight: 600,
                  background: "rgba(0,0,0,0.2)",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  display: "inline-block",
                  alignSelf: "center"
                }}>
                  {line.text}
                </div>
              );
            }
            if (line.type === "dialogue") {
              const charColor = getColorForCharacter(line.character);
              return (
                <div key={line.id} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                    <span style={{ fontWeight: "bold", fontSize: "16px", color: charColor }}>
                      {line.character}
                    </span>
                    {line.action && (
                      <span style={{ color: "#64748b", fontSize: "14px", fontStyle: "italic" }}>
                        ({line.action})
                      </span>
                    )}
                  </div>
                  <div style={{ 
                    color: "var(--text-secondary)", 
                    fontSize: "15px", 
                    lineHeight: "1.6",
                    background: "rgba(255,255,255,0.03)",
                    padding: "12px 16px",
                    borderRadius: "0 12px 12px 12px",
                    borderLeft: `3px solid ${charColor}`
                  }}>
                    {line.dialogue}
                  </div>
                </div>
              );
            }
            return (
              <div key={line.id} style={{ color: "var(--text-tertiary)", fontSize: "15px", lineHeight: "1.6", fontStyle: "italic", paddingLeft: "16px" }}>
                {line.text}
              </div>
            );
          })
        ) : (
          <div style={{ color: "var(--text-secondary)", whiteSpace: "pre-wrap", lineHeight: "1.8" }}>
            {typeof content === "string" ? content : JSON.stringify(content, null, 2)}
          </div>
        )}
      </div>
    </div>
  );
}
