import React from "react";
import { AlertCircle } from "lucide-react";
import "./ErrorState.css";

export default function ErrorState({
  title = "Something went wrong",
  message = "An error occurred while loading this section.",
  onRetry,
  className = "",
  ...props
}) {
  return (
    <div className={`etutor-error-state ${className}`} {...props}>
      <div className="etutor-error-state-icon">
        <AlertCircle size={40} />
      </div>
      <h3 className="etutor-error-state-title">{title}</h3>
      <p className="etutor-error-state-message">{message}</p>
      {onRetry && (
        <button
          type="button"
          className="etutor-error-state-retry-btn"
          onClick={onRetry}
        >
          Try Again
        </button>
      )}
    </div>
  );
}
