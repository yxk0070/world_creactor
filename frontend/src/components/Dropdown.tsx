import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

interface DropdownItem {
  to: string;
  icon: string;
  label: string;
}

interface DropdownProps {
  label: string;
  items: DropdownItem[];
  activePath: string;
}

export function Dropdown({ label, items, activePath }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isActive = items.some((item) => activePath === item.to);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "12px 24px",
          background:
            isActive || isOpen ? "rgba(99, 102, 241, 0.3)" : "transparent",
          color: isActive || isOpen ? "#f8fafc" : "#94a3b8",
          border: "none",
          borderRadius: "12px",
          fontWeight: isActive || isOpen ? "600" : "500",
          fontSize: "15px",
          cursor: "pointer",
          transition: "all 0.2s ease",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
        onMouseEnter={(e) => {
          if (!isActive && !isOpen) {
            e.currentTarget.style.background = "rgba(71, 85, 105, 0.3)";
            e.currentTarget.style.color = "#f8fafc";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive && !isOpen) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#94a3b8";
          }
        }}
      >
        {label}
        <span
          style={{
            fontSize: "12px",
            transition: "transform 0.2s",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▼
        </span>
      </button>
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: "0",
            marginTop: "8px",
            background: "rgba(30, 41, 59, 0.98)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(71, 85, 105, 0.5)",
            borderRadius: "12px",
            padding: "8px",
            minWidth: "180px",
            zIndex: 999999,
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
          }}
        >
          {items.map((item, index) => (
            <Link
              key={index}
              to={item.to}
              onClick={() => setIsOpen(false)}
              style={{
                display: "block",
                padding: "10px 16px",
                color: activePath === item.to ? "#f8fafc" : "#94a3b8",
                textDecoration: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: activePath === item.to ? "600" : "500",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(71, 85, 105, 0.3)";
                e.currentTarget.style.color = "#f8fafc";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color =
                  activePath === item.to ? "#f8fafc" : "#94a3b8";
              }}
            >
              <span style={{ marginRight: "8px" }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
