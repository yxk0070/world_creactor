import { useChat } from "../hooks/useChat";
import { useRef, useEffect } from "react";
import { WorldviewRenderer } from "../components/WorldviewRenderer";
import { CharacterRenderer } from "../components/CharacterRenderer";
import { StorylineRenderer } from "../components/StorylineRenderer";
import { ArticleRenderer } from "../components/ArticleRenderer";
import { DialogueRenderer } from "../components/DialogueRenderer";
import { ShortScriptRenderer } from "../components/ShortScriptRenderer";
import { CharacterNetworkRenderer } from "../components/CharacterNetworkRenderer";
import { RelatedCharacterRenderer } from "../components/RelatedCharacterRenderer";
import { JsonRenderer } from "../components/JsonRenderer";
import { EditableResult } from "../components/EditableResult";
import { styles } from "./MainPage.styles";

function ToolCardRenderer({ item }: { item: any }) {
  if (!item) return null;

  // 1. 如果有明确的 tool 字段，走原本的精确匹配
  if (item.tool) {
    switch (item.tool) {
      case "analyze_worldview":
      case "generate_worldview":
        return <WorldviewRenderer data={item} />;
      case "generate_character":
        return <CharacterRenderer data={item} />;
      case "generate_related_character":
        return <RelatedCharacterRenderer data={item.data || item} />;
      case "generate_character_network":
        return <CharacterNetworkRenderer data={item.data || item} />;
      case "generate_story":
        return <StorylineRenderer data={item} />;
      case "extract_timeline": {
        const events = item.data?.key_events || item.data?.events || [];
        return (
          <StorylineRenderer
            data={{
              title: item.data?.title || "故事线分析",
              core_theme: item.data?.core_theme || "时间线提取",
              story_scale: item.data?.story_scale,
              genre: item.data?.genre,
              key_events: events,
              id: item.id || item.cache_id,
            }}
          />
        );
      }
      case "generate_article_from_event":
        return <ArticleRenderer data={item} />;
      case "generate_dialogue":
        return <DialogueRenderer data={item} />;
      case "generate_short_script":
        return <ShortScriptRenderer data={item} />;
      default:
        break;
    }
  }

  // 2. 如果没有 tool 字段，根据 JSON 结构特征智能推断渲染器
  const targetData = item.data || item;

  // 提供一个通用的安全递归解包函数，用来做类型推断
  let testData = targetData;
  while (true) {
    if (Array.isArray(testData) && testData.length > 0) {
      testData = testData[0];
    } else if (testData && testData.data) {
      testData = testData.data;
    } else {
      break;
    }
  }

  if (
    testData &&
    (testData.key_events || testData.title) &&
    !testData.characters &&
    !testData.content
  ) {
    return (
      <StorylineRenderer
        data={{ data: targetData, id: item.id || item.cache_id }}
      />
    );
  } else if (testData && testData.world_name && !testData.characters) {
    return <WorldviewRenderer data={{ data: targetData }} />;
  } else if (
    testData &&
    testData.name &&
    !testData.characters &&
    !testData.content
  ) {
    return <CharacterRenderer data={{ data: targetData }} />;
  } else if (testData && testData.characters && testData.network_summary) {
    return <CharacterNetworkRenderer data={targetData} />;
  } else if (testData && testData.dialogue) {
    return <DialogueRenderer data={{ data: targetData }} />;
  } else if (testData && testData.script) {
    return <ShortScriptRenderer data={{ data: targetData }} />;
  } else if (
    testData &&
    testData.content &&
    (testData.title || testData.event_description)
  ) {
    return <ArticleRenderer data={{ data: targetData }} />;
  }

  // 3. Fallback 为更美观的 JsonRenderer
  return <JsonRenderer data={item} />;
}

export function MainPage() {
  const {
    message,
    setMessage,
    chatHistory,
    isGenerating,
    handleSubmit,
    workflowPlan,
    workflowStatus,
  } = useChat();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整 textarea 高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "52px"; // 先重置回初始高度
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [message]);

  return (
    <div style={styles.container}>
      <div style={styles.headerCard}>
        <h1 style={styles.title}>💬 点创世界</h1>
        <p style={styles.subtitle}>
          输入你的需求，让 AI 帮你生成世界观、人物、故事等
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
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
            rows={1}
            style={styles.textarea}
          />
          <button
            type="submit"
            disabled={isGenerating}
            style={styles.submitBtn(isGenerating)}
          >
            {isGenerating ? "生成中..." : "发送"}
          </button>
        </form>
      </div>

      <div style={styles.historyContainer}>
        {chatHistory.map((msg, idx) => {
          const isUser = msg.role === "user";
          return (
            <div key={idx} style={styles.messageRow(isUser)}>
              <div style={styles.messageBubble(isUser)}>
                <div style={styles.messageHeader(isUser)}>
                  {isUser ? (
                    <>
                      <span>👤 你</span>
                    </>
                  ) : (
                    <>
                      <span>🤖 世界架构师</span>
                    </>
                  )}
                </div>
                <div style={styles.messageText(isUser)}>{msg.content}</div>
                {msg.data && (
                  <div style={styles.cardContainer}>
                    <EditableResult data={msg.data} defaultTitle="生成结果">
                      {Array.isArray(msg.data) ? (
                        <div style={styles.cardList}>
                          {msg.data.map((item: any, i: number) => (
                            <ToolCardRenderer key={i} item={item} />
                          ))}
                        </div>
                      ) : (
                        <div>
                          <ToolCardRenderer item={msg.data} />
                        </div>
                      )}
                    </EditableResult>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* 工作流展示区域移至聊天记录底部 */}
        {isGenerating && (workflowStatus || workflowPlan.length > 0) && (
          <div style={styles.workflowContainer}>
            <h3 style={styles.workflowTitle}>
              <span style={styles.workflowIcon}>⚙️</span>
              {workflowStatus || "任务执行中..."}
            </h3>

            {workflowPlan.length > 0 && (
              <div style={styles.workflowList}>
                {workflowPlan.map((step, idx) => (
                  <div key={idx} style={styles.workflowStep(step.status)}>
                    <div style={styles.workflowStepIcon(step.status)}>
                      {step.status === "completed" ? "✓" : idx + 1}
                    </div>
                    <div style={styles.workflowStepText}>
                      <div style={styles.workflowStepDesc}>
                        {step.description}
                      </div>
                      <div style={styles.workflowStepTool}>
                        工具: {step.tool}
                      </div>
                    </div>
                    <div>
                      <span style={styles.workflowStatusText(step.status)}>
                        {step.status === "running" && "执行中..."}
                        {step.status === "completed" && "已完成"}
                        {step.status === "failed" && "失败"}
                        {step.status === "pending" && "等待中"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
