import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { CachePage } from "./CachePage";
import { ResultsGallery } from "./ResultsGallery";

export function ResultsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isHistory = location.pathname.includes('/history');

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 32px", minHeight: "calc(100vh - 72px)" }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--border-dark)', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '28px', color: 'var(--text-primary)', margin: 0, marginRight: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>📦</span> 生成成果
        </h1>
        
        <div style={{ display: 'flex', gap: '12px', background: 'var(--bg-glass)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
          <button 
            onClick={() => navigate('/results')}
            style={{
              background: !isHistory ? 'var(--accent-bg)' : 'transparent',
              border: !isHistory ? '1px solid var(--accent-bg-50)' : '1px solid transparent',
              color: !isHistory ? 'var(--accent-purple)' : 'var(--text-muted)',
              padding: '8px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 600,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>🗂️</span> 分类展厅
          </button>
          <button 
            onClick={() => navigate('/results/history')}
            style={{
              background: isHistory ? 'var(--accent-bg)' : 'transparent',
              border: isHistory ? '1px solid var(--accent-bg-50)' : '1px solid transparent',
              color: isHistory ? 'var(--accent-purple)' : 'var(--text-muted)',
              padding: '8px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 600,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>⏳</span> 历史记录
          </button>
        </div>
      </div>

      <div style={{ margin: isHistory ? '-40px -32px' : '0' }}>
        <Routes>
          <Route path="/" element={<ResultsGallery />} />
          <Route path="/history" element={<CachePage />} />
          <Route path="*" element={<Navigate to="/results" replace />} />
        </Routes>
      </div>
    </div>
  );
}
