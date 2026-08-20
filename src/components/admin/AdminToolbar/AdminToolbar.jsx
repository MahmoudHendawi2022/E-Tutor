import { Search } from "lucide-react";

/**
 * AdminToolbar
 *
 * The search + filter toolbar pattern used in 5 admin list pages:
 *   AdminLessons, AdminPayments, AdminTutors, AdminStudents,
 *   AdminTutorApplications.
 *
 * Props:
 *   search        — current search query string
 *   onSearch      — onChange handler for the search input
 *   placeholder   — search input placeholder text
 *   children      — any additional filter controls (e.g. <select>)
 */
export default function AdminToolbar({
  search,
  onSearch,
  placeholder = "Search...",
  children,
}) {
  return (
    <div className="admin-toolbar">
      <div className="admin-search">
        <Search size={14} />
        <input
          value={search}
          onChange={onSearch}
          placeholder={placeholder}
        />
      </div>
      {children}
    </div>
  );
}
