import { storageService } from "../storage/storage.service";

const STORAGE_KEY = "etutor_master_data_v1";

const fallbackSubjects = [
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
];

export const subjectsService = {
  getSubjects() {
    const masterData = storageService.getItem(STORAGE_KEY, null);
    return masterData?.subjects || fallbackSubjects;
  },

  getSubjectById(id) {
    const subjects = this.getSubjects();
    return subjects.find((sub) => sub.id === id) || null;
  },

  searchSubjects(query) {
    const subjects = this.getSubjects();
    if (!query) return subjects;
    const clean = String(query).trim().toLowerCase();
    return subjects.filter(
      (sub) =>
        sub.label.toLowerCase().includes(clean) ||
        sub.branches.some((b) => b.label.toLowerCase().includes(clean))
    );
  }
};
