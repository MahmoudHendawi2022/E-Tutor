import React from "react";
import "./Button.css";

export default function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  className = "",
  ...props
}) {
  return (
    <button
      type={type}
      className={`etutor-btn etutor-btn-${variant} etutor-btn-${size} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
