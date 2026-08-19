/* =====================================
   PROFESSIONAL TITLES
===================================== */

export const professionalTitleOptions = [
  {
    id: "professional-tutor",
    label: "Professional Tutor",
  },
  {
    id: "certified-tutor",
    label: "Certified Tutor",
  },
  {
    id: "subject-specialist",
    label: "Subject Specialist",
  },
  {
    id: "language-instructor",
    label: "Language Instructor",
  },
  {
    id: "academic-instructor",
    label: "Academic Instructor",
  },
  {
    id: "university-lecturer",
    label: "University Lecturer",
  },
  {
    id: "exam-preparation-tutor",
    label: "Exam Preparation Tutor",
  },
];

/* =====================================
   SUBJECTS + SPECIALIZATIONS
===================================== */

export const subjectCatalog = [
  {
    id: "english",
    label: "English",
    branches: [
      {
        id: "general-english",
        label: "General English",
      },
      {
        id: "conversation",
        label: "Conversation",
      },
      {
        id: "business-english",
        label: "Business English",
      },
      {
        id: "ielts",
        label: "IELTS",
      },
      {
        id: "toefl",
        label: "TOEFL",
      },
      {
        id: "academic-english",
        label: "Academic English",
      },
    ],
  },

  {
    id: "arabic",
    label: "Arabic",
    branches: [
      {
        id: "arabic-language",
        label: "Arabic Language",
      },
      {
        id: "arabic-grammar",
        label: "Arabic Grammar",
      },
      {
        id: "arabic-conversation",
        label: "Arabic Conversation",
      },
      {
        id: "arabic-for-non-native",
        label: "Arabic for Non-Native Speakers",
      },
    ],
  },

  {
    id: "mathematics",
    label: "Mathematics",
    branches: [
      {
        id: "algebra",
        label: "Algebra",
      },
      {
        id: "geometry",
        label: "Geometry",
      },
      {
        id: "calculus",
        label: "Calculus",
      },
      {
        id: "statistics",
        label: "Statistics",
      },
      {
        id: "trigonometry",
        label: "Trigonometry",
      },
    ],
  },

  {
    id: "physics",
    label: "Physics",
    branches: [
      {
        id: "general-physics",
        label: "General Physics",
      },
      {
        id: "mechanics",
        label: "Mechanics",
      },
      {
        id: "electricity",
        label: "Electricity",
      },
      {
        id: "thermodynamics",
        label: "Thermodynamics",
      },
    ],
  },

  {
    id: "chemistry",
    label: "Chemistry",
    branches: [
      {
        id: "general-chemistry",
        label: "General Chemistry",
      },
      {
        id: "organic-chemistry",
        label: "Organic Chemistry",
      },
      {
        id: "inorganic-chemistry",
        label: "Inorganic Chemistry",
      },
      {
        id: "analytical-chemistry",
        label: "Analytical Chemistry",
      },
    ],
  },

  {
    id: "biology",
    label: "Biology",
    branches: [
      {
        id: "general-biology",
        label: "General Biology",
      },
      {
        id: "human-biology",
        label: "Human Biology",
      },
      {
        id: "genetics",
        label: "Genetics",
      },
      {
        id: "microbiology",
        label: "Microbiology",
      },
    ],
  },

  {
    id: "programming",
    label: "Programming",
    branches: [
      {
        id: "web-development",
        label: "Web Development",
      },
      {
        id: "javascript",
        label: "JavaScript",
      },
      {
        id: "react",
        label: "React",
      },
      {
        id: "php",
        label: "PHP",
      },
      {
        id: "laravel",
        label: "Laravel",
      },
      {
        id: "python",
        label: "Python",
      },
      {
        id: "computer-science",
        label: "Computer Science",
      },
    ],
  },

  {
    id: "quran-islamic-studies",
    label: "Quran & Islamic Studies",
    branches: [
      {
        id: "quran-recitation",
        label: "Quran Recitation",
      },
      {
        id: "tajweed",
        label: "Tajweed",
      },
      {
        id: "quran-memorization",
        label: "Quran Memorization",
      },
      {
        id: "islamic-studies",
        label: "Islamic Studies",
      },
    ],
  },
];

