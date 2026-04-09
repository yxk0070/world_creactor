import React from "react";
import { useDialogue } from "../hooks/useDialogue";
import { EditableResult } from "../components/EditableResult";
import { DialogueRenderer } from "../components/DialogueRenderer";
import { styles } from "./DialoguePage.styles";
import { useNavigate } from "react-router-dom";

export function DialoguePage() {
  const {
    eventDescription,
    setEventDescription,
    characters,
    setCharacters,
    context,
    setContext,
    style,
    setStyle,
    isLoading,
    result,
    generateDialogue,
    storylines,
    selectedStorylineId,
    setSelectedStorylineId,
    availableEvents,
    handleEventSelect,
    streamContent,
    showStream,
  } = useDialogue();
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate(-1)}>
          ← 返回
        </button>
        <h1 style={styles.title}>💬 对话文案生成</h1>
      </div>

      <div style={styles.content}>
        <form onSubmit={generateDialogue} style={styles.form}>
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
              事件描述（必填）
              <textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="例如：张三和李四在酒馆里讨论即将到来的战争..."
                rows={4}
                style={styles.textarea}
                required
              />
            </label>

            <label style={styles.label}>
              参与人物
              <input
                type="text"
                value={characters}
                onChange={(e) => setCharacters(e.target.value)}
                placeholder="例如：张三（酒馆老板），李四（神秘剑客）"
                style={styles.input}
              />
            </label>

            <label style={styles.label}>
              上下文补充（可选）
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="例如：战争即将爆发，两人都在掩饰自己真实的身份..."
                rows={3}
                style={styles.textarea}
              />
            </label>

            <label style={styles.label}>
              对话风格
              <input
                list="dialogue-style-options"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="选择或输入对话风格"
                style={styles.input}
              />
              <datalist id="dialogue-style-options">
                <option value="日常交谈">日常交谈（轻松自然）</option>
                <option value="激烈争吵">激烈争吵（情绪爆发，矛盾激化）</option>
                <option value="暗流涌动">
                  暗流涌动（话里有话，潜台词丰富）
                </option>
                <option value="幽默吐槽">幽默吐槽（喜剧风格，抛梗接梗）</option>
                <option value="古风对白">
                  古风对白（半文半白，武侠仙侠适用）
                </option>
                <option value="翻译腔">
                  翻译腔（译制片风格，"哦，我的老天"）
                </option>
                <option value="冰冷交锋">
                  冰冷交锋（克制、冷漠、压迫感强）
                </option>
                <option value="生离死别">
                  生离死别（极度悲伤，语无伦次，情感宣泄）
                </option>
                <option value="二次元">
                  二次元（轻小说风格，颜文字/内心OS丰富）
                </option>
                <option value="学术研讨">
                  学术研讨（专业严谨，术语较多，理性客观）
                </option>
                <option value="审讯逼问">
                  审讯逼问（一攻一守，心理博弈，步步紧逼）
                </option>
                <option value="绿茶白莲">
                  绿茶白莲（阴阳怪气，表面示弱，实则挑衅）
                </option>
              </datalist>
            </label>

            <button type="submit" disabled={isLoading} style={styles.button}>
              {isLoading ? "生成中..." : "生成对话"}
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
            <EditableResult data={result} defaultTitle="生成的对话文案">
              <DialogueRenderer data={result} />
            </EditableResult>
          </div>
        )}
      </div>
    </div>
  );
}
