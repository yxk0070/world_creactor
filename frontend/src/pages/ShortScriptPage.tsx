import React from "react";
import { useShortScript } from "../hooks/useShortScript";
import { EditableResult } from "../components/EditableResult";
import { ShortScriptRenderer } from "../components/ShortScriptRenderer";
import { styles } from "./ShortScriptPage.styles";
import { useNavigate } from "react-router-dom";

export function ShortScriptPage() {
  const {
    eventDescription,
    setEventDescription,
    context,
    setContext,
    style,
    setStyle,
    isLoading,
    result,
    generateScript,
    storylines,
    selectedStorylineId,
    setSelectedStorylineId,
    availableEvents,
    handleEventSelect,
    streamContent,
    showStream,
  } = useShortScript();
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate(-1)}>
          ← 返回
        </button>
        <h1 style={styles.title}>🎬 短句/分镜脚本生成</h1>
      </div>

      <div style={styles.content}>
        <form onSubmit={generateScript} style={styles.form}>
          <div style={styles.inputSection}>
            <label style={styles.label}>
              从故事线选择（可选）
              <select
                value={selectedStorylineId}
                onChange={(e) => setSelectedStorylineId(e.target.value)}
                style={styles.input}
              >
                <option value="">-- 选择故事线 --</option>
                {storylines.map((story) => (
                  <option key={story.id} value={story.id}>
                    {story.title}
                  </option>
                ))}
              </select>
            </label>

            {selectedStorylineId && availableEvents.length === 0 && (
              <div
                style={{
                  color: "#f59e0b",
                  fontSize: "14px",
                  marginTop: "-8px",
                  marginBottom: "16px",
                  padding: "8px 12px",
                  background: "rgba(245, 158, 11, 0.1)",
                  borderRadius: "6px",
                }}
              >
                ⚠️ 提示：您选择的这条故事线中暂无细节节点。
                <br />
                您可以去【核心故事线】或【历史记录】中点击对应故事卡片里的“✨生成细节”按钮来补充细节。
              </div>
            )}

            {selectedStorylineId && availableEvents.length > 0 && (
              <label style={styles.label}>
                选择细节节点
                <select
                  onChange={handleEventSelect}
                  style={styles.input}
                  defaultValue=""
                >
                  <option value="" disabled>
                    -- 请选择一个故事细节节点 --
                  </option>
                  {availableEvents.map((event, idx) => (
                    <option key={idx} value={event.value}>
                      {event.label}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label style={styles.label}>
              事件/画面描述（必填）
              <textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="例如：男主在暴雨中拔剑，雷光照亮了他决绝的脸庞..."
                rows={4}
                style={styles.textarea}
                required
              />
            </label>

            <label style={styles.label}>
              上下文补充（可选）
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="例如：这是影片的高潮决战，背景音乐应该是激昂的..."
                rows={3}
                style={styles.textarea}
              />
            </label>

            <label style={styles.label}>
              脚本风格
              <input
                list="script-style-options"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="选择或输入脚本风格"
                style={styles.input}
              />
              <datalist id="script-style-options">
                <option value="快节奏分镜">
                  快节奏分镜（短平快，动作戏适用）
                </option>
                <option value="情绪慢镜头">
                  情绪慢镜头（特写多，注重氛围）
                </option>
                <option value="混剪风格">混剪风格（场景快速切换）</option>
                <option value="广告TVC">广告TVC（画面与文案配合）</option>
                <option value="短视频剧本">
                  短视频剧本（包含前置钩子，反转等）
                </option>
              </datalist>
            </label>

            <button type="submit" disabled={isLoading} style={styles.button}>
              {isLoading ? "生成中..." : "生成脚本"}
            </button>
          </div>
        </form>

        {showStream && (
          <div
            style={{
              background: "rgba(30, 41, 59, 0.8)",
              borderRadius: "16px",
              padding: "24px",
              marginTop: "24px",
              border: "1px solid rgba(71, 85, 105, 0.5)",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#f8fafc",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "18px" }}>⏳</span> 生成状态
            </h3>
            <div
              style={{
                padding: "16px",
                background: "rgba(15, 23, 42, 0.6)",
                borderRadius: "12px",
                color: "#cbd5e1",
                fontSize: "14px",
                fontFamily: "monospace",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span
                style={{ color: "#6366f1", animation: "pulse 1.5s infinite" }}
              >
                ●
              </span>
              {streamContent}
            </div>
          </div>
        )}

        {result && (
          <div style={{ marginTop: "24px" }}>
            <EditableResult data={result} defaultTitle="生成的脚本">
              <ShortScriptRenderer data={result} />
            </EditableResult>
          </div>
        )}
      </div>
    </div>
  );
}
