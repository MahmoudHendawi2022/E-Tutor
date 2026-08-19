import { Route } from "react-router";

import AdminRoute from "../components/Auth/AdminRoute";
import AdminLayout from "./AdminLayout";
import AdminSignIn from "./AdminSignIn";
import AdminDashboard from "./AdminDashboard";
import AdminTutorApplications from "./AdminTutorApplications";
import AdminTutors from "./AdminTutors";
import AdminTutorDetails from "./AdminTutorDetails";
import AdminStudents from "./AdminStudents";
import AdminStudentDetails from "./AdminStudentDetails";
import AdminLessons from "./AdminLessons";
import AdminPayments from "./AdminPayments";
import AdminFinance from "./AdminFinance";
import AdminPayouts from "./AdminPayouts";
import AdminReports from "./AdminReports";
import AdminMasterData from "./AdminMasterData";
import AdminSettings from "./AdminSettings";

/*
  Import { adminRoutes } in App.jsx and place {adminRoutes}
  directly inside your existing <Routes> element.
*/
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
