import { useLocation, useNavigate } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { CachePage } from "./pages/CachePage";
import { WorldviewPage } from "./pages/WorldviewPage";
import { CharactersPage } from "./pages/CharactersPage";
import { CharacterNetworkPage } from "./pages/CharacterNetworkPage";
import { CoreStorylinePage } from "./pages/CoreStorylinePage";
import { ArticlePage } from "./pages/ArticlePage";
import { TimelineAnalysisPage } from "./pages/TimelineAnalysisPage";
import { WorldviewAnalysisPage } from "./pages/WorldviewAnalysisPage";
import { NavLink } from "./components/NavLink";
import { Dropdown } from "./components/Dropdown";
import { useChat } from "./hooks/useChat";
import { WorldviewRenderer } from "./components/WorldviewRenderer";
import { CharacterRenderer } from "./components/CharacterRenderer";
import { TaskSidebar } from "./components/TaskSidebar";

interface NavItem {
  to: string;
  icon: string;
  label: string;
}

export function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const creationItems: NavItem[] = [
    { to: "/worldview", icon: "🌍", label: "世界观" },
    { to: "/characters", icon: "👤", label: "人物" },
    { to: "/character-network", icon: "🔗", label: "关系网" },
    { to: "/core-storyline", icon: "📜", label: "故事线" },
    { to: "/article", icon: "✍️", label: "事件文章" },
  ];

  const analysisItems: NavItem[] = [
    { to: "/timeline-analysis", icon: "⏰", label: "故事线分析" },
    { to: "/worldview-analysis", icon: "🔍", label: "世界观分析" },
  ];

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          <div
            style={styles.logo}
            onClick={() => navigate("/")}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            ✨ 点创世界
          </div>
          <Dropdown
            label="✍️ 创作"
            items={creationItems}
            activePath={location.pathname}
          />
          <Dropdown
            label="🔍 理解"
            items={analysisItems}
            activePath={location.pathname}
          />
          <NavLink to="/cache">📦 历史记录</NavLink>
        </div>
      </nav>

      <TaskSidebar />

      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/worldview" element={<WorldviewPage />} />
        <Route path="/characters" element={<CharactersPage />} />
        <Route path="/character-network" element={<CharacterNetworkPage />} />
        <Route path="/core-storyline" element={<CoreStorylinePage />} />
        <Route path="/article" element={<ArticlePage />} />
        <Route path="/timeline-analysis" element={<TimelineAnalysisPage />} />
        <Route path="/worldview-analysis" element={<WorldviewAnalysisPage />} />
        <Route path="/cache" element={<CachePage />} />
      </Routes>
    </div>
  );
}

