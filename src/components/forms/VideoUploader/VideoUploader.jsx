import React, { useRef, useState } from "react";
import { Video } from "lucide-react";
import "./VideoUploader.css";

export default function VideoUploader({
  onFileSelect,
  placeholder = "Upload intro video",
  disabled = false,
  className = "",
  ...props
}) {
  const fileInputRef = useRef(null);
  const [selectedFileName, setSelectedFileName] = useState("");

  const handleContainerClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      if (onFileSelect) onFileSelect(file);
    }
  };

  return (
    <div
      className={`etutor-video-uploader ${disabled ? "etutor-video-uploader-disabled" : ""} ${className}`}
      onClick={handleContainerClick}
      {...props}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="video/*"
        style={{ display: "none" }}
        disabled={disabled}
      />
      <Video size={24} className="etutor-video-uploader-icon" />
      <span className="etutor-video-uploader-text">
        {selectedFileName || placeholder}
      </span>
      <span className="etutor-video-uploader-sub">
        Supported formats: MP4, WebM (Max 50MB)
      </span>
    </div>
  );
}
