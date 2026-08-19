import { useState } from "react";
import { Plus, RotateCcw } from "lucide-react";

import { useMasterData } from "../context/MasterDataContext";
import "./adminPages.css";

function AdminMasterData() {
  const {
    masterData,
    addLookup,
    toggleLookup,
    addSubject,
    toggleSubject,
    addBranch,
    toggleBranch,
    addCountry,
    toggleCountry,
    addCity,
    toggleCity,
    addUniversity,
    toggleUniversity,
    resetMasterData,
  } = useMasterData();

  const [tab, setTab] = useState("subjects");

  return (
    <main className="admin-page">
      <div className="admin-page-head">
        <div>
          <span>MASTER DATA</span>
          <h1>Platform choices</h1>
          <p>Control the verified choices tutors select during onboarding and profile updates.</p>
        </div>
        <button className="admin-button secondary" type="button" onClick={() => {
          if (window.confirm("Reset all master data to the demo defaults?")) resetMasterData();
        }}><RotateCcw size={13}/> Reset demo data</button>
      </div>

      <div className="admin-tabs">
        {[
          ["subjects", "Subjects & branches"],
          ["locations", "Countries, cities & universities"],
          ["lookups", "Titles, degrees, languages & levels"],
        ].map(([value, label]) => (
          <button key={value} type="button" className={tab === value ? "active" : ""} onClick={() => setTab(value)}>{label}</button>
        ))}
      </div>

      {tab === "subjects" && (
        <SubjectManager
          subjects={masterData.subjects}
          addSubject={addSubject}
          toggleSubject={toggleSubject}
          addBranch={addBranch}
          toggleBranch={toggleBranch}
        />
      )}

      {tab === "locations" && (
        <LocationManager
          countries={masterData.countries}
          addCountry={addCountry}
          toggleCountry={toggleCountry}
          addCity={addCity}
          toggleCity={toggleCity}
          addUniversity={addUniversity}
          toggleUniversity={toggleUniversity}
        />
      )}

      {tab === "lookups" && (
        <LookupManager data={masterData} addLookup={addLookup} toggleLookup={toggleLookup} />
      )}
    </main>
  );
}

function SubjectManager({ subjects, addSubject, toggleSubject, addBranch, toggleBranch }) {
  const [subjectName, setSubjectName] = useState("");
  return (
    <section className="admin-section">
      <div className="admin-section-head"><div><h2>Subjects</h2><p>Only active subjects and branches are selectable by tutors.</p></div></div>
      <InlineAdd value={subjectName} setValue={setSubjectName} placeholder="New subject" onAdd={() => {
        if (subjectName.trim()) { addSubject(subjectName.trim()); setSubjectName(""); }
      }}/>
      <div className="admin-master-list">
        {subjects.map((subject) => (
          <SubjectRow key={subject.id} subject={subject} onToggle={() => toggleSubject(subject.id)} onAddBranch={(label) => addBranch(subject.id, label)} onToggleBranch={(branchId) => toggleBranch(subject.id, branchId)} />
        ))}
      </div>
    </section>
  );
}

function SubjectRow({ subject, onToggle, onAddBranch, onToggleBranch }) {
  const [value, setValue] = useState("");
  return (
    <article className="admin-master-card">
      <div className="admin-master-head"><div><strong>{subject.label}</strong><span>{subject.branches.length} branches</span></div><StatusToggle active={subject.active !== false} onClick={onToggle}/></div>
      <div className="admin-master-tags">
        {subject.branches.map((branch) => <button type="button" key={branch.id} className={branch.active === false ? "inactive" : ""} onClick={() => onToggleBranch(branch.id)}>{branch.label}</button>)}
      </div>
      <InlineAdd value={value} setValue={setValue} placeholder="Add specialization / branch" onAdd={() => { if (value.trim()) { onAddBranch(value.trim()); setValue(""); } }}/>
    </article>
  );
}

