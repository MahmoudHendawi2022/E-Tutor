import React from "react";
import "./Tabs.css";

export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  className = "",
  ...props
}) {
  return (
    <div className={`etutor-tabs-container ${className}`} {...props}>
      <div className="etutor-tabs-list">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`etutor-tab-trigger ${
              activeTab === tab.id ? "etutor-tab-active" : ""
            }`}
            onClick={() => onChange && onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="etutor-tabs-content">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}
