import React from "react";
import { Route } from "react-router";
import ProtectedRoute from "../../components/Auth/ProtectedRoute";
import TutorAccessRoute from "../../components/Auth/TutorAccessRoute";
import TutorLayout from "../../layouts/TutorLayout/TutorLayout";

import TutorOnboarding from "../../pages/tutor/TutorOnboarding/TutorOnboarding";
import TutorApplicationStatus from "../../pages/tutor/TutorApplicationStatus/TutorApplicationStatus";
import TutorDashboard from "../../pages/tutor/TutorDashboard/TutorDashboard";
import TutorLessons from "../../pages/tutor/TutorLessons/TutorLessons";
import TutorAvailability from "../../pages/tutor/TutorAvailability/TutorAvailability";
import TutorStudents from "../../pages/tutor/TutorStudents/TutorStudents";
import TutorMessages from "../../pages/tutor/TutorMessages/TutorMessages";
import TutorSettings from "../../pages/tutor/TutorSettings/TutorSettings";

export const tutorRoutes = (
  <Route element={<ProtectedRoute role="tutor" />}>
    <Route path="/tutor/onboarding" element={<TutorOnboarding />} />
    <Route path="/tutor/application-status" element={<TutorApplicationStatus />} />

    <Route element={<TutorAccessRoute />}>
      <Route element={<TutorLayout />}>
        <Route path="/tutor/dashboard" element={<TutorDashboard />} />
        <Route path="/tutor/lessons" element={<TutorLessons />} />
        <Route path="/tutor/availability" element={<TutorAvailability />} />
        <Route path="/tutor/students" element={<TutorStudents />} />
        <Route path="/tutor/messages" element={<TutorMessages />} />
        <Route path="/tutor/settings" element={<TutorSettings />} />
      </Route>
    </Route>
  </Route>
);
