import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);
const SESSION_KEY = "etutor_auth_v2";
const ACCOUNTS_KEY = "etutor_accounts_v2";

const demoAccounts = [
  {
    id: 1,
    role: "student",
    firstName: "John",
    lastName: "Doe",
    fullName: "John Doe",
    email: "student@etutor.com",
    password: "123456",
    initials: "JD",
    phone: "+1 555 014 8291",
    country: "United States",
    language: "English",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    status: "active",
    createdAt: "2026-08-01T09:00:00.000Z",
  },
  {
    id: 101,
    role: "tutor",
    tutorId: 1,
    profileCompleted: true,
    approvalStatus: "approved",
    firstName: "Sarah",
    lastName: "Johnson",
    fullName: "Sarah Johnson",
    email: "tutor@etutor.com",
    password: "123456",
    initials: "SJ",
    phone: "+1 555 020 4215",
    country: "United States",
    language: "English",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    status: "active",
    createdAt: "2026-07-01T09:00:00.000Z",
  },
  {
    id: 9001,
    role: "admin",
    firstName: "Platform",
    lastName: "Admin",
    fullName: "Platform Admin",
    email: "admin@etutor.com",
    password: "123456",
    initials: "PA",
    language: "English",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    status: "active",
    createdAt: "2026-01-01T09:00:00.000Z",
  },
];

function createInitials(firstName, lastName) {
  return (
    `${firstName || ""} ${lastName || ""}`
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((name) => name.charAt(0).toUpperCase())
      .join("") || "ET"
  );
}

function safeAccount(account) {
  if (!account) return null;
  const { password, ...safe } = account;
  return safe;
}

function loadAccounts() {
  try {
    const stored = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
    const map = new Map();
    demoAccounts.forEach((account) => map.set(account.email.toLowerCase(), account));
    if (Array.isArray(stored)) {
      stored.forEach((account) => map.set(account.email.toLowerCase(), account));
    }
    return Array.from(map.values());
  } catch {
    return demoAccounts;
  }
}

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [accountsRaw, setAccountsRaw] = useState(loadAccounts);
  const [user, setUser] = useState(loadSession);

  useEffect(() => {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accountsRaw));
  }, [accountsRaw]);

  useEffect(() => {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  }, [user]);

  const accounts = useMemo(() => accountsRaw.map(safeAccount), [accountsRaw]);

  const login = useCallback(
    ({ email, password, role }) => {
      const cleanEmail = String(email || "").trim().toLowerCase();
      const account = accountsRaw.find(
        (item) =>
          item.email.toLowerCase() === cleanEmail &&
          item.password === password &&
          (!role || item.role === role),
      );

      if (!account) {
        return { success: false, message: "Incorrect email, password or account type." };
      }

      if (account.status === "disabled") {
        return { success: false, message: "This account is disabled." };
      }

      const safe = safeAccount(account);
      setUser(safe);
      return { success: true, user: safe };
    },
    [accountsRaw],
  );

  const register = useCallback(
    ({ firstName, lastName, email, password, role }) => {
      const cleanFirstName = String(firstName || "").trim();
      const cleanLastName = String(lastName || "").trim();
      const cleanEmail = String(email || "").trim().toLowerCase();

      if (!cleanFirstName || !cleanLastName || !cleanEmail || !password || !role) {
        return { success: false, message: "Please complete all required fields." };
      }
      if (!["student", "tutor"].includes(role)) {
        return { success: false, message: "Please select a valid account type." };
      }
      if (password.length < 8) {
        return { success: false, message: "Password must contain at least 8 characters." };
      }
      if (accountsRaw.some((item) => item.email.toLowerCase() === cleanEmail)) {
        return { success: false, message: "An account with this email already exists." };
      }

      const id = Date.now();
      const newAccount = {
        id,
        role,
        tutorId: role === "tutor" ? null : undefined,
        profileCompleted: role === "tutor" ? false : true,
        approvalStatus: role === "tutor" ? "draft" : undefined,
        firstName: cleanFirstName,
        lastName: cleanLastName,
        fullName: `${cleanFirstName} ${cleanLastName}`,
        initials: createInitials(cleanFirstName, cleanLastName),
        email: cleanEmail,
        password,
        phone: "",
        country: "",
        language: "English",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        status: "active",
        createdAt: new Date().toISOString(),
      };

      setAccountsRaw((current) => [...current, newAccount]);
      const safe = safeAccount(newAccount);
      setUser(safe);
      return { success: true, user: safe };
    },
    [accountsRaw],
  );

  const updateUser = useCallback((updates) => {
    setUser((current) => {
      if (!current) return current;
      const firstName = updates.firstName ?? current.firstName ?? "";
      const lastName = updates.lastName ?? current.lastName ?? "";
      const updated = {
        ...current,
        ...updates,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`.trim() || current.fullName,
        initials: createInitials(firstName, lastName),
      };

      setAccountsRaw((accountsCurrent) =>
        accountsCurrent.map((account) =>
          Number(account.id) === Number(current.id)
            ? { ...account, ...updated, password: account.password }
            : account,
        ),
      );
      return updated;
    });
    return true;
  }, []);


  const updateAccount = useCallback((accountId, updates) => {
    setAccountsRaw((current) =>
      current.map((account) =>
        Number(account.id) === Number(accountId)
          ? { ...account, ...updates, password: account.password }
          : account,
      ),
    );
    setUser((current) =>
      current && Number(current.id) === Number(accountId) ? { ...current, ...updates } : current,
    );
  }, []);

  const setAccountStatus = useCallback((accountId, status) => {
    setAccountsRaw((current) =>
      current.map((account) =>
        Number(account.id) === Number(accountId) ? { ...account, status } : account,
      ),
    );
  }, []);

  const getAccountById = useCallback(
    (id) => accounts.find((item) => Number(item.id) === Number(id)) || null,
    [accounts],
  );

  const logout = useCallback(() => setUser(null), []);

  const value = useMemo(
    () => ({
      user,
      accounts,
      isAuthenticated: Boolean(user),
      isStudent: user?.role === "student",
      isTutor: user?.role === "tutor",
      isAdmin: user?.role === "admin",
      login,
      register,
      updateUser,
      updateAccount,
      setAccountStatus,
      getAccountById,
      logout,
    }),
    [user, accounts, login, register, updateUser, updateAccount, setAccountStatus, getAccountById, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
