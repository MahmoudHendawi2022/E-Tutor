import { storageService } from "../storage/storage.service";

const STORAGE_KEY = "etutor_master_data_v1";

const seedData = {
  professionalTitles: [
    { id: "professional-tutor", label: "Professional Tutor", active: true },
    { id: "certified-tutor", label: "Certified Tutor", active: true },
    { id: "subject-specialist", label: "Subject Specialist", active: true },
    { id: "language-instructor", label: "Language Instructor", active: true },
    { id: "academic-instructor", label: "Academic Instructor", active: true },
    { id: "university-lecturer", label: "University Lecturer", active: true },
    { id: "exam-preparation-tutor", label: "Exam Preparation Tutor", active: true },
  ],
  subjects: [
    {
      id: "english",
      label: "English",
      active: true,
      branches: [
        { id: "general-english", label: "General English", active: true },
        { id: "conversation", label: "Conversation", active: true },
        { id: "business-english", label: "Business English", active: true },
        { id: "ielts", label: "IELTS", active: true },
        { id: "toefl", label: "TOEFL", active: true },
        { id: "academic-english", label: "Academic English", active: true },
      ],
    },
    {
      id: "arabic",
      label: "Arabic",
      active: true,
      branches: [
        { id: "arabic-language", label: "Arabic Language", active: true },
        { id: "arabic-grammar", label: "Arabic Grammar", active: true },
        { id: "arabic-conversation", label: "Arabic Conversation", active: true },
        { id: "arabic-non-native", label: "Arabic for Non-Native Speakers", active: true },
      ],
    },
    {
      id: "mathematics",
      label: "Mathematics",
      active: true,
      branches: [
        { id: "algebra", label: "Algebra", active: true },
        { id: "geometry", label: "Geometry", active: true },
        { id: "calculus", label: "Calculus", active: true },
        { id: "statistics", label: "Statistics", active: true },
        { id: "trigonometry", label: "Trigonometry", active: true },
      ],
    },
    {
      id: "physics",
      label: "Physics",
      active: true,
      branches: [
        { id: "general-physics", label: "General Physics", active: true },
        { id: "mechanics", label: "Mechanics", active: true },
        { id: "electricity", label: "Electricity", active: true },
        { id: "thermodynamics", label: "Thermodynamics", active: true },
      ],
    },
    {
      id: "chemistry",
      label: "Chemistry",
      active: true,
      branches: [
        { id: "general-chemistry", label: "General Chemistry", active: true },
        { id: "organic-chemistry", label: "Organic Chemistry", active: true },
        { id: "inorganic-chemistry", label: "Inorganic Chemistry", active: true },
        { id: "analytical-chemistry", label: "Analytical Chemistry", active: true },
      ],
    },
    {
      id: "biology",
      label: "Biology",
      active: true,
      branches: [
        { id: "general-biology", label: "General Biology", active: true },
        { id: "human-biology", label: "Human Biology", active: true },
        { id: "genetics", label: "Genetics", active: true },
        { id: "microbiology", label: "Microbiology", active: true },
      ],
    },
    {
      id: "programming",
      label: "Programming",
      active: true,
      branches: [
        { id: "web-development", label: "Web Development", active: true },
        { id: "javascript", label: "JavaScript", active: true },
        { id: "react", label: "React", active: true },
        { id: "php", label: "PHP", active: true },
        { id: "laravel", label: "Laravel", active: true },
        { id: "python", label: "Python", active: true },
        { id: "computer-science", label: "Computer Science", active: true },
      ],
    },
    {
      id: "quran-islamic-studies",
      label: "Quran & Islamic Studies",
      active: true,
      branches: [
        { id: "quran-recitation", label: "Quran Recitation", active: true },
        { id: "tajweed", label: "Tajweed", active: true },
        { id: "quran-memorization", label: "Quran Memorization", active: true },
        { id: "islamic-studies", label: "Islamic Studies", active: true },
      ],
    },
  ],
  countries: [
    {
      code: "EG",
      label: "Egypt",
      active: true,
      timezones: ["Africa/Cairo"],
      cities: [
        { id: "cairo", label: "Cairo", active: true },
        { id: "giza", label: "Giza", active: true },
        { id: "alexandria", label: "Alexandria", active: true },
        { id: "mansoura", label: "Mansoura", active: true },
        { id: "tanta", label: "Tanta", active: true },
        { id: "zagazig", label: "Zagazig", active: true },
        { id: "assiut", label: "Assiut", active: true },
        { id: "sohag", label: "Sohag", active: true },
      ],
      universities: [
        { id: "cairo-university", label: "Cairo University", active: true },
        { id: "ain-shams-university", label: "Ain Shams University", active: true },
        { id: "alexandria-university", label: "Alexandria University", active: true },
        { id: "mansoura-university", label: "Mansoura University", active: true },
        { id: "al-azhar-university", label: "Al-Azhar University", active: true },
        { id: "helwan-university", label: "Helwan University", active: true },
        { id: "tanta-university", label: "Tanta University", active: true },
        { id: "zagazig-university", label: "Zagazig University", active: true },
        { id: "auc", label: "The American University in Cairo", active: true },
      ],
    },
    {
      code: "SA",
      label: "Saudi Arabia",
      active: true,
      timezones: ["Asia/Riyadh"],
      cities: [
        { id: "riyadh", label: "Riyadh", active: true },
        { id: "jeddah", label: "Jeddah", active: true },
        { id: "makkah", label: "Makkah", active: true },
        { id: "madinah", label: "Madinah", active: true },
        { id: "dammam", label: "Dammam", active: true },
      ],
      universities: [
        { id: "king-saud", label: "King Saud University", active: true },
        { id: "king-abdulaziz", label: "King Abdulaziz University", active: true },
        { id: "umm-al-qura", label: "Umm Al-Qura University", active: true },
        { id: "imam-university", label: "Imam Mohammad Ibn Saud Islamic University", active: true },
      ],
    },
    {
      code: "AE",
      label: "United Arab Emirates",
      active: true,
      timezones: ["Asia/Dubai"],
      cities: [
        { id: "dubai", label: "Dubai", active: true },
        { id: "abu-dhabi", label: "Abu Dhabi", active: true },
        { id: "sharjah", label: "Sharjah", active: true },
        { id: "ajman", label: "Ajman", active: true },
      ],
      universities: [
        { id: "uae-university", label: "United Arab Emirates University", active: true },
        { id: "american-university-sharjah", label: "American University of Sharjah", active: true },
        { id: "zayed-university", label: "Zayed University", active: true },
      ],
    },
    {
      code: "JO",
      label: "Jordan",
      active: true,
      timezones: ["Asia/Amman"],
      cities: [
        { id: "amman", label: "Amman", active: true },
        { id: "irbid", label: "Irbid", active: true },
        { id: "zarqa", label: "Zarqa", active: true },
      ],
      universities: [
        { id: "university-jordan", label: "The University of Jordan", active: true },
        { id: "jordan-science-tech", label: "Jordan University of Science and Technology", active: true },
      ],
    },
    {
      code: "KW",
      label: "Kuwait",
      active: true,
      timezones: ["Asia/Kuwait"],
      cities: [
        { id: "kuwait-city", label: "Kuwait City", active: true },
        { id: "hawalli", label: "Hawalli", active: true },
        { id: "salmiya", label: "Salmiya", active: true },
      ],
      universities: [{ id: "kuwait-university", label: "Kuwait University", active: true }],
    },
    {
      code: "QA",
      label: "Qatar",
      active: true,
      timezones: ["Asia/Qatar"],
      cities: [
        { id: "doha", label: "Doha", active: true },
        { id: "al-rayyan", label: "Al Rayyan", active: true },
      ],
      universities: [{ id: "qatar-university", label: "Qatar University", active: true }],
    },
    {
      code: "US",
      label: "United States",
      active: true,
      timezones: ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles"],
      cities: [
        { id: "new-york", label: "New York", active: true },
        { id: "los-angeles", label: "Los Angeles", active: true },
        { id: "chicago", label: "Chicago", active: true },
        { id: "houston", label: "Houston", active: true },
      ],
      universities: [
        { id: "harvard", label: "Harvard University", active: true },
        { id: "stanford", label: "Stanford University", active: true },
        { id: "mit", label: "Massachusetts Institute of Technology", active: true },
        { id: "columbia", label: "Columbia University", active: true },
      ],
    },
    {
      code: "GB",
      label: "United Kingdom",
      active: true,
      timezones: ["Europe/London"],
      cities: [
        { id: "london", label: "London", active: true },
        { id: "manchester", label: "Manchester", active: true },
        { id: "birmingham", label: "Birmingham", active: true },
        { id: "oxford", label: "Oxford", active: true },
      ],
      universities: [
        { id: "oxford-university", label: "University of Oxford", active: true },
        { id: "cambridge-university", label: "University of Cambridge", active: true },
        { id: "ucl", label: "University College London", active: true },
      ],
    },
  ],
  degrees: [
    { id: "high-school", label: "High School Diploma", active: true },
    { id: "diploma", label: "Diploma", active: true },
    { id: "bachelor", label: "Bachelor's Degree", active: true },
    { id: "master", label: "Master's Degree", active: true },
    { id: "phd", label: "Doctorate / PhD", active: true },
    { id: "postdoc", label: "Postdoctoral Qualification", active: true },
  ],
  languages: [
    { id: "arabic", label: "Arabic", active: true },
    { id: "english", label: "English", active: true },
    { id: "french", label: "French", active: true },
    { id: "german", label: "German", active: true },
    { id: "spanish", label: "Spanish", active: true },
    { id: "italian", label: "Italian", active: true },
    { id: "turkish", label: "Turkish", active: true },
  ],
  teachingLevels: [
    { id: "children", label: "Children", active: true },
    { id: "teenagers", label: "Teenagers", active: true },
    { id: "beginner", label: "Beginner", active: true },
    { id: "intermediate", label: "Intermediate", active: true },
    { id: "advanced", label: "Advanced", active: true },
    { id: "university", label: "University", active: true },
    { id: "professional", label: "Professional", active: true },
  ],
  currencies: [
    { id: "USD", label: "USD", active: true },
    { id: "EUR", label: "EUR", active: true },
    { id: "GBP", label: "GBP", active: true },
    { id: "EGP", label: "EGP", active: true },
    { id: "SAR", label: "SAR", active: true },
    { id: "AED", label: "AED", active: true },
  ],
  priceOptions: Array.from({ length: 40 }, (_, index) => (index + 1) * 5),
  experienceOptions: Array.from({ length: 31 }, (_, index) => index),
};

