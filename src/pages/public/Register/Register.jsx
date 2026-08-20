import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, GraduationCap, UserRound } from "lucide-react";
import { motion } from "motion/react";

import { useAuth } from "../../../context/AuthContext";
import "./register.css";

const containerVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "tween", duration: 0.45, ease: "easeOut", staggerChildren: 0.06, delayChildren: 0.05 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 9 },
  visible: { opacity: 1, y: 0, transition: { type: "tween", duration: 0.32, ease: "easeOut" } },
};

function Register() {
  const navigate = useNavigate();
  const { user, isAuthenticated, register } = useAuth();
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (user.role === "admin") { navigate("/admin", { replace: true }); return; }
    if (user.role === "tutor" && !user.profileCompleted) { navigate("/tutor/onboarding", { replace: true }); return; }
    if (user.role === "tutor") { navigate("/tutor/dashboard", { replace: true }); return; }
    navigate("/dashboard", { replace: true });
  }, [isAuthenticated, user, navigate]);

  const change = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const submit = (event) => {
    event.preventDefault();
    if (loading) return;
    const parts = form.fullName.trim().split(/\s+/).filter(Boolean);
    const firstName = parts[0] || "";
    const lastName = parts.slice(1).join(" ");
    if (!firstName || !lastName) { setError("Please enter your first and last name."); return; }
    if (form.password.length < 8) { setError("Password must contain at least 8 characters."); return; }
    if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    const result = register({ firstName, lastName, email: form.email, password: form.password, role });
    if (!result.success) { setError(result.message || "Could not create your account."); setLoading(false); return; }
    navigate(result.user.role === "tutor" ? "/tutor/onboarding" : "/dashboard", { replace: true });
  };

  return (
    <main className="register-page">
      <motion.section className="register-card" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div className="register-heading" variants={itemVariants}>
          <h1>Create your account</h1>
          <p>{role === "tutor" ? "Create your account, complete your tutor application, then wait for E-Tutor approval." : "Join E-Tutor and start your learning journey."}</p>
        </motion.div>

        <motion.div className="register-role" variants={itemVariants}>
          <span className="register-role-label">I want to join as</span>
          <div className="register-role-selector">
            <RoleButton active={role === "student"} icon={UserRound} label="Student" onClick={() => { setRole("student"); setError(""); }}/>
            <RoleButton active={role === "tutor"} icon={GraduationCap} label="Tutor" onClick={() => { setRole("tutor"); setError(""); }}/>
          </div>
          {role === "tutor" && <motion.div className="register-tutor-note" initial={{ opacity:0,y:-3 }} animate={{ opacity:1,y:0 }}><GraduationCap size={14}/><span>Your tutor profile will not be public until it is reviewed and approved by E-Tutor.</span></motion.div>}
        </motion.div>

        <form onSubmit={submit}>
          <motion.div className="register-field" variants={itemVariants}><label htmlFor="register-name">Full name</label><input id="register-name" name="fullName" value={form.fullName} onChange={change} type="text" placeholder="Enter your first and last name" autoComplete="name" disabled={loading} required/></motion.div>
          <motion.div className="register-field" variants={itemVariants}><label htmlFor="register-email">Email address</label><input id="register-email" name="email" value={form.email} onChange={change} type="email" placeholder="you@example.com" autoComplete="email" disabled={loading} required/></motion.div>
          <motion.div className="register-field" variants={itemVariants}>
            <label htmlFor="register-password">Password</label>
            <div className="register-password-field"><input id="register-password" name="password" value={form.password} onChange={change} type={showPassword ? "text" : "password"} placeholder="Minimum 8 characters" autoComplete="new-password" minLength={8} disabled={loading} required/><button type="button" className="register-password-toggle" onClick={() => setShowPassword((current) => !current)} aria-label="Toggle password">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div>
            <span className="register-field-hint">Must be at least 8 characters.</span>
          </motion.div>
          <motion.div className="register-field" variants={itemVariants}>
            <label htmlFor="register-confirm-password">Confirm password</label>
            <div className="register-password-field"><input id="register-confirm-password" name="confirmPassword" value={form.confirmPassword} onChange={change} type={showConfirmPassword ? "text" : "password"} placeholder="Re-enter your password" autoComplete="new-password" minLength={8} disabled={loading} required/><button type="button" className="register-password-toggle" onClick={() => setShowConfirmPassword((current) => !current)} aria-label="Toggle confirmation password">{showConfirmPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button></div>
          </motion.div>
          {error && <motion.div className="register-error" initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}}>{error}</motion.div>}
          <motion.label className="register-terms" variants={itemVariants}><input type="checkbox" disabled={loading} required/><span>I agree to the E-Tutor Terms of Service and Privacy Policy.</span></motion.label>
          <motion.button type="submit" className="register-submit" variants={itemVariants} disabled={loading} whileHover={loading ? {} : {y:-1}} whileTap={loading ? {} : {scale:.985}}>{loading ? "Creating account..." : role === "tutor" ? "Create tutor account" : "Create student account"}</motion.button>
        </form>
        <motion.p className="register-switch" variants={itemVariants}>Already have an account?<Link to="/signin">Sign in</Link></motion.p>
      </motion.section>
    </main>
  );
}

function RoleButton({ active, icon: Icon, label, onClick }) {
  return <button type="button" className={active ? "active" : ""} onClick={onClick}>{active && <motion.span className="register-role-active" layoutId="register-active-role" transition={{type:"spring",stiffness:500,damping:38}}/>}<span className="register-role-text"><Icon size={14}/>{label}</span></button>;
}

export default Register;
