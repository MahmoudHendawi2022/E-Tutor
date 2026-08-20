import React from "react";
import "./FormField.css";

export default function FormField({ children, className = "", ...props }) {
  return (
    <div className={`etutor-form-field ${className}`} {...props}>
      {children}
    </div>
  );
}
