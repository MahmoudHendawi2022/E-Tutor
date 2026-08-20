import { useEffect, useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router";

import { useAuth } from "../../context/AuthContext";
import "./adminPages.css";

function AdminSignIn() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [email, setEmail] = useState("admin@etutor.com");
  const [password, setPassword] = useState("123456");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role === "admin") navigate("/admin", { replace: true });
  }, [user, navigate]);

  const submit = (event) => {
    event.preventDefault();
    const result = login({ email, password, role: "admin" });
    if (!result.success) { setError(result.message); return; }
    navigate("/admin", { replace: true });
  };

  return (
    <main className="admin-signin-page">
      <form className="admin-signin-card" onSubmit={submit}>
        <div className="admin-signin-icon"><LockKeyhole size={21}/></div>
        <span>E-TUTOR ADMIN</span>
        <h1>Platform administration</h1>
        <p>Sign in to review tutors, users, lessons, payments and finance.</p>
        <label><span>Email</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/></label>
        <label><span>Password</span><div className="admin-password-input"><input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required/><button type="button" onClick={() => setShow((current) => !current)} aria-label="Toggle password">{show ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div></label>
        {error && <div className="admin-error-banner">{error}</div>}
        <button className="admin-signin-submit" type="submit">Sign in to admin</button>
        <small>Demo: admin@etutor.com / 123456</small>
      </form>
    </main>
  );
}

export default AdminSignIn;
