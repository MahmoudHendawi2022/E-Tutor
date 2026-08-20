import React from "react";
import "./Select.css";

export default function Select({
  options = [],
  value,
  onChange,
  disabled = false,
  placeholder = "Select option",
  error = false,
  className = "",
  ...props
}) {
  return (
    <div
      className={`etutor-select-wrapper ${error ? "etutor-select-error" : ""} ${
        disabled ? "etutor-select-disabled" : ""
      } ${className}`}
    >
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...props}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
