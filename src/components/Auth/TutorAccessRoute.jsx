import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { useTutors } from "../../context/TutorsContext";

function TutorAccessRoute() {
  const { user } = useAuth();
  const { getTutorByUserId, getTutorById } = useTutors();

  const tutor = getTutorByUserId(user?.id) || getTutorById(user?.tutorId);

  if (!tutor || !tutor.profileCompleted || tutor.status === "draft") {
    return <Navigate to="/tutor/onboarding" replace />;
  }

  if (tutor.status !== "approved") {
    return <Navigate to="/tutor/application-status" replace />;
  }

  return <Outlet />;
}

export default TutorAccessRoute;
