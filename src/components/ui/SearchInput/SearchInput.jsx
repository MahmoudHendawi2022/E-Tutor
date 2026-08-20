import React from "react";
import { Search } from "lucide-react";
import "./SearchInput.css";

export default function SearchInput({
  placeholder = "Search...",
  value,
  onChange,
  disabled = false,
  className = "",
  ...props
}) {
  return (
    <div className={`etutor-search-wrapper ${className}`}>
      <span className="etutor-search-icon">
        <Search size={18} />
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
    </div>
  );
}
