import { useEffect, useRef, useState } from "react";

import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import { useMessages } from "../../context/MessagesContext";

import { useNotifications } from "../../context/NotificationsContext";

import {
  Bell,
  CalendarDays,
  CheckCheck,
  GraduationCap,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Monitor,
  Search,
  Settings,
  Star,
  X,
} from "lucide-react";

import { AnimatePresence, motion } from "motion/react";

import "./studentLayout.css";

/* =====================================
   NAVIGATION
===================================== */

const navItems = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    to: "/dashboard",
  },

  {
    title: "My Lessons",
    icon: CalendarDays,
    to: "/dashboard/lessons",
  },

  {
    title: "My Tutors",
    icon: GraduationCap,
    to: "/dashboard/tutors",
  },

  {
    title: "Messages",
    icon: MessageCircle,
    to: "/dashboard/messages",
  },

  {
    title: "Saved Tutors",
    icon: Heart,
    to: "/dashboard/saved",
  },
];

/* =====================================
   NOTIFICATION TIME
===================================== */

function getNotificationTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();

  const difference = now.getTime() - date.getTime();

  const minutes = Math.floor(difference / (1000 * 60));

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/* =====================================
   NOTIFICATION ICON
===================================== */

function NotificationIcon({ type }) {
  if (type === "message") {
    return <MessageCircle size={15} />;
  }

  if (type === "review") {
    return <Star size={15} />;
  }

  return <CalendarDays size={15} />;
}

/* =====================================
   COMPONENT
===================================== */

