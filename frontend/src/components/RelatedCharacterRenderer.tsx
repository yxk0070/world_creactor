export function RelatedCharacterRenderer({ data }: { data: any }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div
        style={{
          background: 'rgba(30, 41, 59, 0.8)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(71, 85, 105, 0.5)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <h4 style={{ margin: 0, color: '#f8fafc', fontSize: '20px' }}>
            {data.name}
          </h4>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span
              style={{
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
              }}
            >
              {data.role}
            </span>
            <span
              style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#6ee7b7',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
              }}
            >
              {data.relationship_to_core}
            </span>
          </div>
        </div>

        <p
          style={{
            color: '#cbd5e1',
            fontSize: '14px',
            marginBottom: '16px',
            lineHeight: '1.6',
          }}
        >
          <strong>背景：</strong> {data.background}
        </p>

        {data.personality_traits && data.personality_traits.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <strong
              style={{
                color: '#94a3b8',
                fontSize: '14px',
                display: 'block',
                marginBottom: '8px',
              }}
            >
              性格特征：
            </strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {data.personality_traits.map((trait: string, idx: number) => (
                <span
                  key={idx}
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    color: '#cbd5e1',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                  }}
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.relationships && data.relationships.length > 0 && (
          <div>
            <strong
              style={{
                color: '#94a3b8',
                fontSize: '14px',
                display: 'block',
                marginBottom: '8px',
              }}
            >
              详细关系：
            </strong>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              {data.relationships.map((rel: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                  }}
                >
                  <div style={{ color: '#f8fafc', marginBottom: '4px' }}>
                    与{' '}
                    <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>
                      {rel.target}
                    </span>
                    <span style={{ margin: '0 8px', color: '#94a3b8' }}>-</span>
                    <span style={{ color: '#10b981' }}>{rel.type}</span>
                  </div>
                  <div style={{ color: '#94a3b8' }}>{rel.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}