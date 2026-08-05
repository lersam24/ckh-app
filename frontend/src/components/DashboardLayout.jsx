import { Outlet } from "react-router-dom";
import DashboardNavbar from "./DashboardNavbar";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNavbar />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
