import React from "react";
import "./Skeleton.css";

export default function Skeleton({
  variant = "text",
  width,
  height,
  className = "",
  ...props
}) {
  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div
      className={`etutor-skeleton etutor-skeleton-${variant} ${className}`}
      style={style}
      {...props}
    />
  );
}
