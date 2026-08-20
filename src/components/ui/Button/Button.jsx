import React from "react";
import "./Button.css";

const Button = React.forwardRef(({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
  className = "",
  ...props
}, ref) => {
  return (
    <button
      type={type}
      ref={ref}
      className={`etutor-btn etutor-btn-${variant} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";
export default Button;
