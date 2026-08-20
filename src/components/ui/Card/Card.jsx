import React from "react";
import "./Card.css";

export default function Card({
  children,
  className = "",
  padded = true,
  onClick,
  ...props
}) {
  return (
    <div
      className={`etutor-card ${padded ? "etutor-card-padded" : ""} ${
        onClick ? "etutor-card-clickable" : ""
      } ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
