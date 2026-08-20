import React from "react";
import "./Textarea.css";

export default function Textarea({
  placeholder = "",
  value,
  onChange,
  disabled = false,
  error = false,
  rows = 4,
  className = "",
  ...props
}) {
  return (
    <div
      className={`etutor-textarea-wrapper ${error ? "etutor-textarea-error" : ""} ${
        disabled ? "etutor-textarea-disabled" : ""
      } ${className}`}
    >
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        {...props}
      />
    </div>
  );
}
