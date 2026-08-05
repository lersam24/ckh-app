import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/setup-triwulan", label: "Setup Triwulan" },
  { to: "/rekap", label: "Rekap" },
  { to: "/pengaturan", label: "Pengaturan" },
];

export default function DashboardNavbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-8">
        <span className="font-bold text-blue-700">CKH APP</span>
        <div className="flex gap-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium px-2 py-1 rounded-md transition ${
                  isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:text-blue-700"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <span className="text-slate-600">{user?.nama}</span>
        <button
          onClick={logout}
          className="rounded-md bg-red-50 text-red-600 px-3 py-1.5 font-medium hover:bg-red-100 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
