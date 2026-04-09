import { useLocation, useNavigate } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import { CachePage } from "./pages/CachePage";
import { WorldviewPage } from "./pages/WorldviewPage";
import { CharactersPage } from "./pages/CharactersPage";
import { CharacterNetworkPage } from "./pages/CharacterNetworkPage";
import { CoreStorylinePage } from "./pages/CoreStorylinePage";
import { ArticlePage } from "./pages/ArticlePage";
import { DialoguePage } from "./pages/DialoguePage";
import { ShortScriptPage } from "./pages/ShortScriptPage";
import { TimelineAnalysisPage } from "./pages/TimelineAnalysisPage";
import { WorldviewAnalysisPage } from "./pages/WorldviewAnalysisPage";
import { MainPage } from "./pages/MainPage";
import { NavLink } from "./components/NavLink";
import { Dropdown } from "./components/Dropdown";
import { TaskSidebar } from "./components/TaskSidebar";
import { styles } from "./App.styles";
import { useScenario } from "./contexts/ScenarioContext";

interface NavItem {
  to: string;
  icon: string;
  label: string;
}

export function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { scenario, setScenario } = useScenario();

  const creationItems: NavItem[] = [
    { to: "/worldview", icon: "🌍", label: "世界观" },
    { to: "/characters", icon: "👤", label: "人物" },
    { to: "/character-network", icon: "🔗", label: "关系网" },
    { to: "/core-storyline", icon: "📜", label: "故事线" },
    { to: "/article", icon: "✍️", label: "事件文章" },
    { to: "/dialogue", icon: "💬", label: "对话文案生成" },
    { to: "/short-script", icon: "🎬", label: "短句脚本生成" },
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

          <div style={styles.scenarioContainer}>
            {["游戏", "小说", "剧本"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setScenario(s)}
                style={styles.scenarioBtn(scenario === s)}
              >
                {s === "游戏" ? "🎮 " : s === "小说" ? "📚 " : "🎬 "}
                {s}
              </button>
            ))}
          </div>
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
        <Route path="/dialogue" element={<DialoguePage />} />
        <Route path="/short-script" element={<ShortScriptPage />} />
        <Route path="/timeline-analysis" element={<TimelineAnalysisPage />} />
        <Route path="/worldview-analysis" element={<WorldviewAnalysisPage />} />
        <Route path="/cache" element={<CachePage />} />
      </Routes>
    </div>
  );
}