function LocationManager({ countries, addCountry, toggleCountry, addCity, toggleCity, addUniversity, toggleUniversity }) {
  const [country, setCountry] = useState({ code: "", label: "", timezone: "" });
  const submitCountry = () => {
    if (!country.code.trim() || !country.label.trim()) return;
    addCountry({ code: country.code.trim(), label: country.label.trim(), timezone: country.timezone.trim() });
    setCountry({ code: "", label: "", timezone: "" });
  };
  return (
    <section className="admin-section">
      <div className="admin-section-head"><div><h2>Locations & universities</h2><p>Verified country-dependent city, timezone and university options.</p></div></div>
      <div className="admin-country-add">
        <input value={country.code} maxLength={3} onChange={(e) => setCountry((current) => ({ ...current, code: e.target.value.toUpperCase() }))} placeholder="Code (EG)"/>
        <input value={country.label} onChange={(e) => setCountry((current) => ({ ...current, label: e.target.value }))} placeholder="Country name"/>
        <input value={country.timezone} onChange={(e) => setCountry((current) => ({ ...current, timezone: e.target.value }))} placeholder="Timezone (Africa/Cairo)"/>
        <button className="admin-button secondary" type="button" onClick={submitCountry}><Plus size={13}/> Add country</button>
      </div>
      <div className="admin-master-list">
        {countries.map((item) => <CountryRow key={item.code} country={item} onToggle={() => toggleCountry(item.code)} onAddCity={(label) => addCity(item.code, label)} onToggleCity={(id) => toggleCity(item.code, id)} onAddUniversity={(label) => addUniversity(item.code, label)} onToggleUniversity={(id) => toggleUniversity(item.code, id)} />)}
      </div>
    </section>
  );
}

function CountryRow({ country, onToggle, onAddCity, onToggleCity, onAddUniversity, onToggleUniversity }) {
  const [city, setCity] = useState("");
  const [university, setUniversity] = useState("");
  return (
    <article className="admin-master-card">
      <div className="admin-master-head"><div><strong>{country.label}</strong><span>{country.timezones?.join(", ") || "Timezone not set"}</span></div><StatusToggle active={country.active !== false} onClick={onToggle}/></div>
      <h3>Cities</h3>
      <div className="admin-master-tags">{country.cities.map((item) => <button type="button" key={item.id} className={item.active === false ? "inactive" : ""} onClick={() => onToggleCity(item.id)}>{item.label}</button>)}</div>
      <InlineAdd value={city} setValue={setCity} placeholder="Add city" onAdd={() => { if (city.trim()) { onAddCity(city.trim()); setCity(""); } }}/>
      <h3>Universities</h3>
      <div className="admin-master-tags">{country.universities.map((item) => <button type="button" key={item.id} className={item.active === false ? "inactive" : ""} onClick={() => onToggleUniversity(item.id)}>{item.label}</button>)}</div>
      <InlineAdd value={university} setValue={setUniversity} placeholder="Add university" onAdd={() => { if (university.trim()) { onAddUniversity(university.trim()); setUniversity(""); } }}/>
    </article>
  );
}

function LookupManager({ data, addLookup, toggleLookup }) {
  const groups = [
    ["professionalTitles", "Professional titles"],
    ["degrees", "Degrees"],
    ["languages", "Languages"],
    ["teachingLevels", "Teaching levels"],
    ["currencies", "Currencies"],
  ];
  return <div className="admin-master-list">{groups.map(([key, label]) => <LookupGroup key={key} groupKey={key} label={label} items={data[key]} addLookup={addLookup} toggleLookup={toggleLookup}/>)}</div>;
}

function LookupGroup({ groupKey, label, items, addLookup, toggleLookup }) {
  const [value, setValue] = useState("");
  return <section className="admin-master-card"><div className="admin-master-head"><div><strong>{label}</strong><span>{items.length} values</span></div></div><div className="admin-master-tags">{items.map((item) => <button type="button" key={item.id || item.value || item.label} className={item.active === false ? "inactive" : ""} onClick={() => toggleLookup(groupKey, item.id || item.value || item.label)}>{item.label || item.value || item}</button>)}</div><InlineAdd value={value} setValue={setValue} placeholder={`Add ${label.toLowerCase()}`} onAdd={() => { if (value.trim()) { addLookup(groupKey, value.trim()); setValue(""); } }}/></section>;
}

function InlineAdd({ value, setValue, placeholder, onAdd }) {
  return <div className="admin-inline-add"><input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }}/><button className="admin-button secondary" type="button" onClick={onAdd}><Plus size={13}/> Add</button></div>;
}

function StatusToggle({ active, onClick }) {
  return <button type="button" className={`admin-status-toggle ${active ? "active" : ""}`} onClick={onClick}>{active ? "Active" : "Inactive"}</button>;
}

export default AdminMasterData;
