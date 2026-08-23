import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  Clock3,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Monitor,
  Settings,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { useAuth } from "../../context/AuthContext";
import { useMessages } from "../../context/MessagesContext";
import { useTutors } from "../../context/TutorsContext";
import "./tutorLayout.css";

const navItems = [
  { title: "Overview", icon: LayoutDashboard, to: "/tutor/dashboard" },
  { title: "My Lessons", icon: CalendarDays, to: "/tutor/lessons" },
  { title: "Availability", icon: Clock3, to: "/tutor/availability" },
  { title: "My Students", icon: Users, to: "/tutor/students" },
  { title: "Messages", icon: MessageCircle, to: "/tutor/messages", showUnread: true },
  { title: "Settings", icon: Settings, to: "/tutor/settings" },
];

const profileVariants = {
  hidden: { opacity: 0, y: -6, scale: 0.985 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.16, ease: "easeOut" } },
  exit: { opacity: 0, y: -5, scale: 0.99, transition: { duration: 0.12, ease: "easeIn" } },
};

function TutorLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getUnreadForTutor } = useMessages();
  const { getTutorById, getTutorByUserId } = useTutors();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const tutor = getTutorById(user?.tutorId) || getTutorByUserId(user?.id);
  const fullName = tutor?.name || user?.fullName || "Tutor";
  const firstName = tutor?.firstName || user?.firstName || fullName.split(" ")[0] || "Tutor";
  const initials =
    user?.initials ||
    fullName.split(" ").filter(Boolean).slice(0, 2).map((name) => name.charAt(0).toUpperCase()).join("") ||
    "TU";
  const title = tutor?.shortTitle || tutor?.title || "Tutor";

  const unreadMessages = getUnreadForTutor(tutor?.id || user?.tutorId);

  const closeSidebar = () => setSidebarOpen(false);
  const closeProfile = () => setProfileOpen(false);
  const handleLogout = () => {
    setProfileOpen(false);
    setSidebarOpen(false);
    logout();
    navigate("/signin", { replace: true });
  };

  useEffect(() => {
    const handleMouseDown = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!tutor || !tutor.profileCompleted || tutor.status === "draft") {
    return <Navigate to="/tutor/onboarding" replace />;
  }

  if (tutor.status !== "approved") {
    return <Navigate to="/tutor/application-status" replace />;
  }

  return (
    <div className="tutor-layout">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div className="tutor-sidebar-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={closeSidebar} />
        )}
      </AnimatePresence>

      <aside className={`tutor-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="tutor-sidebar-top">
          <Link to="/tutor/dashboard" className="tutor-sidebar-logo" onClick={closeSidebar}><Monitor size={22} /><span>E-Tutor</span></Link>
          <button type="button" className="tutor-sidebar-close" onClick={closeSidebar} aria-label="Close sidebar"><X size={20} /></button>
        </div>

        <div className="tutor-sidebar-profile">
          {tutor?.image ? <img src={tutor.image} alt={fullName} /> : <div className="tutor-sidebar-avatar">{initials}</div>}
          <div><strong>{fullName}</strong><span>{title}</span></div>
        </div>

        <nav className="tutor-sidebar-nav">
          <span className="tutor-nav-label">TEACHING</span>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.title} to={item.to} end={item.to === "/tutor/dashboard"} onClick={closeSidebar} className={({ isActive }) => `tutor-nav-link ${isActive ? "active" : ""}`}>
                <Icon size={17} /><span>{item.title}</span>
                {item.showUnread && unreadMessages > 0 && <span className="tutor-nav-badge">{unreadMessages > 99 ? "99+" : unreadMessages}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="tutor-sidebar-bottom">
          <Link to="/home" className="tutor-nav-link" onClick={closeSidebar}><ExternalLink size={17} /><span>View website</span></Link>
          <button type="button" className="tutor-logout" onClick={handleLogout}><LogOut size={17} /><span>Sign out</span></button>
        </div>
      </aside>

      <div className="tutor-layout-content">
        <header className="tutor-topbar">
          <div className="tutor-topbar-left">
            <button type="button" className="tutor-menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar"><Menu size={21} /></button>
            <Link to="/tutor/dashboard" className="tutor-mobile-logo"><Monitor size={19} /><span>E-Tutor</span></Link>
          </div>
          <div className="tutor-topbar-right">
            <div className="tutor-mode-label"><BookOpen size={14} />Tutor workspace</div>
            <div className="tutor-user-wrapper" ref={profileRef}>
              <button type="button" className={`tutor-user ${profileOpen ? "active" : ""}`} onClick={() => setProfileOpen((current) => !current)} aria-expanded={profileOpen}>
                {tutor?.image ? <img src={tutor.image} alt={fullName} /> : <div className="tutor-user-avatar">{initials}</div>}
                <div className="tutor-user-info"><strong>{firstName}</strong><span>Tutor</span></div>
                <ChevronDown size={14} className={profileOpen ? "rotate" : ""} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div className="tutor-profile-menu" variants={profileVariants} initial="hidden" animate="visible" exit="exit">
                    <div className="tutor-profile-menu-head">
                      {tutor?.image ? <img src={tutor.image} alt={fullName} /> : <div>{initials}</div>}
                      <section><strong>{fullName}</strong><span>{user?.email}</span></section>
                    </div>
                    <div className="tutor-profile-divider" />
                    <Link to="/tutor/dashboard" onClick={closeProfile}><LayoutDashboard size={15} />Dashboard</Link>
                    <Link to="/tutor/lessons" onClick={closeProfile}><CalendarDays size={15} />My lessons</Link>
                    <Link to="/tutor/availability" onClick={closeProfile}><Clock3 size={15} />Availability</Link>
                    <Link to="/tutor/students" onClick={closeProfile}><Users size={15} />My students</Link>
                    <Link to="/tutor/messages" onClick={closeProfile}><MessageCircle size={15} />Messages{unreadMessages > 0 && <span className="tutor-profile-unread">{unreadMessages > 99 ? "99+" : unreadMessages}</span>}</Link>
                    <Link to="/tutor/settings" onClick={closeProfile}><Settings size={15} />Settings</Link>
                    <div className="tutor-profile-divider" />
                    <button type="button" onClick={handleLogout}><LogOut size={15} />Log out</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>
        <div className="tutor-layout-outlet"><Outlet /></div>
      </div>
    </div>
  );
}

export default TutorLayout;
