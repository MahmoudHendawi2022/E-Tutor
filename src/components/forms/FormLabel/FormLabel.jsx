import React from "react";
import "./FormLabel.css";

export default function FormLabel({
  children,
  required = false,
  className = "",
  htmlFor,
  ...props
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`etutor-form-label ${className}`}
      {...props}
    >
      {children}
      {required && <span className="etutor-form-label-required"> *</span>}
    </label>
  );
}
