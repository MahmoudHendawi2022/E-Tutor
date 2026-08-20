import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authService } from "../services/auth/auth.service";

const AuthContext = createContext(null);

function safeAccount(account) {
  if (!account) return null;
  const { password, ...safe } = account;
  return safe;
}

export function AuthProvider({ children }) {
  const [accountsRaw, setAccountsRaw] = useState(() => authService.loadAccounts());
  const [user, setUser] = useState(() => authService.loadSession());

  useEffect(() => {
    authService.saveAccounts(accountsRaw);
  }, [accountsRaw]);

  useEffect(() => {
    authService.saveSession(user);
  }, [user]);

  const accounts = useMemo(() => accountsRaw.map(safeAccount), [accountsRaw]);

  const login = useCallback(
    ({ email, password, role }) => {
      const result = authService.login(accountsRaw, email, password, role);
      if (result.success) {
        setUser(result.user);
      }
      return result;
    },
    [accountsRaw],
  );

  const register = useCallback(
    ({ firstName, lastName, email, password, role }) => {
      const result = authService.register(accountsRaw, { firstName, lastName, email, password, role });
      if (result.success) {
        setAccountsRaw((current) => [...current, result.account]);
        setUser(result.user);
      }
      return result;
    },
    [accountsRaw],
  );

  const updateUser = useCallback((updates) => {
    setUser((current) => {
      if (!current) return current;
      const { user: updatedUser, accounts: updatedAccounts } = authService.updateUser(current, updates, accountsRaw);
      setAccountsRaw(updatedAccounts);
      return updatedUser;
    });
    return true;
  }, [accountsRaw]);

  const updateAccount = useCallback((accountId, updates) => {
    setUser((current) => {
      const { user: updatedUser, accounts: updatedAccounts } = authService.updateAccount(accountId, updates, accountsRaw, current);
      setAccountsRaw(updatedAccounts);
      return updatedUser;
    });
  }, [accountsRaw]);

  const setAccountStatus = useCallback((accountId, status) => {
    setAccountsRaw((current) => authService.setAccountStatus(accountId, status, current));
  }, []);

  const getAccountById = useCallback(
    (id) => accounts.find((item) => Number(item.id) === Number(id)) || null,
    [accounts],
  );

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

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
