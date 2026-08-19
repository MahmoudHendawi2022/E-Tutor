import { Navigate, Route, Routes } from "react-router";

import MainLayout from "./layouts/MainLayouts";
import StudentLayout from "./layouts/StudentLayout/StudentLayout";
import TutorLayout from "./layouts/TutorLayout/TutorLayout";

import ProtectedRoute from "./components/Auth/ProtectedRoute";
import TutorAccessRoute from "./components/Auth/TutorAccessRoute";

import Home from "./pages/Home/Home";
import SignIn from "./pages/SignIn/SignIn";
import Register from "./pages/Register/Register";

import FindTutors from "./pages/FindTutors/FindTutors";
import TutorProfile from "./pages/TutorProfile/TutorProfile";
import BookLesson from "./pages/BookLesson/BookLesson";
import BookingConfirmation from "./pages/BookingConfirmation/BookingConfirmation";
import BookingSuccess from "./pages/BookingSuccess/BookingSuccess";

import StudentDashboard from "./pages/StudentDashboard/StudentDashboard";
import MyLessons from "./pages/MyLessons/MyLessons";
import LessonDetails from "./pages/LessonDetails/LessonDetails";
import MyTutors from "./pages/MyTutors/MyTutors";
import Messages from "./pages/Messages/Messages";
import SavedTutors from "./pages/SavedTutors/SavedTutors";
import StudentSettings from "./pages/StudentSettings/StudentSettings";

import TutorOnboarding from "./pages/TutorOnboarding/TutorOnboarding";
import TutorApplicationStatus from "./pages/TutorApplicationStatus/TutorApplicationStatus";
import TutorDashboard from "./pages/TutorDashboard/TutorDashboard";
import TutorLessons from "./pages/TutorLessons/TutorLessons";
import TutorAvailability from "./pages/TutorAvailability/TutorAvailability";
import TutorStudents from "./pages/TutorStudents/TutorStudents";
import TutorMessages from "./pages/TutorMessages/TutorMessages";
import TutorSettings from "./pages/TutorSettings/TutorSettings";

import { adminRoutes } from "./admin/adminRoutes";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signin" replace />} />

      {/* Public website */}
      <Route element={<MainLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Student */}
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

      {/* Tutor registration/review */}
      <Route element={<ProtectedRoute role="tutor" />}>
        <Route path="/tutor/onboarding" element={<TutorOnboarding />} />
        <Route path="/tutor/application-status" element={<TutorApplicationStatus />} />

        {/* Approved tutors only */}
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

      {/* Super Admin */}
      {adminRoutes}

      <Route path="*" element={<Navigate to="/signin" replace />} />
    </Routes>
  );
}

export default App;
