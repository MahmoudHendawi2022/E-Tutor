# Changelog - E-Tutor Structure Reorganization

All design system adjustments, localization, and styling redesigns have been rolled back to preserve the original visual styling and code behaviors. Reorganization changes are listed below.

## Reorganization & Structure Changes

- **Route Segmentation**:
  - Extracted routes from `App.jsx` and grouped them under `src/app/router/` as `publicRoutes.jsx`, `studentRoutes.jsx`, `tutorRoutes.jsx`, and `adminRoutes.jsx`.
  - Mounted all routes under a clean `<AppRouter />` component.
- **Pages Directory Reorganization**:
  - Grouped page folders into `src/pages/public/`, `src/pages/student/`, and `src/pages/tutor/` depending on user permissions.
  - Moved admin page files from `src/admin/` to `src/pages/admin/`.
- **Layouts Reorganization**:
  - Moved admin layout files from `src/admin/` to `src/layouts/AdminLayout/`.
- **Import Paths Realignment**:
  - Adjusted all relative page import paths and asset resource references to match their new directory nesting levels.
