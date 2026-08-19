import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const NotificationsContext = createContext(null);

/*
  V2 intentionally starts with
  a clean notification store.

  This removes the old demo / seed
  notifications automatically.
*/

const STORAGE_KEY = "etutor_notifications_v2";

/* =====================================
   INITIAL DATA
===================================== */

function getInitialNotifications() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    console.error("Could not load notifications:", error);

    return [];
  }
}

/* =====================================
   ID
===================================== */

function createNotificationId() {
  return Date.now() + Math.floor(Math.random() * 10000);
}

/* =====================================
   PROVIDER
===================================== */

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(getInitialNotifications);

  /* =====================================
     SAVE
  ===================================== */

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error("Could not save notifications:", error);
    }
  }, [notifications]);

  /* =====================================
     ADD
  ===================================== */

  const addNotification = useCallback(
    ({ type = "general", title, text, to = null, key = null }) => {
      const cleanTitle = title?.trim();

      const cleanText = text?.trim();

      if (!cleanTitle || !cleanText) {
        return null;
      }

      const notification = {
        id: createNotificationId(),

        key,

        type,

        title: cleanTitle,

        text: cleanText,

        to,

        createdAt: new Date().toISOString(),

        read: false,
      };

      setNotifications((current) => {
        /*
              When key exists,
              prevent duplicate notifications.

              This is especially useful
              for automatic lesson reminders.
            */

        if (key && current.some((item) => item.key === key)) {
          return current;
        }

        return [notification, ...current];
      });

      return notification;
    },
    [],
  );

  /* =====================================
     MARK ONE AS READ
  ===================================== */

  const markAsRead = useCallback((notificationId) => {
    const numericId = Number(notificationId);

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === numericId
          ? {
              ...notification,

              read: true,
            }
          : notification,
      ),
    );
  }, []);

  /* =====================================
     MARK ALL AS READ
  ===================================== */

  const markAllAsRead = useCallback(() => {
    setNotifications((current) =>
      current.map((notification) => {
        if (notification.read) {
          return notification;
        }

        return {
          ...notification,

          read: true,
        };
      }),
    );
  }, []);

  /* =====================================
     REMOVE ONE
  ===================================== */

  const removeNotification = useCallback((notificationId) => {
    const numericId = Number(notificationId);

    setNotifications((current) =>
      current.filter((notification) => notification.id !== numericId),
    );
  }, []);

  /* =====================================
     REMOVE BY KEY PREFIX
  ===================================== */

  const removeNotificationsByKeyPrefix = useCallback((prefix) => {
    if (!prefix) {
      return;
    }

    setNotifications((current) =>
      current.filter((notification) => !notification.key?.startsWith(prefix)),
    );
  }, []);

  /* =====================================
     CLEAR
  ===================================== */

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /* =====================================
     UNREAD COUNT
  ===================================== */

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  /* =====================================
     VALUE
  ===================================== */

  const value = useMemo(
    () => ({
      notifications,

      unreadCount,

      addNotification,

      markAsRead,

      markAllAsRead,

      removeNotification,

      removeNotificationsByKeyPrefix,

      clearNotifications,
    }),
    [
      notifications,

      unreadCount,

      addNotification,

      markAsRead,

      markAllAsRead,

      removeNotification,

      removeNotificationsByKeyPrefix,

      clearNotifications,
    ],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

/* =====================================
   HOOK
===================================== */

export function useNotifications() {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationsProvider",
    );
  }

  return context;
}