/* =====================================
   COUNTRIES
===================================== */

export const countryCatalog = [
  {
    code: "EG",
    label: "Egypt",

    timezones: ["Africa/Cairo"],

    cities: [
      {
        id: "cairo",
        label: "Cairo",
      },
      {
        id: "giza",
        label: "Giza",
      },
      {
        id: "alexandria",
        label: "Alexandria",
      },
      {
        id: "mansoura",
        label: "Mansoura",
      },
      {
        id: "tanta",
        label: "Tanta",
      },
      {
        id: "zagazig",
        label: "Zagazig",
      },
      {
        id: "assiut",
        label: "Assiut",
      },
      {
        id: "sohag",
        label: "Sohag",
      },
    ],

    universities: [
      {
        id: "cairo-university",
        label: "Cairo University",
      },
      {
        id: "ain-shams-university",
        label: "Ain Shams University",
      },
      {
        id: "alexandria-university",
        label: "Alexandria University",
      },
      {
        id: "mansoura-university",
        label: "Mansoura University",
      },
      {
        id: "al-azhar-university",
        label: "Al-Azhar University",
      },
      {
        id: "helwan-university",
        label: "Helwan University",
      },
      {
        id: "tanta-university",
        label: "Tanta University",
      },
      {
        id: "zagazig-university",
        label: "Zagazig University",
      },
      {
        id: "auc",
        label: "The American University in Cairo",
      },
    ],
  },

  {
    code: "SA",
    label: "Saudi Arabia",

    timezones: ["Asia/Riyadh"],

    cities: [
      {
        id: "riyadh",
        label: "Riyadh",
      },
      {
        id: "jeddah",
        label: "Jeddah",
      },
      {
        id: "makkah",
        label: "Makkah",
      },
      {
        id: "madinah",
        label: "Madinah",
      },
      {
        id: "dammam",
        label: "Dammam",
      },
    ],

    universities: [
      {
        id: "king-saud",
        label: "King Saud University",
      },
      {
        id: "king-abdulaziz",
        label: "King Abdulaziz University",
      },
      {
        id: "umm-al-qura",
        label: "Umm Al-Qura University",
      },
      {
        id: "imam-university",
        label: "Imam Mohammad Ibn Saud Islamic University",
      },
    ],
  },

  {
    code: "AE",
    label: "United Arab Emirates",

    timezones: ["Asia/Dubai"],

    cities: [
      {
        id: "dubai",
        label: "Dubai",
      },
      {
        id: "abu-dhabi",
        label: "Abu Dhabi",
      },
      {
        id: "sharjah",
        label: "Sharjah",
      },
      {
        id: "ajman",
        label: "Ajman",
      },
    ],

    universities: [
      {
        id: "uae-university",
        label: "United Arab Emirates University",
      },
      {
        id: "american-university-sharjah",
        label: "American University of Sharjah",
      },
      {
        id: "zayed-university",
        label: "Zayed University",
      },
    ],
  },

  {
    code: "JO",
    label: "Jordan",

    timezones: ["Asia/Amman"],

    cities: [
      {
        id: "amman",
        label: "Amman",
      },
      {
        id: "irbid",
        label: "Irbid",
      },
      {
        id: "zarqa",
        label: "Zarqa",
      },
    ],

    universities: [
      {
        id: "university-jordan",
        label: "The University of Jordan",
      },
      {
        id: "jordan-science-tech",
        label: "Jordan University of Science and Technology",
      },
    ],
  },

  {
    code: "KW",
    label: "Kuwait",

    timezones: ["Asia/Kuwait"],

    cities: [
      {
        id: "kuwait-city",
        label: "Kuwait City",
      },
      {
        id: "hawalli",
        label: "Hawalli",
      },
      {
        id: "salmiya",
        label: "Salmiya",
      },
    ],

    universities: [
      {
        id: "kuwait-university",
        label: "Kuwait University",
      },
    ],
  },

  {
    code: "QA",
    label: "Qatar",

    timezones: ["Asia/Qatar"],

    cities: [
      {
        id: "doha",
        label: "Doha",
      },
      {
        id: "al-rayyan",
        label: "Al Rayyan",
      },
    ],

    universities: [
      {
        id: "qatar-university",
        label: "Qatar University",
      },
    ],
  },

  {
    code: "US",
    label: "United States",

    timezones: [
      "America/New_York",
      "America/Chicago",
      "America/Denver",
      "America/Los_Angeles",
    ],

    cities: [
      {
        id: "new-york",
        label: "New York",
      },
      {
        id: "los-angeles",
        label: "Los Angeles",
      },
      {
        id: "chicago",
        label: "Chicago",
      },
      {
        id: "houston",
        label: "Houston",
      },
    ],

    universities: [
      {
        id: "harvard",
        label: "Harvard University",
      },
      {
        id: "stanford",
        label: "Stanford University",
      },
      {
        id: "mit",
        label: "Massachusetts Institute of Technology",
      },
      {
        id: "columbia",
        label: "Columbia University",
      },
    ],
  },

  {
    code: "GB",
    label: "United Kingdom",

    timezones: ["Europe/London"],

    cities: [
      {
        id: "london",
        label: "London",
      },
      {
        id: "manchester",
        label: "Manchester",
      },
      {
        id: "birmingham",
        label: "Birmingham",
      },
      {
        id: "oxford",
        label: "Oxford",
      },
    ],

    universities: [
      {
        id: "oxford-university",
        label: "University of Oxford",
      },
      {
        id: "cambridge-university",
        label: "University of Cambridge",
      },
      {
        id: "ucl",
        label: "University College London",
      },
    ],
  },
];

