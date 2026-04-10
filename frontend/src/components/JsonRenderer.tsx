import React from "react";

interface JsonRendererProps {
  data: any;
}

export function JsonRenderer({ data }: JsonRendererProps) {
  if (data === null || data === undefined) {
    return <div style={{ color: "#64748b" }}>无数据</div>;
  }

  console.log("yxk Json");

  const renderValue = (value: any, key: string | number | null, depth = 0) => {
    const indent = depth * 20;
    const keyStyle = {
      marginLeft: `${indent}px`,
      display: "block",
      padding: "4px 0",
    };

    if (value === null) {
      return (
        <div key={key} style={keyStyle}>
          {key && (
            <span style={{ color: "#7dd3fc", marginRight: "8px" }}>{key}:</span>
          )}
          <span style={{ color: "#f472b6" }}>null</span>
        </div>
      );
    }

    if (typeof value === "boolean") {
      return (
        <div key={key} style={keyStyle}>
          {key && (
            <span style={{ color: "#7dd3fc", marginRight: "8px" }}>{key}:</span>
          )}
          <span style={{ color: "#f472b6" }}>{value.toString()}</span>
        </div>
      );
    }

    if (typeof value === "number") {
      return (
        <div key={key} style={keyStyle}>
          {key && (
            <span style={{ color: "#7dd3fc", marginRight: "8px" }}>{key}:</span>
          )}
          <span style={{ color: "#a78bfa" }}>{value}</span>
        </div>
      );
    }

    if (typeof value === "string") {
      return (
        <div key={key} style={keyStyle}>
          {key && (
            <span style={{ color: "#7dd3fc", marginRight: "8px" }}>{key}:</span>
          )}
          <span style={{ color: "#a3e635" }}>"{value}"</span>
        </div>
      );
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return (
          <div key={key} style={keyStyle}>
            {key && (
              <span style={{ color: "#7dd3fc", marginRight: "8px" }}>
                {key}:
              </span>
            )}
            <span style={{ color: "var(--text-muted)" }}>[]</span>
          </div>
        );
      }
      return (
        <div key={key}>
          <div style={{ marginLeft: `${indent}px`, padding: "4px 0" }}>
            {key && (
              <span style={{ color: "#7dd3fc", marginRight: "8px" }}>
                {key}:
              </span>
            )}
            <span style={{ color: "var(--text-muted)" }}>[</span>
          </div>
          {value.map((item, index) => renderValue(item, index, depth + 1))}
          <div style={{ marginLeft: `${indent}px`, padding: "4px 0" }}>
            <span style={{ color: "var(--text-muted)" }}>]</span>
          </div>
        </div>
      );
    }

    if (typeof value === "object") {
      const keys = Object.keys(value);
      if (keys.length === 0) {
        return (
          <div key={key} style={keyStyle}>
            {key && (
              <span style={{ color: "#7dd3fc", marginRight: "8px" }}>
                {key}:
              </span>
            )}
            <span style={{ color: "var(--text-muted)" }}>{"{}"}</span>
          </div>
        );
      }
      return (
        <div key={key}>
          <div style={{ marginLeft: `${indent}px`, padding: "4px 0" }}>
            {key && (
              <span style={{ color: "#7dd3fc", marginRight: "8px" }}>
                {key}:
              </span>
            )}
            <span style={{ color: "var(--text-muted)" }}>{"{"}</span>
          </div>
          {keys.map((k) => renderValue(value[k], k, depth + 1))}
          <div style={{ marginLeft: `${indent}px`, padding: "4px 0" }}>
            <span style={{ color: "var(--text-muted)" }}>{"}"}</span>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      style={{
        fontFamily: "monospace",
        fontSize: "13px",
        lineHeight: "1.6",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {renderValue(data, null, 0)}
    </div>
  );
}
