import { Link, useLocation } from 'react-router-dom';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
}

export function NavLink({ to, children }: NavLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      style={{
        padding: '12px 24px',
        background: isActive ? 'rgba(99, 102, 241, 0.3)' : 'transparent',
        color: isActive ? '#f8fafc' : '#94a3b8',
        textDecoration: 'none',
        borderRadius: '12px',
        fontWeight: isActive ? '600' : '500',
        fontSize: '15px',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(71, 85, 105, 0.3)';
          e.currentTarget.style.color = '#f8fafc';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#94a3b8';
        }
      }}
    >
      {children}
    </Link>
  );
}