/* =====================================
   DEGREES
===================================== */

export const degreeOptions = [
  "High School Diploma",
  "Diploma",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate / PhD",
  "Postdoctoral Qualification",
];

/* =====================================
   LEVELS
===================================== */

export const teachingLevelOptions = [
  "Children",
  "Teenagers",
  "Beginner",
  "Intermediate",
  "Advanced",
  "University",
  "Professional",
];

/* =====================================
   LANGUAGES
===================================== */

export const languageOptions = [
  {
    id: "arabic",
    label: "Arabic",
  },
  {
    id: "english",
    label: "English",
  },
  {
    id: "french",
    label: "French",
  },
  {
    id: "german",
    label: "German",
  },
  {
    id: "spanish",
    label: "Spanish",
  },
  {
    id: "italian",
    label: "Italian",
  },
  {
    id: "turkish",
    label: "Turkish",
  },
];

export const languageLevelOptions = [
  "Native",
  "C2",
  "C1",
  "B2",
  "B1",
  "A2",
  "A1",
];

/* =====================================
   EXPERIENCE
===================================== */

export const experienceOptions = Array.from(
  {
    length: 31,
  },

  (_, index) => index,
);

/* =====================================
   PRICES
===================================== */

export const priceOptions = Array.from(
  {
    length: 40,
  },

  (_, index) => (index + 1) * 5,
);

export const currencyOptions = ["USD", "EUR", "GBP", "EGP", "SAR", "AED"];

/* =====================================
   YEARS
===================================== */

const currentYear = new Date().getFullYear();

export const graduationYearOptions = Array.from(
  {
    length: 60,
  },

  (_, index) => currentYear - index,
);

/* =====================================
   HELPERS
===================================== */

export function getSubjectById(subjectId) {
  return subjectCatalog.find((subject) => subject.id === subjectId) || null;
}

export function getCountryByCode(countryCode) {
  return countryCatalog.find((country) => country.code === countryCode) || null;
}

export function getProfessionalTitleById(titleId) {
  return professionalTitleOptions.find((title) => title.id === titleId) || null;
}

export function getLanguageById(languageId) {
  return languageOptions.find((language) => language.id === languageId) || null;
}
