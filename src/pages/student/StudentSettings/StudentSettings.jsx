import { useState } from "react";

import {
  Bell,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { AnimatePresence, motion } from "motion/react";

import { useAuth } from "../../../context/AuthContext";

import "./studentSettings.css";

const tabs = [
  {
    value: "profile",

    label: "Profile",

    icon: UserRound,
  },

  {
    value: "account",

    label: "Account",

    icon: Mail,
  },

  {
    value: "notifications",

    label: "Notifications",

    icon: Bell,
  },

  {
    value: "password",

    label: "Password",

    icon: LockKeyhole,
  },
];

const pageVariants = {
  hidden: {
    opacity: 0,
  },

  visible: {
    opacity: 1,

    transition: {
      staggerChildren: 0.06,

      delayChildren: 0.03,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,

    y: 10,
  },

  visible: {
    opacity: 1,

    y: 0,

    transition: {
      type: "tween",

      duration: 0.3,

      ease: "easeOut",
    },
  },
};

/* =====================================
   INITIALS
===================================== */

function getInitials(firstName, lastName) {
  return `${firstName || ""} ${lastName || ""}`
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join("");
}

/* =====================================
   COMPONENT
===================================== */

function StudentSettings() {
  const {
    user,

    updateUser,
  } = useAuth();

  /* =====================================
     TABS
  ===================================== */

  const [activeTab, setActiveTab] = useState("profile");

  /* =====================================
     SUCCESS
  ===================================== */

  const [saved, setSaved] = useState(false);

  /* =====================================
     PASSWORD VISIBILITY
  ===================================== */

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* =====================================
     PROFILE
  ===================================== */

  const [profile, setProfile] = useState(() => ({
    firstName: user?.firstName || "",

    lastName: user?.lastName || "",

    headline: user?.headline || "",

    bio: user?.bio || "",

    country: user?.country || "United States",

    timezone:
      user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
  }));

  /* =====================================
     ACCOUNT
  ===================================== */

  const [account, setAccount] = useState(() => ({
    email: user?.email || "",

    phone: user?.phone || "",

    language: user?.language || "English",
  }));

  /* =====================================
     NOTIFICATION PREFERENCES
  ===================================== */

  const [notifications, setNotifications] = useState({
    lessonReminders: true,

    messages: true,

    bookingUpdates: true,

    tutorUpdates: true,

    promotions: false,

    emailNotifications: true,
  });

  /* =====================================
     PASSWORDS
  ===================================== */

  const [passwords, setPasswords] = useState({
    currentPassword: "",

    newPassword: "",

    confirmPassword: "",
  });

  /* =====================================
     DISPLAY USER
  ===================================== */

  const displayFirstName = user?.firstName || profile.firstName || "Student";

  const displayLastName = user?.lastName || profile.lastName || "";

  const displayName =
    user?.fullName || `${displayFirstName} ${displayLastName}`.trim();

  const initials =
    user?.initials || getInitials(displayFirstName, displayLastName) || "ST";

  /* =====================================
     SAVED MESSAGE
  ===================================== */

  const showSavedMessage = () => {
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 1800);
  };

  /* =====================================
     INPUT HANDLERS
  ===================================== */

  const updateProfile = (event) => {
    const { name, value } = event.target;

    setProfile((current) => ({
      ...current,

      [name]: value,
    }));
  };

  const updateAccount = (event) => {
    const { name, value } = event.target;

    setAccount((current) => ({
      ...current,

      [name]: value,
    }));
  };

  const updatePassword = (event) => {
    const { name, value } = event.target;

    setPasswords((current) => ({
      ...current,

      [name]: value,
    }));
  };

  /* =====================================
     NOTIFICATIONS
  ===================================== */

  const toggleNotification = (key) => {
    setNotifications((current) => ({
      ...current,

      [key]: !current[key],
    }));
  };

  /* =====================================
     SAVE PROFILE
  ===================================== */

  const handleProfileSubmit = (event) => {
    event.preventDefault();

    const firstName = profile.firstName.trim();

    const lastName = profile.lastName.trim();

    if (!firstName || !lastName) {
      return;
    }

    updateUser({
      firstName,

      lastName,

      headline: profile.headline.trim(),

      bio: profile.bio.trim(),

      country: profile.country,

      timezone: profile.timezone.trim(),
    });

    showSavedMessage();
  };

  /* =====================================
     SAVE ACCOUNT
  ===================================== */

  const handleAccountSubmit = (event) => {
    event.preventDefault();

    const email = account.email.trim();

    if (!email) {
      return;
    }

    updateUser({
      email,

      phone: account.phone.trim(),

      language: account.language,
    });

    showSavedMessage();
  };

  /* =====================================
     SAVE NOTIFICATIONS
  ===================================== */

  const handleNotificationsSubmit = (event) => {
    event.preventDefault();

    /*
        Front-end preference demo.

        Later this object should be
        sent to the API / profile.
      */

    showSavedMessage();
  };

  /* =====================================
     PASSWORD
  ===================================== */

  const handlePasswordSubmit = (event) => {
    event.preventDefault();

    if (
      !passwords.currentPassword ||
      !passwords.newPassword ||
      !passwords.confirmPassword
    ) {
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      return;
    }

    /*
        Backend password endpoint
        will replace this later.
      */

    setPasswords({
      currentPassword: "",

      newPassword: "",

      confirmPassword: "",
    });

    showSavedMessage();
  };

  return (
    <motion.main
      className="settings-page"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* =====================================
          HEADER
      ===================================== */}

      <motion.div className="settings-header" variants={itemVariants}>
        <div>
          <span className="settings-eyebrow">ACCOUNT</span>

          <h1>Settings</h1>

          <p>Manage your profile, account preferences and security.</p>
        </div>
      </motion.div>

      {/* =====================================
          SUCCESS MESSAGE
      ===================================== */}

      <AnimatePresence>
        {saved && (
          <motion.div
            className="settings-saved-message"
            initial={{
              opacity: 0,

              y: -8,
            }}
            animate={{
              opacity: 1,

              y: 0,
            }}
            exit={{
              opacity: 0,

              y: -6,
            }}
          >
            <CheckCircle2 size={15} />
            Changes saved successfully.
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================
          LAYOUT
      ===================================== */}

      <motion.div className="settings-layout" variants={itemVariants}>
        {/* =====================================
            SIDEBAR
        ===================================== */}

        <aside className="settings-nav">
          <div className="settings-profile-small">
            <div className="settings-avatar">{initials}</div>

            <div>
              <strong>{displayName}</strong>

              <span>Student</span>
            </div>
          </div>

          <div className="settings-nav-divider" />

          <nav>
            {tabs.map((tab) => {
              const Icon = tab.icon;

              const active = activeTab === tab.value;

              return (
                <button
                  key={tab.value}
                  type="button"
                  className={active ? "active" : ""}
                  onClick={() => setActiveTab(tab.value)}
                >
                  {active && (
                    <motion.span
                      className="settings-nav-active"
                      layoutId="settings-active-tab"
                      transition={{
                        type: "spring",

                        stiffness: 500,

                        damping: 38,
                      }}
                    />
                  )}

                  <span className="settings-nav-content">
                    <Icon size={16} />

                    {tab.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* =====================================
            CONTENT
        ===================================== */}

        <section className="settings-content">
          <AnimatePresence mode="wait">
            {/* =====================================
                PROFILE
            ===================================== */}

            {activeTab === "profile" && (
              <motion.div
                key="profile"
                className="settings-panel"
                initial={{
                  opacity: 0,

                  x: 5,
                }}
                animate={{
                  opacity: 1,

                  x: 0,
                }}
                exit={{
                  opacity: 0,

                  x: -5,
                }}
                transition={{
                  duration: 0.2,
                }}
              >
                <div className="settings-panel-header">
                  <h2>Profile information</h2>

                  <p>Update how your profile appears across E-Tutor.</p>
                </div>

                <form onSubmit={handleProfileSubmit}>
                  {/* Avatar */}

                  <div className="settings-photo-section">
                    <div className="settings-photo">{initials}</div>

                    <div>
                      <strong>Profile photo</strong>

                      <span>JPG or PNG. Maximum 5 MB.</span>

                      <div className="settings-photo-actions">
                        <button type="button">Upload photo</button>

                        <button type="button" className="remove">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="settings-form-divider" />

                  {/* Names */}

                  <div className="settings-form-grid">
                    <div className="settings-field">
                      <label htmlFor="firstName">First name</label>

                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={profile.firstName}
                        onChange={updateProfile}
                      />
                    </div>

                    <div className="settings-field">
                      <label htmlFor="lastName">Last name</label>

                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={profile.lastName}
                        onChange={updateProfile}
                      />
                    </div>
                  </div>

                  {/* Headline */}

                  <div className="settings-field">
                    <label htmlFor="headline">Headline</label>

                    <input
                      id="headline"
                      name="headline"
                      type="text"
                      value={profile.headline}
                      onChange={updateProfile}
                    />

                    <small>
                      A short description about your learning goals.
                    </small>
                  </div>

                  {/* Bio */}

                  <div className="settings-field">
                    <label htmlFor="bio">About you</label>

                    <textarea
                      id="bio"
                      name="bio"
                      rows="5"
                      value={profile.bio}
                      onChange={updateProfile}
                    />
                  </div>

                  <div className="settings-form-grid">
                    <div className="settings-field">
                      <label htmlFor="country">Country</label>

                      <select
                        id="country"
                        name="country"
                        value={profile.country}
                        onChange={updateProfile}
                      >
                        <option>United States</option>

                        <option>Egypt</option>

                        <option>United Kingdom</option>

                        <option>Canada</option>

                        <option>Germany</option>
                      </select>
                    </div>

                    <div className="settings-field">
                      <label htmlFor="timezone">Timezone</label>

                      <input
                        id="timezone"
                        name="timezone"
                        type="text"
                        value={profile.timezone}
                        onChange={updateProfile}
                      />
                    </div>
                  </div>

                  <div className="settings-form-actions">
                    <button type="submit" className="settings-save">
                      <Save size={14} />
                      Save changes
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* =====================================
                ACCOUNT
            ===================================== */}

            {activeTab === "account" && (
              <motion.div
                key="account"
                className="settings-panel"
                initial={{
                  opacity: 0,

                  x: 5,
                }}
                animate={{
                  opacity: 1,

                  x: 0,
                }}
                exit={{
                  opacity: 0,

                  x: -5,
                }}
                transition={{
                  duration: 0.2,
                }}
              >
                <div className="settings-panel-header">
                  <h2>Account details</h2>

                  <p>
                    Manage your contact information and account preferences.
                  </p>
                </div>

                <form onSubmit={handleAccountSubmit}>
                  <div className="settings-field">
                    <label htmlFor="email">Email address</label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={account.email}
                      onChange={updateAccount}
                    />

                    <div className="settings-verified">
                      <CheckCircle2 size={12} />
                      Verified email
                    </div>
                  </div>

                  <div className="settings-field">
                    <label htmlFor="phone">Phone number</label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={account.phone}
                      onChange={updateAccount}
                    />
                  </div>

                  <div className="settings-field">
                    <label htmlFor="language">Interface language</label>

                    <select
                      id="language"
                      name="language"
                      value={account.language}
                      onChange={updateAccount}
                    >
                      <option>English</option>

                      <option>Arabic</option>

                      <option>French</option>

                      <option>Spanish</option>
                    </select>
                  </div>

                  <div className="settings-form-actions">
                    <button type="submit" className="settings-save">
                      <Save size={14} />
                      Save changes
                    </button>
                  </div>

                  <div className="settings-danger">
                    <div>
                      <strong>Delete account</strong>

                      <span>
                        Permanently delete your E-Tutor account and associated
                        data.
                      </span>
                    </div>

                    <button type="button">Delete account</button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* =====================================
                NOTIFICATIONS
            ===================================== */}

            {activeTab === "notifications" && (
              <motion.div
                key="notifications"
                className="settings-panel"
                initial={{
                  opacity: 0,

                  x: 5,
                }}
                animate={{
                  opacity: 1,

                  x: 0,
                }}
                exit={{
                  opacity: 0,

                  x: -5,
                }}
                transition={{
                  duration: 0.2,
                }}
              >
                <div className="settings-panel-header">
                  <h2>Notifications</h2>

                  <p>Choose what you want to be notified about.</p>
                </div>

                <form onSubmit={handleNotificationsSubmit}>
                  <div className="notification-group">
                    <h3>Learning activity</h3>

                    <NotificationRow
                      title="Lesson reminders"
                      description="Remind me before scheduled lessons."
                      checked={notifications.lessonReminders}
                      onChange={() => toggleNotification("lessonReminders")}
                    />

                    <NotificationRow
                      title="New messages"
                      description="Notify me when a tutor sends a message."
                      checked={notifications.messages}
                      onChange={() => toggleNotification("messages")}
                    />

                    <NotificationRow
                      title="Booking updates"
                      description="Changes, confirmations and cancellations."
                      checked={notifications.bookingUpdates}
                      onChange={() => toggleNotification("bookingUpdates")}
                    />

                    <NotificationRow
                      title="Tutor updates"
                      description="Availability and updates from your tutors."
                      checked={notifications.tutorUpdates}
                      onChange={() => toggleNotification("tutorUpdates")}
                    />
                  </div>

                  <div className="settings-form-divider" />

                  <div className="notification-group">
                    <h3>Other notifications</h3>

                    <NotificationRow
                      title="Offers and promotions"
                      description="Product news, offers and recommendations."
                      checked={notifications.promotions}
                      onChange={() => toggleNotification("promotions")}
                    />

                    <NotificationRow
                      title="Email notifications"
                      description="Allow notifications to be sent by email."
                      checked={notifications.emailNotifications}
                      onChange={() => toggleNotification("emailNotifications")}
                    />
                  </div>

                  <div className="settings-form-actions">
                    <button type="submit" className="settings-save">
                      <Save size={14} />
                      Save preferences
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* =====================================
                PASSWORD
            ===================================== */}

            {activeTab === "password" && (
              <motion.div
                key="password"
                className="settings-panel"
                initial={{
                  opacity: 0,

                  x: 5,
                }}
                animate={{
                  opacity: 1,

                  x: 0,
                }}
                exit={{
                  opacity: 0,

                  x: -5,
                }}
                transition={{
                  duration: 0.2,
                }}
              >
                <div className="settings-panel-header">
                  <h2>Password & security</h2>

                  <p>Update your password and protect your account.</p>
                </div>

                <div className="settings-security-note">
                  <div>
                    <ShieldCheck size={18} />
                  </div>

                  <div>
                    <strong>Keep your account secure</strong>

                    <span>
                      Use at least 8 characters with letters, numbers and
                      symbols.
                    </span>
                  </div>
                </div>

                <form onSubmit={handlePasswordSubmit}>
                  <PasswordField
                    label="Current password"
                    name="currentPassword"
                    value={passwords.currentPassword}
                    show={showCurrentPassword}
                    onToggle={() =>
                      setShowCurrentPassword((current) => !current)
                    }
                    onChange={updatePassword}
                  />

                  <PasswordField
                    label="New password"
                    name="newPassword"
                    value={passwords.newPassword}
                    show={showNewPassword}
                    onToggle={() => setShowNewPassword((current) => !current)}
                    onChange={updatePassword}
                  />

                  <PasswordField
                    label="Confirm new password"
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    show={showConfirmPassword}
                    onToggle={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    onChange={updatePassword}
                  />

                  {passwords.confirmPassword &&
                    passwords.newPassword !== passwords.confirmPassword && (
                      <p className="settings-password-error">
                        Passwords do not match.
                      </p>
                    )}

                  <div className="settings-form-actions">
                    <button
                      type="submit"
                      className="settings-save"
                      disabled={
                        !passwords.currentPassword ||
                        !passwords.newPassword ||
                        !passwords.confirmPassword ||
                        passwords.newPassword !== passwords.confirmPassword
                      }
                    >
                      <LockKeyhole size={14} />
                      Update password
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </motion.div>
    </motion.main>
  );
}

/* =====================================
   NOTIFICATION ROW
===================================== */

function NotificationRow({ title, description, checked, onChange }) {
  return (
    <div className="notification-row">
      <div>
        <strong>{title}</strong>

        <span>{description}</span>
      </div>

      <button
        type="button"
        className={`settings-switch ${checked ? "active" : ""}`}
        onClick={onChange}
        aria-pressed={checked}
      >
        <motion.span
          animate={{
            x: checked ? 17 : 0,
          }}
          transition={{
            type: "spring",

            stiffness: 500,

            damping: 35,
          }}
        />
      </button>
    </div>
  );
}

/* =====================================
   PASSWORD FIELD
===================================== */

function PasswordField({ label, name, value, show, onToggle, onChange }) {
  return (
    <div className="settings-field">
      <label htmlFor={name}>{label}</label>

      <div className="settings-password-input">
        <input
          id={name}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete="off"
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

export default StudentSettings;
