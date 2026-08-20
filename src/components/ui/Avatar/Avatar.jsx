import React from "react";
import "./Avatar.css";

export default function Avatar({
  src,
  alt = "",
  initials = "",
  size = "md",
  className = "",
  ...props
}) {
  return (
    <div className={`etutor-avatar etutor-avatar-${size} ${className}`} {...props}>
      {src ? (
        <img src={src} alt={alt} className="etutor-avatar-img" />
      ) : (
        <span className="etutor-avatar-initials">{initials || "ET"}</span>
      )}
    </div>
  );
}
