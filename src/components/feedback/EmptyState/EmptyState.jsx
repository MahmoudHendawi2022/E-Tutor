import React from "react";
import { FolderOpen } from "lucide-react";
import "./EmptyState.css";

export default function EmptyState({
  title = "No data found",
  description = "There are no items to display at the moment.",
  icon,
  action,
  className = "",
  ...props
}) {
  return (
    <div className={`etutor-empty-state ${className}`} {...props}>
      <div className="etutor-empty-state-icon">
        {icon || <FolderOpen size={48} />}
      </div>
      <h3 className="etutor-empty-state-title">{title}</h3>
      <p className="etutor-empty-state-desc">{description}</p>
      {action && <div className="etutor-empty-state-action">{action}</div>}
    </div>
  );
}
