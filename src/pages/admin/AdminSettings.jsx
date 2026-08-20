import { useEffect, useState } from "react";
import { Save, RotateCcw } from "lucide-react";

import { usePlatformSettings } from "../../context/PlatformSettingsContext";
import "./adminPages.css";

function AdminSettings() {
  const { settings, updateSettings, resetSettings } = usePlatformSettings();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => setForm(settings), [settings]);

  const change = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  const submit = (event) => {
    event.preventDefault();
    const commissionRate = Number(form.commissionRate);
    const minimumPayout = Number(form.minimumPayout);
    if (!Number.isFinite(commissionRate) || commissionRate < 0 || commissionRate > 100) return;
    if (!Number.isFinite(minimumPayout) || minimumPayout < 0) return;
    updateSettings({ ...form, commissionRate, minimumPayout });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <main className="admin-page">
      <div className="admin-page-head">
        <div><span>PLATFORM SETTINGS</span><h1>Business rules</h1><p>Global financial and operational configuration used by the frontend demo.</p></div>
        <button className="admin-button secondary" type="button" onClick={() => { if (window.confirm("Reset platform settings to defaults?")) resetSettings(); }}><RotateCcw size={13}/> Reset</button>
      </div>

      {saved && <div className="admin-success-banner">Settings saved successfully.</div>}

      <form className="admin-settings-form" onSubmit={submit}>
        <section className="admin-section">
          <div className="admin-section-head"><div><h2>General</h2><p>Platform name and base currency.</p></div></div>
          <div className="admin-form-grid">
            <Field label="Platform name"><input name="platformName" value={form.platformName} onChange={change}/></Field>
            <Field label="Default currency"><select name="defaultCurrency" value={form.defaultCurrency} onChange={change}><option>USD</option><option>EUR</option><option>GBP</option><option>EGP</option><option>SAR</option><option>AED</option></select></Field>
          </div>
        </section>

        <section className="admin-section">
          <div className="admin-section-head"><div><h2>Finance</h2><p>Commission is snapshotted on each new payment so historical transactions do not change when you update the rate.</p></div></div>
          <div className="admin-form-grid">
            <Field label="Platform commission (%)"><input name="commissionRate" type="number" min="0" max="100" step="0.01" value={form.commissionRate} onChange={change}/></Field>
            <Field label="Minimum tutor payout"><input name="minimumPayout" type="number" min="0" step="0.01" value={form.minimumPayout} onChange={change}/></Field>
          </div>
          <label className="admin-check-row"><input type="checkbox" name="allowPayLater" checked={Boolean(form.allowPayLater)} onChange={change}/><span><strong>Allow Pay Later</strong><small>Frontend demo can reserve a lesson with a pending payment. A real backend should enforce the actual payment deadline.</small></span></label>
        </section>

        <section className="admin-section">
          <div className="admin-section-head"><div><h2>Tutor approval</h2><p>Approval is intentionally manual to protect platform quality.</p></div></div>
          <label className="admin-check-row disabled"><input type="checkbox" checked={false} readOnly/><span><strong>Automatic tutor approval disabled</strong><small>New tutor profiles remain pending until an administrator reviews and approves them.</small></span></label>
        </section>

        <div className="admin-form-actions"><button className="admin-button primary" type="submit"><Save size={13}/> Save settings</button></div>
      </form>
    </main>
  );
}

function Field({ label, children }) { return <label className="admin-field"><span>{label}</span>{children}</label>; }

export default AdminSettings;
