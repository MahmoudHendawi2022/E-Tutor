import React from "react";
import "./Modal.css";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = "",
  footer,
  ...props
}) {
  if (!isOpen) return null;

  return (
    <div className="etutor-modal-overlay" onClick={onClose} {...props}>
      <div
        className={`etutor-modal-content ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="etutor-modal-header">
          {title && <h3 className="etutor-modal-title">{title}</h3>}
          <button className="etutor-modal-close" onClick={onClose} aria-label="Close modal">
            &times;
          </button>
        </div>
        <div className="etutor-modal-body">{children}</div>
        {footer && <div className="etutor-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
