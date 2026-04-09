import React from "react";

interface ShortScriptRendererProps {
  data: any;
}

export function ShortScriptRenderer({ data }: ShortScriptRendererProps) {
  let scriptData = data;
  if (data?.data && (data.data.script || data.data.content)) {
    scriptData = data.data;
  }
  
  const content = scriptData.content || scriptData.script || (typeof scriptData === "string" ? scriptData : JSON.stringify(scriptData, null, 2));

  // 简单的分镜脚本解析器
  const parseScript = (text: string) => {
    return text.split("\n").map((line, index) => {
      line = line.trim();
      if (!line) return null;

      // 匹配场景、镜头信息：【镜头1】 [特写] 等
      if (line.match(/^【.*】$/) || line.match(/^\[.*\]$/)) {
        return { id: index, type: "shot", text: line };
      }

      // 匹配包含冒号的格式说明（如：视觉：xxx / 听觉：xxx / 旁白：xxx）
      const match = line.match(/^([^:：]{2,6})[：:]([\s\S]*)$/);
      if (match) {
        return {
          id: index,
          type: "property",
          key: match[1].trim(),
          value: match[2].trim()
        };
      }

      // 否则作为普通动作描述
      return { id: index, type: "action", text: line };
    }).filter(Boolean);
  };

  const parsedLines = typeof content === "string" ? parseScript(content) : [];

  const getPropertyColor = (key: string) => {
    if (key.includes("视觉") || key.includes("画面") || key.includes("特写")) return "#60a5fa"; // 蓝色
    if (key.includes("听觉") || key.includes("音效") || key.includes("音乐")) return "#34d399"; // 绿色
    if (key.includes("旁白") || key.includes("字幕")) return "#f472b6"; // 粉色
    if (key.includes("动作")) return "#fbbf24"; // 黄色
    return "#a78bfa"; // 默认紫色
  };

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
          margin: "0 0 20px 0",
          color: "#f8fafc",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "18px"
        }}
      >
        <span style={{ fontSize: "24px" }}>🎬</span> 分镜脚本
      </h3>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {parsedLines.length > 0 ? (
          parsedLines.map((line: any) => {
            if (line.type === "shot") {
              return (
                <div key={line.id} style={{
                  marginTop: "16px",
                  padding: "10px 16px",
                  background: "linear-gradient(90deg, rgba(99, 102, 241, 0.2) 0%, rgba(15, 23, 42, 0) 100%)",
                  borderLeft: "4px solid #6366f1",
                  borderRadius: "0 8px 8px 0",
                  color: "#f8fafc",
                  fontWeight: "bold",
                  fontSize: "16px",
                  letterSpacing: "1px"
                }}>
                  {line.text}
                </div>
              );
            }
            if (line.type === "property") {
              const propColor = getPropertyColor(line.key);
              return (
                <div key={line.id} style={{ 
                  display: "flex", 
                  alignItems: "flex-start",
                  gap: "12px",
                  background: "rgba(30, 41, 59, 0.4)",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid rgba(51, 65, 85, 0.5)"
                }}>
                  <div style={{
                    minWidth: "60px",
                    color: propColor,
                    fontWeight: 600,
                    fontSize: "14px",
                    background: `${propColor}15`,
                    padding: "4px 8px",
                    borderRadius: "4px",
                    textAlign: "center"
                  }}>
                    {line.key}
                  </div>
                  <div style={{
                    color: "#e2e8f0",
                    fontSize: "15px",
                    lineHeight: "1.6",
                    flex: 1
                  }}>
                    {line.value}
                  </div>
                </div>
              );
            }
            return (
              <div key={line.id} style={{ 
                color: "#94a3b8", 
                fontSize: "15px", 
                lineHeight: "1.6",
                padding: "0 16px"
              }}>
                {line.text}
              </div>
            );
          })
        ) : (
          <div style={{ 
            color: "#e2e8f0", 
            whiteSpace: "pre-wrap", 
            lineHeight: "1.8",
            background: "rgba(30, 41, 59, 0.4)",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid rgba(51, 65, 85, 0.5)"
          }}>
            {typeof content === "string" ? content : JSON.stringify(content, null, 2)}
          </div>
        )}
      </div>
    </div>
  );
}
