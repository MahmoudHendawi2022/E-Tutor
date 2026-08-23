import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpenCheck,
  CircleDollarSign,
  Database,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  ReceiptText,
  Settings,
  ShieldCheck,
  Users,
  WalletCards,
  X,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import "./adminLayout.css";

const nav = [
  { label: "Overview", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Tutor applications", to: "/admin/tutor-applications", icon: ShieldCheck },
  { label: "Tutors", to: "/admin/tutors", icon: GraduationCap },
  { label: "Students", to: "/admin/students", icon: Users },
  { label: "Lessons & bookings", to: "/admin/lessons", icon: BookOpenCheck },
  { label: "Payments", to: "/admin/payments", icon: ReceiptText },
  { label: "Finance", to: "/admin/finance", icon: CircleDollarSign },
  { label: "Payouts", to: "/admin/payouts", icon: WalletCards },
  { label: "Reports", to: "/admin/reports", icon: BarChart3 },
  { label: "Master data", to: "/admin/master-data", icon: Database },
  { label: "Settings", to: "/admin/settings", icon: Settings },
];

function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/signin", { replace: true });
  };

  return (
    <div className="admin-shell">
      {open && <button className="admin-overlay" aria-label="Close menu" onClick={() => setOpen(false)} />}
      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        <div className="admin-brand"><div>ET</div><section><strong>E-Tutor</strong><span>Administration</span></section><button onClick={() => setOpen(false)}><X size={18} /></button></div>
        <nav>
          <span className="admin-nav-label">PLATFORM</span>
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setOpen(false)} className={({ isActive }) => `admin-nav-link ${isActive ? "active" : ""}`}>
                <Icon size={16} /><span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="admin-sidebar-bottom">
          <div className="admin-account"><div>{user?.initials || "AD"}</div><section><strong>{user?.fullName || "Admin"}</strong><span>{user?.email}</span></section></div>
          <button onClick={handleLogout}><LogOut size={16} />Sign out</button>
        </div>
      </aside>
      <div className="admin-content">
        <header className="admin-topbar"><button className="admin-menu" onClick={() => setOpen(true)}><Menu size={20} /></button><div><strong>Platform Administration</strong><span>Full operational and financial control</span></div></header>
        <div className="admin-outlet"><Outlet /></div>
      </div>
    </div>
  );
}

export default AdminLayout;
