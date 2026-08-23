import React from "react";
import { Route } from "react-router-dom";
import AdminRoute from "../../components/Auth/AdminRoute";
import AdminLayout from "../../layouts/AdminLayout/AdminLayout";
import AdminSignIn from "../../pages/admin/AdminSignIn";
import AdminDashboard from "../../pages/admin/AdminDashboard";
import AdminTutorApplications from "../../pages/admin/AdminTutorApplications";
import AdminTutors from "../../pages/admin/AdminTutors";
import AdminTutorDetails from "../../pages/admin/AdminTutorDetails";
import AdminStudents from "../../pages/admin/AdminStudents";
import AdminStudentDetails from "../../pages/admin/AdminStudentDetails";
import AdminLessons from "../../pages/admin/AdminLessons";
import AdminPayments from "../../pages/admin/AdminPayments";
import AdminFinance from "../../pages/admin/AdminFinance";
import AdminPayouts from "../../pages/admin/AdminPayouts";
import AdminReports from "../../pages/admin/AdminReports";
import AdminMasterData from "../../pages/admin/AdminMasterData";
import AdminSettings from "../../pages/admin/AdminSettings";

export const adminRoutes = (
  <>
    <Route path="/admin/signin" element={<AdminSignIn />} />

    <Route element={<AdminRoute />}>
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/tutor-applications" element={<AdminTutorApplications />} />
        <Route path="/admin/tutors" element={<AdminTutors />} />
        <Route path="/admin/tutors/:id" element={<AdminTutorDetails />} />
        <Route path="/admin/students" element={<AdminStudents />} />
        <Route path="/admin/students/:id" element={<AdminStudentDetails />} />
        <Route path="/admin/lessons" element={<AdminLessons />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/finance" element={<AdminFinance />} />
        <Route path="/admin/payouts" element={<AdminPayouts />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/master-data" element={<AdminMasterData />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>
    </Route>
  </>
);
