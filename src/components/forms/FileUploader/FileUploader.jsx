import React, { useRef, useState } from "react";
import { Upload } from "lucide-react";
import "./FileUploader.css";

export default function FileUploader({
  accept = "*",
  onFileSelect,
  placeholder = "Upload file",
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
      className={`etutor-file-uploader ${disabled ? "etutor-file-uploader-disabled" : ""} ${className}`}
      onClick={handleContainerClick}
      {...props}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        style={{ display: "none" }}
        disabled={disabled}
      />
      <Upload size={20} className="etutor-file-uploader-icon" />
      <span className="etutor-file-uploader-text">
        {selectedFileName || placeholder}
      </span>
    </div>
  );
}