const slugify = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const masterDataService = {
  loadData() {
    const stored = storageService.getItem(STORAGE_KEY, null);
    return stored ? { ...seedData, ...stored } : seedData;
  },

  saveData(masterData) {
    storageService.setItem(STORAGE_KEY, masterData);
  },

  getSeedData() {
    return seedData;
  },

  addLookup(masterData, key, label) {
    const clean = String(label || "").trim();
    if (!clean || !Array.isArray(masterData[key])) return { success: false, data: masterData };
    const updated = {
      ...masterData,
      [key]: [
        ...masterData[key],
        { id: `${slugify(clean)}-${Date.now()}`, label: clean, active: true },
      ],
    };
    return { success: true, data: updated };
  },

  toggleLookup(masterData, key, id) {
    return {
      ...masterData,
      [key]: masterData[key].map((item) =>
        item.id === id ? { ...item, active: !item.active } : item
      ),
    };
  },

  addSubject(masterData, label) {
    const clean = String(label || "").trim();
    if (!clean) return { success: false, data: masterData };
    const updated = {
      ...masterData,
      subjects: [
        ...masterData.subjects,
        { id: `${slugify(clean)}-${Date.now()}`, label: clean, active: true, branches: [] },
      ],
    };
    return { success: true, data: updated };
  },

  toggleSubject(masterData, subjectId) {
    return {
      ...masterData,
      subjects: masterData.subjects.map((subject) =>
        subject.id === subjectId ? { ...subject, active: !subject.active } : subject
      ),
    };
  },

  addBranch(masterData, subjectId, label) {
    const clean = String(label || "").trim();
    if (!clean) return { success: false, data: masterData };
    const updated = {
      ...masterData,
      subjects: masterData.subjects.map((subject) =>
        subject.id === subjectId
          ? {
              ...subject,
              branches: [
                ...subject.branches,
                { id: `${slugify(clean)}-${Date.now()}`, label: clean, active: true },
              ],
            }
          : subject
      ),
    };
    return { success: true, data: updated };
  },

  toggleBranch(masterData, subjectId, branchId) {
    return {
      ...masterData,
      subjects: masterData.subjects.map((subject) =>
        subject.id === subjectId
          ? {
              ...subject,
              branches: subject.branches.map((branch) =>
                branch.id === branchId ? { ...branch, active: !branch.active } : branch
              ),
            }
          : subject
      ),
    };
  },

  addCountry(masterData, { code, label, timezone }) {
    const cleanCode = String(code || "").trim().toUpperCase();
    const cleanLabel = String(label || "").trim();
    if (!cleanCode || !cleanLabel) return { success: false, data: masterData };
    const updated = {
      ...masterData,
      countries: [
        ...masterData.countries,
        {
          code: cleanCode,
          label: cleanLabel,
          active: true,
          timezones: timezone ? [timezone] : [],
          cities: [],
          universities: [],
        },
      ],
    };
    return { success: true, data: updated };
  },

  toggleCountry(masterData, code) {
    return {
      ...masterData,
      countries: masterData.countries.map((country) =>
        country.code === code ? { ...country, active: !country.active } : country
      ),
    };
  },

  addCity(masterData, countryCode, label) {
    const clean = String(label || "").trim();
    if (!clean) return { success: false, data: masterData };
    const updated = {
      ...masterData,
      countries: masterData.countries.map((country) =>
        country.code === countryCode
          ? {
              ...country,
              cities: [
                ...country.cities,
                { id: `${slugify(clean)}-${Date.now()}`, label: clean, active: true },
              ],
            }
          : country
      ),
    };
    return { success: true, data: updated };
  },

  toggleCity(masterData, countryCode, cityId) {
    return {
      ...masterData,
      countries: masterData.countries.map((country) =>
        country.code === countryCode
          ? {
              ...country,
              cities: country.cities.map((city) =>
                city.id === cityId ? { ...city, active: !city.active } : city
              ),
            }
          : country
      ),
    };
  },

  addUniversity(masterData, countryCode, label) {
    const clean = String(label || "").trim();
    if (!clean) return { success: false, data: masterData };
    const updated = {
      ...masterData,
      countries: masterData.countries.map((country) =>
        country.code === countryCode
          ? {
              ...country,
              universities: [
                ...country.universities,
                { id: `${slugify(clean)}-${Date.now()}`, label: clean, active: true },
              ],
            }
          : country
      ),
    };
    return { success: true, data: updated };
  },

  toggleUniversity(masterData, countryCode, universityId) {
    return {
      ...masterData,
      countries: masterData.countries.map((country) =>
        country.code === countryCode
          ? {
              ...country,
              universities: country.universities.map((university) =>
                university.id === universityId
                  ? { ...university, active: !university.active }
                  : university
              ),
            }
          : country
      ),
    };
  }
};
