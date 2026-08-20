import React from "react";
import "./Spinner.css";

export default function Spinner({ size = "md", color = "primary", className = "", ...props }) {
  return (
    <div
      className={`etutor-spinner etutor-spinner-${size} etutor-spinner-${color} ${className}`}
      {...props}
    />
  );
}
