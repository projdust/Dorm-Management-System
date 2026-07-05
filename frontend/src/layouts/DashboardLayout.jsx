import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";

const TITLES = {
  "/dashboard": "Dashboard",
  "/rooms": "Rooms Management",
  "/tenants": "Residents Management",
  "/bed-assignments": "Room Allocation",
  "/payments": "Payments",
  "/billing": "Utility Billing",
  "/maintenance-requests": "Maintenance Requests",
  "/announcements": "Announcements",
  "/visitor-logs": "Visitor Logs",
  "/reports": "Reports",
  "/notifications": "Notifications",
  "/settings": "Settings",
};

export default function DashboardLayout() {
  const location = useLocation();
  const title = TITLES[location.pathname] || "DormHub";

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header title={title} />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
