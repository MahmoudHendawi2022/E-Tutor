import React from "react";
import Spinner from "../Spinner";
import "./PageLoader.css";

export default function PageLoader({ message = "Loading page...", ...props }) {
  return (
    <div className="etutor-page-loader" {...props}>
      <div className="etutor-page-loader-content">
        <Spinner size="lg" />
        {message && <p className="etutor-page-loader-message">{message}</p>}
      </div>
    </div>
  );
}