function MainPage() {
  const { message, setMessage, chatHistory, isGenerating, handleSubmit } =
    useChat();

  const checkWorldviewData = (data: any): boolean => {
    if (!data) return false;

    if (data.success && data.response) {
      try {
        const parsedResponse = JSON.parse(data.response);
        if (
          parsedResponse.tool === "generate_worldview" ||
          parsedResponse.tool === "analyze_worldview"
        ) {
          return true;
        }
      } catch (e) {
        console.log("解析response检查失败:", e);
      }
    }

    return !!(
      data.data?.world_name ||
      data.data?.basic_settings ||
      data.tool === "generate_worldview" ||
      data.tool === "analyze_worldview" ||
      data.data?.tool === "generate_worldview" ||
      data.data?.tool === "analyze_worldview"
    );
  };

  const checkCharacter = (data: any): boolean => {
    if (!data) return false;

    if (data.success && data.response) {
      try {
        const parsedResponse = JSON.parse(data.response);
        if (
          parsedResponse.tool === "generate_character" ||
          parsedResponse.tool === "generate_related_character"
        ) {
          return true;
        }
      } catch (e) {
        console.log("解析response检查失败:", e);
      }
    }

    return !!(
      data.data?.name ||
      data.tool === "generate_character" ||
      data.tool === "generate_related_character" ||
      data.data?.tool === "generate_character" ||
      data.data?.tool === "generate_related_character"
    );
  };

  return (
    <div style={styles.mainPage}>
      <div style={styles.chatSection}>
        <h1 style={styles.chatTitle}>💬 智能 Agent 对话</h1>
        <p style={styles.chatSubtitle}>
          输入你的需求，让 AI 帮你生成世界观、人物、故事等
        </p>

        <form onSubmit={handleSubmit} style={styles.inputForm}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="例如：帮我生成一个奇幻世界..."
            disabled={isGenerating}
            style={styles.input}
          />
          <button
            type="submit"
            disabled={isGenerating}
            style={styles.submitButton}
          >
            {isGenerating ? "生成中..." : "发送"}
          </button>
        </form>
      </div>

      <div style={styles.historySection}>
        {chatHistory.map((msg, idx) => (
          <div
            key={idx}
            style={{
              ...styles.message,
              background:
                msg.role === "user"
                  ? "rgba(99, 102, 241, 0.2)"
                  : "rgba(30, 41, 59, 0.85)",
            }}
          >
            <div
              style={{
                ...styles.messageRole,
                color: msg.role === "user" ? "#a78bfa" : "#10b981",
              }}
            >
              {msg.role === "user" ? "👤 你" : "🤖 AI"}
            </div>
            <div style={styles.messageContent}>{msg.content}</div>
            {msg.data && (
              <div style={styles.dataSection}>
                <details>
                  <summary style={styles.summary}>查看详细数据</summary>
                  <div style={styles.dataContent}>
                    {checkWorldviewData(msg.data) ? (
                      <WorldviewRenderer data={msg.data} />
                    ) : checkCharacter(msg.data) ? (
                      <CharacterRenderer data={msg.data} />
                    ) : (
                      <pre style={styles.rawData}>
                        {JSON.stringify(msg.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </details>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
  },
  nav: {
    background: "rgba(30, 41, 59, 0.95)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(71, 85, 105, 0.5)",
    padding: "0 32px",
    position: "sticky" as const,
    top: 0,
    zIndex: 99999,
  },
  navContent: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "16px 0",
    flexWrap: "wrap" as const,
  },
  logo: {
    fontSize: "24px",
    marginRight: "24px",
    fontWeight: "700",
    color: "#f8fafc",
    cursor: "pointer",
    transition: "transform 0.2s ease",
  },
  mainPage: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "32px",
  },
  chatSection: {
    background: "rgba(30, 41, 59, 0.85)",
    border: "1px solid rgba(71, 85, 105, 0.5)",
    borderRadius: "20px",
    padding: "32px",
    marginBottom: "24px",
  },
  chatTitle: {
    fontSize: "28px",
    fontWeight: "700",
    marginBottom: "8px",
    color: "#f8fafc",
    margin: 0,
  },
  chatSubtitle: {
    color: "#94a3b8",
    marginBottom: "24px",
  },
  inputForm: {
    display: "flex",
    gap: "12px",
  },
  input: {
    flex: 1,
    padding: "14px 20px",
    border: "2px solid rgba(71, 85, 105, 0.5)",
    borderRadius: "12px",
    background: "rgba(15, 23, 42, 0.8)",
    color: "#f8fafc",
    fontSize: "15px",
    boxSizing: "border-box" as const,
  },
  submitButton: {
    padding: "14px 28px",
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "15px",
  },
  historySection: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
  },
  message: {
    border: "1px solid rgba(71, 85, 105, 0.5)",
    borderRadius: "16px",
    padding: "20px 24px",
  },
  messageRole: {
    fontWeight: "600",
    marginBottom: "12px",
  },
  messageContent: {
    color: "#e2e8f0",
    whiteSpace: "pre-wrap" as const,
  },
  dataSection: {
    marginTop: "16px",
  },
  summary: {
    color: "#94a3b8",
    cursor: "pointer",
  },
  dataContent: {
    marginTop: "12px",
  },
  rawData: {
    padding: "16px",
    background: "rgba(15, 23, 42, 0.6)",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#94a3b8",
    overflow: "auto" as const,
    margin: 0,
  },
};
