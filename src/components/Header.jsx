import {
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Monitor,
  Settings,
  UserRound,
  X,
} from "lucide-react";

import { Link, useNavigate } from "react-router";

import { useEffect, useRef, useState } from "react";

import { AnimatePresence, motion } from "motion/react";

import { useAuth } from "../context/AuthContext";

import "./header.css";

const menuVariants = {
  hidden: {
    opacity: 0,
    y: -8,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      type: "tween",
      duration: 0.22,
      ease: "easeOut",
      staggerChildren: 0.045,
      delayChildren: 0.03,
    },
  },

  exit: {
    opacity: 0,
    y: -6,

    transition: {
      type: "tween",
      duration: 0.16,
      ease: "easeIn",
    },
  },
};

const linkVariants = {
  hidden: {
    opacity: 0,
    y: -5,
  },

  visible: {
    opacity: 1,
    y: 0,

    transition: {
      type: "tween",
      duration: 0.18,
      ease: "easeOut",
    },
  },
};

const profileVariants = {
  hidden: {
    opacity: 0,
    y: -6,
    scale: 0.985,
  },

  visible: {
    opacity: 1,
    y: 0,
    scale: 1,

    transition: {
      duration: 0.16,
      ease: "easeOut",
    },
  },

  exit: {
    opacity: 0,
    y: -4,
    scale: 0.99,

    transition: {
      duration: 0.12,
      ease: "easeIn",
    },
  },
};

