import { useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  CircleDollarSign,
  GraduationCap,
  FileCheck2,
  Languages,
  MapPin,
  Plus,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";

import { useMasterData } from "../../context/MasterDataContext";
import { FormLabel } from "../../components/forms";
import "./tutorProfileForm.css";

function createInitialForm(profile, masterData) {
  const subject = masterData.subjects.find(
    (item) =>
      item.id === profile?.primarySubjectId ||
      item.label === profile?.primarySubject ||
      item.label === profile?.subject,
  );
  const country = masterData.countries.find(
    (item) => item.code === profile?.countryCode || item.label === profile?.country,
  );
  const title = masterData.professionalTitles.find(
    (item) => item.id === profile?.titleId || item.label === profile?.title,
  );

  return {
    firstName: profile?.firstName || "",
    lastName: profile?.lastName || "",
    image: profile?.image || "",
    titleId: title?.id || "",
    headline: profile?.headline || "",
    bio: profile?.bio || "",
    primarySubjectId: subject?.id || "",
    specializationIds: profile?.specializationIds || [],
    teachingLevels: profile?.teachingLevels || [],
    price: profile?.price || "",
    currency: profile?.currency || masterData.currencies[0]?.id || "USD",
    experienceYears: profile?.experienceYears ?? "",
    countryCode: country?.code || "",
    cityId: profile?.cityId || "",
    timezone: profile?.timezone || "",
    universityId: profile?.universityId || "",
    degree: profile?.degree || "",
    fieldOfStudy: profile?.fieldOfStudy || "",
    graduationYear: profile?.graduationYear || "",
    trialLesson: Boolean(profile?.trialLesson),
    trialPrice: profile?.trialPrice || "",
    identityDocument: profile?.identityDocument || null,
    qualificationDocument: profile?.qualificationDocument || null,
  };
}

function TutorProfileForm({ initialData, submitLabel = "Save profile", onSubmit, saving = false }) {
  const { active } = useMasterData();
  const [form, setForm] = useState(() => createInitialForm(initialData, active));
  const [languages, setLanguages] = useState(() =>
    initialData?.languages?.length
      ? initialData.languages.map((language, index) => ({
          rowId: `${Date.now()}-${index}`,
          languageId:
            language.languageId ||
            active.languages.find((item) => item.label === language.language)?.id ||
            "",
          level: language.level || "",
        }))
      : [{ rowId: `${Date.now()}-0`, languageId: "", level: "" }],
  );
  const [error, setError] = useState("");

  const selectedSubject = useMemo(
    () => active.subjects.find((item) => item.id === form.primarySubjectId) || null,
    [active.subjects, form.primarySubjectId],
  );
  const selectedCountry = useMemo(
    () => active.countries.find((item) => item.code === form.countryCode) || null,
    [active.countries, form.countryCode],
  );

  const updateField = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    setError("");
  };

  const changeSubject = (event) => {
    setForm((current) => ({
      ...current,
      primarySubjectId: event.target.value,
      specializationIds: [],
      fieldOfStudy: "",
    }));
  };

  const toggleSpecialization = (id) => {
    setForm((current) => ({
      ...current,
      specializationIds: current.specializationIds.includes(id)
        ? current.specializationIds.filter((item) => item !== id)
        : [...current.specializationIds, id],
    }));
  };

  const toggleTeachingLevel = (level) => {
    setForm((current) => ({
      ...current,
      teachingLevels: current.teachingLevels.includes(level)
        ? current.teachingLevels.filter((item) => item !== level)
        : [...current.teachingLevels, level],
    }));
  };

  const changeCountry = (event) => {
    const country = active.countries.find((item) => item.code === event.target.value);
    setForm((current) => ({
      ...current,
      countryCode: event.target.value,
      cityId: "",
      universityId: "",
      timezone: country?.timezones?.[0] || "",
    }));
  };

  const selectImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image.");
      return;
    }
    if (file.size > 1024 * 1024) {
      setError("Profile photo must be smaller than 1 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, image: String(reader.result || "") }));
    reader.readAsDataURL(file);
  };


  const selectDocument = (event, field) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError("Verification documents must be PDF, JPG, PNG or WEBP.");
      return;
    }
    if (file.size > 900 * 1024) {
      setError("Each verification document must be smaller than 900 KB in this frontend demo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setForm((current) => ({
        ...current,
        [field]: { name: file.name, type: file.type, dataUrl: String(reader.result || "") },
      }));
    reader.readAsDataURL(file);
  };

  const updateLanguage = (rowId, field, value) => {
    setLanguages((current) =>
      current.map((item) => (item.rowId === rowId ? { ...item, [field]: value } : item)),
    );
  };
  const addLanguage = () =>
    setLanguages((current) => [
      ...current,
      { rowId: `${Date.now()}-${Math.random()}`, languageId: "", level: "" },
    ]);
  const removeLanguage = (rowId) =>
    setLanguages((current) =>
      current.length === 1 ? current : current.filter((item) => item.rowId !== rowId),
    );

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    const title = active.professionalTitles.find((item) => item.id === form.titleId);
    const subject = active.subjects.find((item) => item.id === form.primarySubjectId);
    const country = active.countries.find((item) => item.code === form.countryCode);
    const city = country?.cities.find((item) => item.id === form.cityId);
    const university = country?.universities.find((item) => item.id === form.universityId);
    const specializations =
      subject?.branches.filter((branch) => form.specializationIds.includes(branch.id)) || [];
    const normalizedLanguages = languages
      .filter((item) => item.languageId && item.level)
      .map((item) => {
        const language = active.languages.find((option) => option.id === item.languageId);
        return {
          languageId: item.languageId,
          language: language?.label || "",
          level: item.level,
        };
      });

    if (!form.firstName.trim() || !form.lastName.trim()) return setError("First and last name are required.");
    if (!form.image) return setError("Please upload a professional profile photo.");
    if (!title) return setError("Please select your professional title.");
    if (form.bio.trim().length < 60) return setError("Your bio should contain at least 60 characters.");
    if (!subject || specializations.length === 0) return setError("Please select your subject and at least one specialization.");
    if (Number(form.price) <= 0) return setError("Please select your lesson price.");
    if (!country || !city || !form.timezone) return setError("Please complete your location information.");
    if (!university) return setError("Please select your university.");
    if (!form.degree) return setError("Please select your degree.");
    if (!form.identityDocument) return setError("Please upload an identity verification document.");
    if (!form.qualificationDocument) return setError("Please upload a qualification or degree document.");
    if (normalizedLanguages.length === 0) return setError("Please add at least one language and proficiency level.");

    onSubmit({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      name: `${form.firstName.trim()} ${form.lastName.trim()}`,
      image: form.image,
      titleId: title.id,
      title: title.label,
      shortTitle: title.label,
      headline: form.headline.trim(),
      bio: form.bio.trim(),
      primarySubjectId: subject.id,
      primarySubject: subject.label,
      subject: subject.label,
      subjects: [subject.label, ...specializations.map((item) => item.label)],
      specializationIds: specializations.map((item) => item.id),
      specializations: specializations.map((item) => item.label),
      teachingLevels: form.teachingLevels,
      price: Number(form.price),
      currency: form.currency,
      experienceYears: Number(form.experienceYears || 0),
      countryCode: country.code,
      country: country.label,
      cityId: city.id,
      city: city.label,
      timezone: form.timezone,
      universityId: university.id,
      university: university.label,
      degree: form.degree,
      fieldOfStudy: form.fieldOfStudy,
      graduationYear: form.graduationYear,
      identityDocument: form.identityDocument,
      qualificationDocument: form.qualificationDocument,
      languages: normalizedLanguages,
      trialLesson: form.trialLesson,
      trialPrice: form.trialLesson ? Number(form.trialPrice || 0) : 0,
    });
  };

  const years = Array.from({ length: 60 }, (_, index) => new Date().getFullYear() - index);

  return (
    <form className="tutor-profile-form" onSubmit={handleSubmit}>
      <section className="tpf-card">
        <Heading icon={UserRound} title="Public profile" text="Information students will see after your profile is approved." />
        <div className="tpf-photo">
          <div className="tpf-avatar">
            {form.image ? <img src={form.image} alt="Tutor" /> : <UserRound size={26} />}
          </div>
          <div>
            <strong>Professional photo *</strong>
            <span>Clear face photo. Maximum 1 MB.</span>
            <div className="tpf-photo-actions">
              <label>
                <Upload size={13} />
                {form.image ? "Change photo" : "Upload photo"}
                <input type="file" accept="image/*" onChange={selectImage} />
              </label>
              {form.image && (
                <button type="button" onClick={() => setForm((current) => ({ ...current, image: "" }))}>
                  <Trash2 size={13} /> Remove
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="tpf-grid">
          <Field label="First name *">
            <input name="firstName" value={form.firstName} onChange={updateField} />
          </Field>
          <Field label="Last name *">
            <input name="lastName" value={form.lastName} onChange={updateField} />
          </Field>
        </div>
        <Field label="Professional title *">
          <select name="titleId" value={form.titleId} onChange={updateField}>
            <option value="">Select title</option>
            {active.professionalTitles.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
          </select>
        </Field>
        <Field label="Profile headline">
          <input name="headline" value={form.headline} onChange={updateField} maxLength="120" placeholder="A short introduction for students" />
        </Field>
        <Field label="About you *">
          <textarea name="bio" value={form.bio} onChange={updateField} rows="6" maxLength="1200" placeholder="Introduce your experience, teaching approach and how you help students..." />
          <small>{form.bio.length}/1200</small>
        </Field>
      </section>

      <section className="tpf-card">
        <Heading icon={BookOpen} title="Teaching information" text="Select the subject and areas you actually teach." />
        <div className="tpf-grid">
          <Field label="Main subject *">
            <select value={form.primarySubjectId} onChange={changeSubject}>
              <option value="">Select subject</option>
              {active.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.label}</option>)}
            </select>
          </Field>
          <Field label="Teaching experience">
            <select name="experienceYears" value={form.experienceYears} onChange={updateField}>
              <option value="">Select experience</option>
              {active.experienceOptions.map((yearsCount) => (
                <option key={yearsCount} value={yearsCount}>
                  {yearsCount === 0 ? "Less than 1 year" : `${yearsCount} ${yearsCount === 1 ? "year" : "years"}`}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {selectedSubject && (
          <Field label="Specializations *">
            <div className="tpf-options">
              {selectedSubject.branches.map((branch) => {
                const selected = form.specializationIds.includes(branch.id);
                return (
                  <button type="button" key={branch.id} className={selected ? "active" : ""} onClick={() => toggleSpecialization(branch.id)}>
                    {selected && <Check size={11} />} {branch.label}
                  </button>
                );
              })}
            </div>
          </Field>
        )}
        <Field label="Student levels">
          <div className="tpf-options">
            {active.teachingLevels.map((level) => {
              const selected = form.teachingLevels.includes(level.label);
              return (
                <button type="button" key={level.id} className={selected ? "active" : ""} onClick={() => toggleTeachingLevel(level.label)}>
                  {selected && <Check size={11} />} {level.label}
                </button>
              );
            })}
          </div>
        </Field>
      </section>

      <section className="tpf-card">
        <Heading icon={CircleDollarSign} title="Pricing" text="Select your standard hourly lesson rate." />
        <div className="tpf-grid">
          <Field label="Hourly price *">
            <select name="price" value={form.price} onChange={updateField}>
              <option value="">Select price</option>
              {active.priceOptions.map((price) => <option key={price} value={price}>{price}</option>)}
            </select>
          </Field>
          <Field label="Currency">
            <select name="currency" value={form.currency} onChange={updateField}>
              {active.currencies.map((currency) => <option key={currency.id} value={currency.id}>{currency.label}</option>)}
            </select>
          </Field>
        </div>
        <label className="tpf-check-row">
          <input type="checkbox" name="trialLesson" checked={form.trialLesson} onChange={updateField} />
          <span><strong>Offer a trial lesson</strong><small>Optional introductory lesson for new students.</small></span>
        </label>
        {form.trialLesson && (
          <Field label="Trial lesson price">
            <select name="trialPrice" value={form.trialPrice} onChange={updateField}>
              <option value="">Select price</option>
              {active.priceOptions.map((price) => <option key={price} value={price}>{price}</option>)}
            </select>
          </Field>
        )}
      </section>

      <section className="tpf-card">
        <Heading icon={MapPin} title="Location" text="Country, city and timezone come from platform-managed lists." />
        <div className="tpf-grid">
          <Field label="Country *">
            <select value={form.countryCode} onChange={changeCountry}>
              <option value="">Select country</option>
              {active.countries.map((country) => <option key={country.code} value={country.code}>{country.label}</option>)}
            </select>
          </Field>
          <Field label="City *">
            <select name="cityId" value={form.cityId} onChange={updateField} disabled={!selectedCountry}>
              <option value="">Select city</option>
              {selectedCountry?.cities.map((city) => <option key={city.id} value={city.id}>{city.label}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Timezone *">
          <select name="timezone" value={form.timezone} onChange={updateField} disabled={!selectedCountry}>
            <option value="">Select timezone</option>
            {selectedCountry?.timezones.map((timezone) => <option key={timezone} value={timezone}>{timezone}</option>)}
          </select>
        </Field>
      </section>

      <section className="tpf-card">
        <Heading icon={GraduationCap} title="Education" text="Academic information is reviewed by the platform before approval." />
        <Field label="University *">
          <select name="universityId" value={form.universityId} onChange={updateField} disabled={!selectedCountry}>
            <option value="">Select university</option>
            {selectedCountry?.universities.map((university) => <option key={university.id} value={university.id}>{university.label}</option>)}
          </select>
        </Field>
        <div className="tpf-grid">
          <Field label="Degree *">
            <select name="degree" value={form.degree} onChange={updateField}>
              <option value="">Select degree</option>
              {active.degrees.map((degree) => <option key={degree.id} value={degree.label}>{degree.label}</option>)}
            </select>
          </Field>
          <Field label="Graduation year">
            <select name="graduationYear" value={form.graduationYear} onChange={updateField}>
              <option value="">Select year</option>
              {years.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </Field>
        </div>
        {selectedSubject && (
          <Field label="Field of study">
            <select name="fieldOfStudy" value={form.fieldOfStudy} onChange={updateField}>
              <option value="">Select field</option>
              <option value={selectedSubject.label}>{selectedSubject.label}</option>
              {selectedSubject.branches.map((branch) => <option key={branch.id} value={branch.label}>{branch.label}</option>)}
            </select>
          </Field>
        )}
      </section>

      <section className="tpf-card">
        <Heading icon={FileCheck2} title="Verification documents" text="These documents are private and visible only to the E-Tutor review team." />
        <div className="tpf-grid">
          <DocumentField
            label="Identity document *"
            document={form.identityDocument}
            onSelect={(event) => selectDocument(event, "identityDocument")}
            onRemove={() => setForm((current) => ({ ...current, identityDocument: null }))}
          />
          <DocumentField
            label="Degree / qualification proof *"
            document={form.qualificationDocument}
            onSelect={(event) => selectDocument(event, "qualificationDocument")}
            onRemove={() => setForm((current) => ({ ...current, qualificationDocument: null }))}
          />
        </div>
      </section>

      <section className="tpf-card">
        <Heading icon={Languages} title="Languages" text="Select languages and proficiency levels." />
        <div className="tpf-language-list">
          {languages.map((language) => (
            <div key={language.rowId} className="tpf-language">
              <select value={language.languageId} onChange={(event) => updateLanguage(language.rowId, "languageId", event.target.value)}>
                <option value="">Language</option>
                {active.languages.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
              </select>
              <select value={language.level} onChange={(event) => updateLanguage(language.rowId, "level", event.target.value)}>
                <option value="">Level</option>
                {["Native", "C2", "C1", "B2", "B1", "A2", "A1"].map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
              <button type="button" onClick={() => removeLanguage(language.rowId)}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
        <button type="button" className="tpf-add-language" onClick={addLanguage}><Plus size={13} /> Add language</button>
      </section>

      {error && <div className="tpf-error">{error}</div>}

      <div className="tpf-submit">
        <div>
          <strong>Profile information is subject to review</strong>
          <span>New tutors and sensitive profile changes stay private until approved by E-Tutor.</span>
        </div>
        <button type="submit" disabled={saving}>{saving ? "Saving..." : submitLabel}</button>
      </div>
    </form>
  );
}


function DocumentField({ label, document, onSelect, onRemove }) {
  return (
    <div className="tpf-document">
      <span>{label}</span>
      <div>
        <FileCheck2 size={17} />
        <section>
          <strong>{document?.name || "No file selected"}</strong>
          <small>PDF or image · max 900 KB for demo storage</small>
        </section>
      </div>
      <div className="tpf-document-actions">
        <label><Upload size={12}/>{document ? "Replace" : "Upload"}<input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={onSelect}/></label>
        {document && <button type="button" onClick={onRemove}><Trash2 size={12}/>Remove</button>}
      </div>
    </div>
  );
}

function Heading({ icon: Icon, title, text }) {
  return (
    <div className="tpf-heading">
      <Icon size={18} />
      <div><h2>{title}</h2><p>{text}</p></div>
    </div>
  );
}

function Field({ label, children }) {
  return <div className="tpf-field"><FormLabel>{label}</FormLabel>{children}</div>;
}

export default TutorProfileForm;
