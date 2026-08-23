import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { publicRoutes } from "./publicRoutes";
import { studentRoutes } from "./studentRoutes";
import { tutorRoutes } from "./tutorRoutes";
import { adminRoutes } from "./adminRoutes";

export default function AppRouter() {
  return (
    <Routes>
      {publicRoutes}
      {studentRoutes}
      {tutorRoutes}
      {adminRoutes}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}