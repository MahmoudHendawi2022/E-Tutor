import { useLocation } from "react-router";
import { Construction } from "lucide-react";

function DashboardPlaceholder() {
  const location = useLocation();

  const titles = {
    "/dashboard/tutors": "My Tutors",
    "/dashboard/messages": "Messages",
    "/dashboard/saved": "Saved Tutors",
    "/dashboard/settings": "Settings",
  };

  const title = titles[location.pathname] || "Coming Soon";

  return (
    <main
      style={{
        padding: "40px 34px",
      }}
    >
      <div
        style={{
          minHeight: "350px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          background: "#fff",
          border: "1px solid #e7ebf0",
          borderRadius: "8px",
        }}
      >
        <Construction size={28} color="#2563eb" />

        <h1
          style={{
            margin: "15px 0 7px",
            fontSize: "22px",
            color: "#0f172a",
          }}
        >
          {title}
        </h1>

        <p
          style={{
            margin: 0,
            color: "#64748b",
            fontSize: "12px",
          }}
        >
          We're building this section next.
        </p>
      </div>
    </main>
  );
}

export default DashboardPlaceholder;
