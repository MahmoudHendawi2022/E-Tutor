import React, { useState, useRef, useEffect } from "react";
import "./Dropdown.css";

export default function Dropdown({
  trigger,
  items = [],
  align = "right",
  className = "",
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      className={`etutor-dropdown-container ${className}`}
      ref={containerRef}
      {...props}
    >
      <div className="etutor-dropdown-trigger" onClick={() => setIsOpen((prev) => !prev)}>
        {trigger}
      </div>
      {isOpen && (
        <div className={`etutor-dropdown-menu etutor-dropdown-align-${align}`}>
          {items.map((item, index) => (
            <div
              key={index}
              className="etutor-dropdown-item"
              onClick={() => {
                if (item.onClick) item.onClick();
                setIsOpen(false);
              }}
            >
              {item.icon && <span className="etutor-dropdown-item-icon">{item.icon}</span>}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
