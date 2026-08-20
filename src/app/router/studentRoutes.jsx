import React from "react";
import { Route } from "react-router";
import ProtectedRoute from "../../components/Auth/ProtectedRoute";
import MainLayout from "../../layouts/MainLayouts";
import StudentLayout from "../../layouts/StudentLayout/StudentLayout";

import FindTutors from "../../pages/public/FindTutors/FindTutors";
import TutorProfile from "../../pages/public/TutorProfile/TutorProfile";
import BookLesson from "../../pages/public/BookLesson/BookLesson";
import BookingConfirmation from "../../pages/public/BookingConfirmation/BookingConfirmation";
import BookingSuccess from "../../pages/public/BookingSuccess/BookingSuccess";

import StudentDashboard from "../../pages/student/StudentDashboard/StudentDashboard";
import MyLessons from "../../pages/student/MyLessons/MyLessons";
import LessonDetails from "../../pages/student/LessonDetails/LessonDetails";
import MyTutors from "../../pages/student/MyTutors/MyTutors";
import Messages from "../../pages/student/Messages/Messages";
import SavedTutors from "../../pages/student/SavedTutors/SavedTutors";
import StudentSettings from "../../pages/student/StudentSettings/StudentSettings";

export const studentRoutes = (
  <Route element={<ProtectedRoute role="student" />}>
    <Route element={<MainLayout />}>
      <Route path="/tutors" element={<FindTutors />} />
      <Route path="/tutors/:id" element={<TutorProfile />} />
      <Route path="/tutors/:id/book" element={<BookLesson />} />
      <Route path="/tutors/:id/book/confirm" element={<BookingConfirmation />} />
      <Route path="/booking/success" element={<BookingSuccess />} />
    </Route>

    <Route element={<StudentLayout />}>
      <Route path="/dashboard" element={<StudentDashboard />} />
      <Route path="/dashboard/lessons" element={<MyLessons />} />
      <Route path="/dashboard/lessons/:id" element={<LessonDetails />} />
      <Route path="/dashboard/tutors" element={<MyTutors />} />
      <Route path="/dashboard/messages" element={<Messages />} />
      <Route path="/dashboard/saved" element={<SavedTutors />} />
      <Route path="/dashboard/settings" element={<StudentSettings />} />
    </Route>
  </Route>
);
