import { useEffect, useState } from "react";

import { Navigate, useLocation, useNavigate } from "react-router";

import {
  BookOpen,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

import { motion } from "motion/react";

import { useAuth } from "../../context/AuthContext";
import { useTutors } from "../../context/TutorsContext";

import "./signIn.css";

function SignIn() {
  const navigate = useNavigate();

  const location = useLocation();

  const { user, isAuthenticated, login } = useAuth();

  const { getTutorByUserId, getTutorById } = useTutors();

  const [role, setRole] = useState("student");

  const [email, setEmail] = useState("student@etutor.com");

  const [password, setPassword] = useState("123456");

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  /* =====================================
     CHANGE ROLE
  ===================================== */

  const changeRole = (nextRole) => {
    setRole(nextRole);

    setError("");

    if (nextRole === "student") {
      setEmail("student@etutor.com");
    } else {
      setEmail("tutor@etutor.com");
    }

    setPassword("123456");
  };

  /* =====================================
     TUTOR DESTINATION
  ===================================== */

  const getTutorDestination = (account) => {
    if (!account || account.role !== "tutor") {
      return "/dashboard";
    }

    const tutor =
      getTutorByUserId(account.id) ||
      getTutorById(account.tutorId);

    if (!tutor || tutor.status === "draft" || !tutor.profileCompleted) {
      return "/tutor/onboarding";
    }

    if (tutor.status === "approved") {
      return "/tutor/dashboard";
    }

    return "/tutor/application-status";
  };

  /* =====================================
     SUBMIT
  ===================================== */

  const handleSubmit = (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");

      return;
    }

    setLoading(true);

    window.setTimeout(() => {
      const result = login({
        email,
        password,
        role,
      });

      if (!result.success) {
        setError(result.message);

        setLoading(false);

        return;
      }

      const requestedPath = location.state?.from;

      if (result.user.role === "tutor") {
        const tutorDestination = getTutorDestination(result.user);

        if (
          tutorDestination === "/tutor/dashboard" &&
          requestedPath?.startsWith("/tutor/")
        ) {
          navigate(requestedPath, {
            replace: true,
          });

          return;
        }

        navigate(tutorDestination, {
          replace: true,
        });

        return;
      }

      if (requestedPath) {
        navigate(requestedPath, {
          replace: true,
        });

        return;
      }

      navigate("/dashboard", {
        replace: true,
      });
    }, 450);
  };

  /* =====================================
     ALREADY LOGGED IN
  ===================================== */

  if (isAuthenticated) {
    return (
      <Navigate
        to={user.role === "tutor" ? getTutorDestination(user) : "/dashboard"}
        replace
      />
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-shell">
        {/* LEFT */}

        <motion.section
          className="auth-brand"
          initial={{
            opacity: 0,
            x: -18,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.4,
          }}
        >
          <div className="auth-logo">
            <div>
              <BookOpen size={22} />
            </div>

            <strong>E-Tutor</strong>
          </div>

          <div className="auth-brand-content">
            <span>LEARN. TEACH. GROW.</span>

            <h1>Learning starts with the right connection.</h1>

            <p>
              Connect with tutors, manage lessons and keep your learning journey
              in one place.
            </p>
          </div>

          <div className="auth-brand-footer">E-Tutor learning platform</div>
        </motion.section>

        {/* FORM */}

        <motion.section
          className="auth-panel"
          initial={{
            opacity: 0,
            y: 14,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.38,
            delay: 0.05,
          }}
        >
          <div className="auth-form-wrap">
            <div className="auth-heading">
              <span>WELCOME BACK</span>

              <h2>Sign in to E-Tutor</h2>

              <p>Choose your account type and continue to your dashboard.</p>
            </div>

            {/* ROLE */}

            <div className="auth-role-switch">
              <button
                type="button"
                className={role === "student" ? "active" : ""}
                onClick={() => changeRole("student")}
              >
                <GraduationCap size={17} />

                <div>
                  <strong>Student</strong>

                  <span>Learn with tutors</span>
                </div>
              </button>

              <button
                type="button"
                className={role === "tutor" ? "active" : ""}
                onClick={() => changeRole("tutor")}
              >
                <UserRound size={17} />

                <div>
                  <strong>Tutor</strong>

                  <span>Manage students</span>
                </div>
              </button>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="auth-field">
                <label htmlFor="email">Email address</label>

                <div className="auth-input">
                  <Mail size={16} />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    placeholder="you@example.com"
                    autoComplete="email"
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
              </div>

              <div className="auth-field">
                <div className="auth-label-row">
                  <label htmlFor="password">Password</label>

                  <button type="button" className="auth-forgot">
                    Forgot password?
                  </button>
                </div>

                <div className="auth-input">
                  <LockKeyhole size={16} />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    onChange={(event) => setPassword(event.target.value)}
                  />

                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label="Show password"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading
                  ? "Signing in..."
                  : role === "tutor"
                    ? "Sign in as tutor"
                    : "Sign in as student"}
              </button>
            </form>

            {/* DEMO */}

            <div className="auth-demo">
              <strong>Demo account</strong>

              <span>
                {role === "student" ? "student@etutor.com" : "tutor@etutor.com"}
              </span>

              <span>Password: 123456</span>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  );
}

export default SignIn;
