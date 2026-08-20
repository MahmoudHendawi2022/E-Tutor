import React from "react";
import { Routes, Route, Navigate } from "react-router";
import { publicRoutes } from "./publicRoutes";
import { studentRoutes } from "./studentRoutes";
import { tutorRoutes } from "./tutorRoutes";
import { adminRoutes } from "./adminRoutes";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signin" replace />} />
      
      {publicRoutes}
      {studentRoutes}
      {tutorRoutes}
      {adminRoutes}
      
      <Route path="*" element={<Navigate to="/signin" replace />} />
    </Routes>
  );
}
