# Project Structure - E-Tutor Reorganized Frontend

The E-Tutor educational marketplace frontend has been successfully restructured into clean, role-based subdirectories and modular routing segments without changing any visual styling, layout, or behaviors.

## Directory Layout

```
src/
├── app/                  # Main route assemblies and setups
│   └── router/           # Separated route segments
│       ├── AppRouter.jsx
│       ├── publicRoutes.jsx
│       ├── studentRoutes.jsx
│       ├── tutorRoutes.jsx
│       └── adminRoutes.jsx
│
├── pages/                # Sectioned views containing logic & styling unchanged
│   ├── public/           # Home, SignIn, Register, FindTutors, TutorProfile, booking success/confirm
│   ├── student/          # StudentDashboard, MyLessons, LessonDetails, MyTutors, Messages, SavedTutors, settings
│   ├── tutor/            # TutorDashboard, settings, availability, students, onboarding wizard
│   └── admin/            # Admin portal panels (moved from src/admin/)
│
├── components/           # Original visual presentation components
│
├── layouts/              # Original layouts sectioned by user type (Main, Student, Tutor, Admin)
│
├── context/              # Exact original state and simulated local storage context APIs
│
├── data/                 # Exact original demo datasets
│
├── services/             # API services placeholder
│
├── hooks/                # Custom React hook helpers
│
├── utils/                # Utility helper functions
│
└── assets/               # Image/illustration resources
```
