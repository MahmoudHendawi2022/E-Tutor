export const tutors = [
  {
    id: 1,

    name: "Sarah goo",

    title: "Certified English Tutor",

    shortTitle: "English Tutor",

    subject: "English",

    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80",

    rating: 4.9,

    reviews: 124,

    lessons: 850,

    price: 18,

    online: true,

    verified: true,

    experience: "6 years",

    languages: ["English", "Spanish"],

    education: "MA in English Language",

    tags: ["Speaking", "Grammar", "IELTS"],

    bio: "I help students become more confident and natural English speakers through practical conversation, pronunciation and grammar lessons.",
  },

  {
    id: 2,

    name: "Daniel Smith",

    title: "Mathematics Tutor",

    shortTitle: "Mathematics Tutor",

    subject: "Mathematics",

    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",

    rating: 4.8,

    reviews: 96,

    lessons: 620,

    price: 22,

    online: false,

    verified: true,

    experience: "8 years",

    languages: ["English"],

    education: "MSc in Mathematics",

    tags: ["Algebra", "Calculus", "Geometry"],

    bio: "I make mathematics easier to understand by breaking complex concepts into simple, practical steps.",
  },

  {
    id: 3,

    name: "Emma Wilson",

    title: "Programming Tutor",

    shortTitle: "Programming Tutor",

    subject: "Programming",

    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80",

    rating: 5,

    reviews: 78,

    lessons: 410,

    price: 24,

    online: true,

    verified: true,

    experience: "5 years",

    languages: ["English"],

    education: "BSc in Computer Science",

    tags: ["React", "JavaScript", "Frontend"],

    bio: "I teach modern frontend development with practical projects using JavaScript, React and real-world development workflows.",
  },

  {
    id: 4,

    name: "Michael Brown",

    title: "Physics Tutor",

    shortTitle: "Physics Tutor",

    subject: "Physics",

    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",

    rating: 4.7,

    reviews: 54,

    lessons: 290,

    price: 20,

    online: false,

    verified: true,

    experience: "7 years",

    languages: ["English"],

    education: "MSc in Physics",

    tags: ["Mechanics", "Physics", "Science"],

    bio: "I help students understand physics through visual explanations, practical examples and structured problem solving.",
  },

  {
    id: 5,

    name: "Olivia Taylor",

    title: "Spanish Language Tutor",

    shortTitle: "Spanish Tutor",

    subject: "Spanish",

    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=500&q=80",

    rating: 4.9,

    reviews: 87,

    lessons: 380,

    price: 19,

    online: true,

    verified: true,

    experience: "5 years",

    languages: ["Spanish", "English"],

    education: "BA in Spanish Language",

    tags: ["Conversation", "Grammar", "Beginners"],

    bio: "Interactive Spanish lessons designed to help students speak confidently in real-life situations.",
  },

  {
    id: 6,

    name: "James Carter",

    title: "Chemistry Tutor",

    shortTitle: "Chemistry Tutor",

    subject: "Chemistry",

    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80",

    rating: 4.8,

    reviews: 61,

    lessons: 315,

    price: 21,

    online: false,

    verified: true,

    experience: "6 years",

    languages: ["English"],

    education: "MSc in Chemistry",

    tags: ["Organic", "General Chemistry", "Exam Prep"],

    bio: "Structured chemistry lessons focused on understanding concepts instead of memorizing formulas.",
  },
];

export const getTutorById = (tutorId) => {
  return tutors.find((tutor) => tutor.id === Number(tutorId));
};