function Header() {
  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuth();

  const [openMenu, setOpenMenu] = useState(false);

  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef(null);

  /* =====================================
     USER DATA
  ===================================== */

  const isTutor = user?.role === "tutor";

  const dashboardPath = isTutor ? "/tutor/dashboard" : "/dashboard";

  const firstName = user?.firstName || user?.fullName?.split(" ")[0] || "User";

  const fullName =
    user?.fullName ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    "E-Tutor User";

  const initials =
    user?.initials ||
    fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((name) => name.charAt(0).toUpperCase())
      .join("");

  /* =====================================
     CLOSE MENUS
  ===================================== */

  const closeMenu = () => {
    setOpenMenu(false);
  };

  const closeProfileMenu = () => {
    setProfileOpen(false);
  };

  /* =====================================
     CLICK OUTSIDE + ESCAPE
  ===================================== */

  useEffect(() => {
    const handleMouseDown = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setOpenMenu(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  /* =====================================
     LOGOUT
  ===================================== */

  const handleLogout = () => {
    closeProfileMenu();
    closeMenu();

    logout();

    navigate("/signin", {
      replace: true,
    });
  };

  return (
    <header className="site-header">
      <div className="container">
        {/* =====================================
            LOGO
        ===================================== */}

        <Link
          to="/home"
          className="logo"
          onClick={() => {
            closeMenu();
            closeProfileMenu();
          }}
        >
          <Monitor size={24} />

          <span>E-Tutor</span>
        </Link>

        {/* =====================================
            DESKTOP NAVIGATION
        ===================================== */}

        <nav className="desktop-nav">
          <Link to="/home">Home</Link>

          <Link to="/tutors">Find Tutors</Link>

          <a href="/home#subjects">Subjects</a>

          <a href="/home#how-it-works">How It Works</a>

          <a href="/home#for-tutors">For Tutors</a>
        </nav>

        {/* =====================================
            RIGHT
        ===================================== */}

        <div className="header-right">
          {/* =====================================
              GUEST
          ===================================== */}

          {!isAuthenticated && (
            <div className="sign">
              <Link className="signin" to="/signin">
                Sign in
              </Link>

              <Link className="register" to="/register">
                Register
              </Link>
            </div>
          )}

          {/* =====================================
              LOGGED USER
          ===================================== */}

          {isAuthenticated && user && (
            <div className="header-authenticated">
              {/* Dashboard */}

              <Link to={dashboardPath} className="header-dashboard-button">
                <LayoutDashboard size={15} />
                Dashboard
              </Link>

              {/* Profile */}

              <div className="header-profile" ref={profileRef}>
                <button
                  type="button"
                  className={`header-profile-button ${
                    profileOpen ? "active" : ""
                  }`}
                  onClick={() => setProfileOpen((current) => !current)}
                  aria-expanded={profileOpen}
                >
                  <span className="header-avatar">{initials}</span>

                  <span className="header-user-info">
                    <strong>{firstName}</strong>

                    <small>{isTutor ? "Tutor" : "Student"}</small>
                  </span>

                  <ChevronDown
                    size={14}
                    className={profileOpen ? "rotate" : ""}
                  />
                </button>

                {/* =====================================
                    DROPDOWN
                ===================================== */}

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      className="header-profile-menu"
                      variants={profileVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {/* Account */}

                      <div className="profile-menu-head">
                        <span className="profile-menu-avatar">{initials}</span>

                        <div>
                          <strong>{fullName}</strong>

                          <span>{user.email}</span>
                        </div>
                      </div>

                      <div className="profile-menu-divider" />

                      {/* Dashboard */}

                      <Link to={dashboardPath} onClick={closeProfileMenu}>
                        {isTutor ? (
                          <UserRound size={15} />
                        ) : (
                          <GraduationCap size={15} />
                        )}

                        <div>
                          <strong>
                            {isTutor ? "Tutor Dashboard" : "My Dashboard"}
                          </strong>

                          <span>
                            {isTutor
                              ? "Manage your teaching"
                              : "View your learning"}
                          </span>
                        </div>
                      </Link>

                      {/* Student Settings */}

                      {!isTutor && (
                        <Link
                          to="/dashboard/settings"
                          onClick={closeProfileMenu}
                        >
                          <Settings size={15} />

                          <div>
                            <strong>Settings</strong>

                            <span>Manage your account</span>
                          </div>
                        </Link>
                      )}

                      <div className="profile-menu-divider" />

                      {/* Logout */}

                      <button
                        type="button"
                        className="profile-logout"
                        onClick={handleLogout}
                      >
                        <LogOut size={15} />

                        <div>
                          <strong>Log out</strong>

                          <span>Sign out of your account</span>
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* =====================================
              MOBILE MENU BUTTON
          ===================================== */}

          <button
            type="button"
            className="menu-btn"
            onClick={() => setOpenMenu((current) => !current)}
            aria-label="Open navigation"
          >
            {openMenu ? <X size={25} /> : <Menu size={25} />}
          </button>
        </div>

        {/* =====================================
            MOBILE NAVIGATION
        ===================================== */}

        <AnimatePresence>
          {openMenu && (
            <motion.nav
              className="mobile-nav"
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div variants={linkVariants}>
                <Link to="/home" onClick={closeMenu}>
                  Home
                </Link>
              </motion.div>

              <motion.div variants={linkVariants}>
                <Link to="/tutors" onClick={closeMenu}>
                  Find Tutors
                </Link>
              </motion.div>

              <motion.a
                href="/home#subjects"
                variants={linkVariants}
                whileHover={{
                  x: 6,
                }}
                onClick={closeMenu}
              >
                Subjects
              </motion.a>

              <motion.a
                href="/home#how-it-works"
                variants={linkVariants}
                whileHover={{
                  x: 6,
                }}
                onClick={closeMenu}
              >
                How It Works
              </motion.a>

              <motion.a
                href="/home#for-tutors"
                variants={linkVariants}
                whileHover={{
                  x: 6,
                }}
                onClick={closeMenu}
              >
                For Tutors
              </motion.a>

              {/* =====================================
                  MOBILE AUTH
              ===================================== */}

              <div className="mobile-nav-divider" />

              {!isAuthenticated ? (
                <div className="mobile-auth">
                  <Link
                    to="/signin"
                    className="mobile-signin"
                    onClick={closeMenu}
                  >
                    Sign in
                  </Link>

                  <Link
                    to="/register"
                    className="mobile-register"
                    onClick={closeMenu}
                  >
                    Register
                  </Link>
                </div>
              ) : (
                <div className="mobile-user-area">
                  <div className="mobile-user">
                    <span className="header-avatar">{initials}</span>

                    <div>
                      <strong>{fullName}</strong>

                      <span>
                        {isTutor ? "Tutor account" : "Student account"}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={dashboardPath}
                    className="mobile-dashboard-link"
                    onClick={closeMenu}
                  >
                    <LayoutDashboard size={15} />

                    {isTutor ? "Tutor Dashboard" : "My Dashboard"}
                  </Link>

                  {!isTutor && (
                    <Link
                      to="/dashboard/settings"
                      className="mobile-dashboard-link"
                      onClick={closeMenu}
                    >
                      <Settings size={15} />
                      Settings
                    </Link>
                  )}

                  <button
                    type="button"
                    className="mobile-logout"
                    onClick={handleLogout}
                  >
                    <LogOut size={15} />
                    Log out
                  </button>
                </div>
              )}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

export default Header;
