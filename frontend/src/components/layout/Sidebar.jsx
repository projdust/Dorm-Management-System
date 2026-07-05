import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  DoorOpen,
  Users,
  BedDouble,
  Receipt,
  Zap,
  Wrench,
  Megaphone,
  UserCheck,
  FileBarChart,
  Bell,
  Settings,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Rooms", to: "/rooms", icon: DoorOpen },
  { label: "Residents", to: "/tenants", icon: Users },
  { label: "Room Allocation", to: "/bed-assignments", icon: BedDouble },
  { label: "Payments", to: "/payments", icon: Receipt },
  { label: "Utility Billing", to: "/billing", icon: Zap },
  { label: "Maintenance", to: "/maintenance-requests", icon: Wrench },
  { label: "Announcements", to: "/announcements", icon: Megaphone },
  { label: "Visitor Logs", to: "/visitor-logs", icon: UserCheck },
  { label: "Reports", to: "/reports", icon: FileBarChart },
  { label: "Notifications", to: "/notifications", icon: Bell },
  { label: "Users", to: "/users", icon: ShieldCheck, roles: ["ADMIN"] },
  { label: "Settings", to: "/settings", icon: Settings, roles: ["ADMIN"] },
];

export default function Sidebar() {
  const { logout, user } = useAuth();
  const visibleNavItems = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(user?.role));

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-100 h-screen sticky top-0 flex flex-col">
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold">
          D
        </div>
        <span className="font-semibold text-lg text-slate-900">DormHub</span>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {visibleNavItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-100">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
