import React from "react";
import "./Input.css";

const Input = React.forwardRef(({
  type = "text",
  placeholder = "",
  value,
  onChange,
  disabled = false,
  error = false,
  icon,
  suffix,
  className = "",
  ...props
}, ref) => {
  return (
    <div
      className={`etutor-input-wrapper ${error ? "etutor-input-error" : ""} ${
        disabled ? "etutor-input-disabled" : ""
      } ${className}`}
    >
      {icon && <span className="etutor-input-icon">{icon}</span>}
      <input
        type={type}
        ref={ref}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      {suffix && <span className="etutor-input-suffix">{suffix}</span>}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
