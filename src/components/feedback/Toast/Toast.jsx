import React, { useEffect } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import "./Toast.css";

export default function Toast({
  message,
  variant = "success",
  onClose,
  duration = 3000,
  className = "",
  ...props
}) {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />,
  };

  return (
    <div className={`etutor-toast etutor-toast-${variant} ${className}`} {...props}>
      <span className="etutor-toast-icon">{icons[variant]}</span>
      <span className="etutor-toast-message">{message}</span>
      {onClose && (
        <button className="etutor-toast-close" onClick={onClose} aria-label="Close message">
          <X size={14} />
        </button>
      )}
    </div>
  );
}
