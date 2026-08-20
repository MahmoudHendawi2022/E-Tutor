import React from "react";
import "./Drawer.css";

export default function Drawer({
  isOpen,
  onClose,
  position = "right",
  title,
  children,
  className = "",
  ...props
}) {
  if (!isOpen) return null;

  return (
    <div className="etutor-drawer-overlay" onClick={onClose} {...props}>
      <div
        className={`etutor-drawer-content etutor-drawer-${position} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="etutor-drawer-header">
          {title && <h3 className="etutor-drawer-title">{title}</h3>}
          <button className="etutor-drawer-close" onClick={onClose} aria-label="Close drawer">
            &times;
          </button>
        </div>
        <div className="etutor-drawer-body">{children}</div>
      </div>
    </div>
  );
}
