import { storageService } from "../storage/storage.service";

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

export const authService = {
  loadAccounts() {
    const stored = storageService.getItem(ACCOUNTS_KEY, []);
    const map = new Map();
    demoAccounts.forEach((account) => map.set(account.email.toLowerCase(), account));
    if (Array.isArray(stored)) {
      stored.forEach((account) => map.set(account.email.toLowerCase(), account));
    }
    return Array.from(map.values());
  },

  saveAccounts(accounts) {
    storageService.setItem(ACCOUNTS_KEY, accounts);
  },

  loadSession() {
    return storageService.getItem(SESSION_KEY, null);
  },

  saveSession(user) {
    if (user) {
      storageService.setItem(SESSION_KEY, user);
    } else {
      storageService.removeItem(SESSION_KEY);
    }
  },

  login(accountsRaw, email, password, role) {
    const cleanEmail = String(email || "").trim().toLowerCase();
    const account = accountsRaw.find(
      (item) =>
        item.email.toLowerCase() === cleanEmail &&
        item.password === password &&
        (!role || item.role === role)
    );

    if (!account) {
      return { success: false, message: "Incorrect email, password or account type." };
    }

    if (account.status === "disabled") {
      return { success: false, message: "This account is disabled." };
    }

    const safe = safeAccount(account);
    return { success: true, user: safe };
  },

  register(accountsRaw, { firstName, lastName, email, password, role }) {
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

    return { success: true, account: newAccount, user: safeAccount(newAccount) };
  },

  createInitials
};