function StudentLayout() {
  const navigate = useNavigate();

  /* =====================================
     AUTH
  ===================================== */

  const { user, logout } = useAuth();

  const fullName =
    user?.fullName ||
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    "Student";

  const initials =
    user?.initials ||
    fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((name) => name.charAt(0).toUpperCase())
      .join("") ||
    "ST";

  const userRole =
    user?.role === "student" ? "Student" : user?.role || "Student";

  /* =====================================
     LAYOUT STATE
  ===================================== */

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notificationRef = useRef(null);

  /* =====================================
     MESSAGES
  ===================================== */

  const { getUnreadForStudent } = useMessages();

  const totalUnread = getUnreadForStudent(user?.id);

  /* =====================================
     NOTIFICATIONS
  ===================================== */

  const {
    notifications,

    unreadCount,

    markAsRead,

    markAllAsRead,
  } = useNotifications();

  const unreadMessageLabel = totalUnread > 99 ? "99+" : totalUnread;

  const unreadNotificationLabel = unreadCount > 99 ? "99+" : unreadCount;

  /* =====================================
     CLOSE SIDEBAR
  ===================================== */

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  /* =====================================
     LOGOUT
  ===================================== */

  const handleLogout = () => {
    /*
        Close UI first.
      */

    setSidebarOpen(false);

    setNotificationsOpen(false);

    /*
        Remove auth session.
      */

    logout();

    /*
        Send user back
        to login page.
      */

    navigate("/signin", {
      replace: true,
    });
  };

  /* =====================================
     OPEN SETTINGS
  ===================================== */

  const openStudentProfile = () => {
    navigate("/dashboard/settings");
  };

  /* =====================================
     CLOSE NOTIFICATIONS
  ===================================== */

  useEffect(() => {
    if (!notificationsOpen) {
      return undefined;
    }

    const handleMouseDown = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);

      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [notificationsOpen]);

  /* =====================================
     OPEN NOTIFICATION
  ===================================== */

  const openNotification = (notification) => {
    markAsRead(notification.id);

    setNotificationsOpen(false);

    if (notification.to) {
      navigate(notification.to);
    }
  };

  return (
    <div className="student-layout">
      {/* =====================================
          MOBILE OVERLAY
      ===================================== */}

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="student-sidebar-overlay"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
            }}
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* =====================================
          SIDEBAR
      ===================================== */}

      <aside className={`student-sidebar ${sidebarOpen ? "open" : ""}`}>
        {/* =====================================
            LOGO
        ===================================== */}

        <div className="student-sidebar-top">
          <Link
            to="/home"
            className="student-sidebar-logo"
            onClick={closeSidebar}
          >
            <Monitor size={22} />

            <span>E-Tutor</span>
          </Link>

          <button
            type="button"
            className="student-sidebar-close"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* =====================================
            NAVIGATION
        ===================================== */}

        <nav className="student-sidebar-nav">
          <span className="student-nav-label">MENU</span>

          {navItems.map((item) => {
            const Icon = item.icon;

            const isMessages = item.to === "/dashboard/messages";

            return (
              <NavLink
                key={item.title}
                to={item.to}
                end={item.to === "/dashboard"}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `student-nav-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={17} />

                <span className="student-nav-title">{item.title}</span>

                {isMessages && totalUnread > 0 && (
                  <motion.span
                    key={totalUnread}
                    className="student-nav-badge"
                    initial={{
                      opacity: 0,

                      scale: 0.75,
                    }}
                    animate={{
                      opacity: 1,

                      scale: 1,
                    }}
                    transition={{
                      duration: 0.18,
                    }}
                  >
                    {unreadMessageLabel}
                  </motion.span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* =====================================
            SIDEBAR BOTTOM
        ===================================== */}

        <div className="student-sidebar-bottom">
          <NavLink
            to="/dashboard/settings"
            className={({ isActive }) =>
              `student-nav-link ${isActive ? "active" : ""}`
            }
            onClick={closeSidebar}
          >
            <Settings size={17} />

            <span className="student-nav-title">Settings</span>
          </NavLink>

          <button
            type="button"
            className="student-logout"
            onClick={handleLogout}
          >
            <LogOut size={17} />

            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* =====================================
          RIGHT SIDE
      ===================================== */}

      <div className="student-layout-content">
        {/* =====================================
            TOPBAR
        ===================================== */}

        <header className="student-topbar">
          {/* =====================================
              LEFT
          ===================================== */}

          <div className="student-topbar-left">
            <button
              type="button"
              className="student-menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={21} />
            </button>

            <Link to="/home" className="student-mobile-logo">
              <Monitor size={19} />

              <span>E-Tutor</span>
            </Link>
          </div>

          {/* =====================================
              RIGHT
          ===================================== */}

          <div className="student-topbar-right">
            {/* FIND TUTOR */}

            <Link to="/tutors" className="student-find-tutor">
              <Search size={15} />
              Find a tutor
            </Link>

            {/* =====================================
                NOTIFICATIONS
            ===================================== */}

            <div className="student-notification-wrapper" ref={notificationRef}>
              <button
                type="button"
                className={`student-notification ${notificationsOpen ? "active" : ""
                  }`}
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen((current) => !current)}
              >
                <Bell size={18} />

                {unreadCount > 0 && (
                  <span className="student-notification-count">
                    {unreadNotificationLabel}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div
                    className="student-notifications-panel"
                    initial={{
                      opacity: 0,

                      y: -7,

                      scale: 0.985,
                    }}
                    animate={{
                      opacity: 1,

                      y: 0,

                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,

                      y: -5,

                      scale: 0.99,
                    }}
                    transition={{
                      duration: 0.18,

                      ease: "easeOut",
                    }}
                  >
                    {/* HEADER */}

                    <div className="student-notifications-header">
                      <div>
                        <strong>Notifications</strong>

                        <span>
                          {unreadCount > 0
                            ? `${unreadCount} unread`
                            : "You're all caught up"}
                        </span>
                      </div>

                      {unreadCount > 0 && (
                        <button type="button" onClick={markAllAsRead}>
                          <CheckCheck size={13} />
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* =====================================
                        LIST
                    ===================================== */}

                    <div className="student-notifications-list">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 8).map((notification) => (
                          <button
                            key={notification.id}
                            type="button"
                            className={`student-notification-item ${!notification.read ? "unread" : ""
                              }`}
                            onClick={() => openNotification(notification)}
                          >
                            <div
                              className={`student-notification-icon ${notification.type}`}
                            >
                              <NotificationIcon type={notification.type} />
                            </div>

                            <div className="student-notification-content">
                              <div className="student-notification-title">
                                <strong>{notification.title}</strong>

                                {!notification.read && <span />}
                              </div>

                              <p>{notification.text}</p>

                              <small>
                                {getNotificationTime(notification.createdAt)}
                              </small>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="student-notifications-empty">
                          <Bell size={20} />

                          <strong>No notifications</strong>

                          <span>New updates will appear here.</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* =====================================
                USER
            ===================================== */}

            <button
              type="button"
              className="student-user"
              onClick={openStudentProfile}
              title="Account settings"
            >
              <div className="student-user-avatar">{initials}</div>

              <div className="student-user-info">
                <strong>{fullName}</strong>

                <span>{userRole}</span>
              </div>
            </button>
          </div>
        </header>

        {/* =====================================
            PAGE CONTENT
        ===================================== */}

        <div className="student-layout-outlet">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default StudentLayout;
