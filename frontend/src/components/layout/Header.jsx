import { useAuth } from "../../context/AuthContext";

export default function Header({ title }) {
  const { user } = useAuth();

  const initials = user ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}` : "";

  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-white">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      {user && (
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-slate-500 capitalize">{user.role?.toLowerCase()}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-semibold">
            {initials}
          </div>
        </div>
      )}
    </header>
  );
}
