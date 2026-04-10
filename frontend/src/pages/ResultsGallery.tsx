import React from "react";
import { useNavigate } from "react-router-dom";
import { useCache } from "../hooks/useCache";

export function ResultsGallery() {
  const { cacheData, categoryNames, isLoading, formatDate } = useCache();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {Object.entries(categoryNames).map(([catKey, catName]) => {
        const items = cacheData[catKey] || [];
        if (items.length === 0) return null;
        
        return (
          <div key={catKey}>
            <h2 style={{ 
              fontSize: '20px', 
              color: 'var(--text-primary)', 
              marginBottom: '20px', 
              borderBottom: '1px solid var(--border-light)', 
              paddingBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {catName} 
              <span style={{ 
                background: 'var(--accent-bg)', 
                color: 'var(--accent-purple)', 
                fontSize: '13px', 
                padding: '2px 10px', 
                borderRadius: '12px',
                fontWeight: 'normal'
              }}>
                {items.length}项
              </span>
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '20px' 
            }}>
              {items.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => navigate(`/results/history?id=${item.id}&category=${catKey}`)}
                  style={{
                    background: 'var(--bg-solid-card-85)',
                    border: '1px solid var(--border-dark)',
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '120px'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = 'var(--accent-bg-60)';
                    e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0, 0, 0, 0.3)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--border-dark)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 0, left: 0, width: '4px', height: '100%',
                    background: 'linear-gradient(180deg, var(--accent-primary) 0%, #8b5cf6 100%)'
                  }} />
                  <h3 style={{ 
                    fontSize: '16px', 
                    color: 'var(--text-primary)', 
                    margin: '0 0 12px 0', 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    fontWeight: 600,
                    lineHeight: '1.4'
                  }}>
                    {item.name || "未命名"}
                  </h3>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🕒</span> {formatDate(item.created_at)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      
      {!isLoading && Object.values(cacheData).every(arr => arr.length === 0) && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '80px', fontSize: '16px', background: 'var(--bg-card-hover)', borderRadius: '20px', border: '1px dashed var(--border-dark)' }}>
          📦 暂无生成成果，快去左侧栏进行创作吧！
        </div>
      )}
    </div>
  );
}
