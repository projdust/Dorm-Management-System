export default function StatCard({ label, value, icon: Icon, accentColor = "bg-primary-600" }) {
  return (
    <div className="card flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
      </div>
      {Icon && (
        <div className={`w-11 h-11 rounded-lg ${accentColor} flex items-center justify-center text-white`}>
          <Icon size={20} />
        </div>
      )}
    </div>
  );
}
