import React from "react";
import "./Input.css";

export default function Input({
  type = "text",
  placeholder = "",
  value,
  onChange,
  disabled = false,
  error = false,
  icon,
  className = "",
  ...props
}) {
  return (
    <div
      className={`etutor-input-wrapper ${error ? "etutor-input-error" : ""} ${
        disabled ? "etutor-input-disabled" : ""
      } ${className}`}
    >
      {icon && <span className="etutor-input-icon">{icon}</span>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
    </div>
  );
}
