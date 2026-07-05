import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Building2, DollarSign, AlertTriangle, Wrench } from "lucide-react";
import { SkeletonRow } from "../../../components/ui/Skeleton";
import * as reportsService from "../services/reports.service";

/**
 * Reports
 * Read-only aggregated views: occupancy, revenue, overdue payments, maintenance summary.
 */
export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await reportsService.fetchAll();
        setReport(data);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load reports.");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="card space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonRow key={i} columns={1} />
        ))}
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Building2 size={16} className="text-primary-600" />
            Occupancy by Building
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 uppercase border-b border-slate-100">
                <th className="pb-2 font-medium">Building</th>
                <th className="pb-2 font-medium">Occupied</th>
                <th className="pb-2 font-medium">Vacant</th>
                <th className="pb-2 font-medium">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {report.occupancy.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-slate-400 text-center">
                    No buildings yet.
                  </td>
                </tr>
              ) : (
                report.occupancy.map((b) => (
                  <tr key={b.building}>
                    <td className="py-2 font-medium text-slate-900">{b.building}</td>
                    <td className="py-2 text-slate-600">{b.occupiedBeds}</td>
                    <td className="py-2 text-slate-600">{b.vacantBeds}</td>
                    <td className="py-2 text-slate-600">{b.occupancyRate}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <DollarSign size={16} className="text-primary-600" />
            Revenue
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Stat label="Rent Collected" value={`₱${Number(report.revenue.rentCollected).toLocaleString()}`} />
            <Stat label="Utility Collected" value={`₱${Number(report.revenue.utilityCollected).toLocaleString()}`} />
            <Stat label="Rent Outstanding" value={`₱${Number(report.revenue.rentOutstanding).toLocaleString()}`} />
            <Stat label="Utility Outstanding" value={`₱${Number(report.revenue.utilityOutstanding).toLocaleString()}`} />
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-600" />
            Overdue Payments & Bills
          </h3>
          {report.overdue.overduePayments.length === 0 && report.overdue.overdueBills.length === 0 ? (
            <p className="text-sm text-slate-400">Nothing overdue right now.</p>
          ) : (
            <ul className="text-sm space-y-2">
              {report.overdue.overduePayments.map((p) => (
                <li key={p.id} className="flex justify-between">
                  <span className="text-slate-700">{p.tenantName} (rent)</span>
                  <span className="text-red-600 font-medium">₱{Number(p.amount).toLocaleString()}</span>
                </li>
              ))}
              {report.overdue.overdueBills.map((b) => (
                <li key={b.id} className="flex justify-between">
                  <span className="text-slate-700">
                    {b.tenantName} ({b.type.toLowerCase()})
                  </span>
                  <span className="text-red-600 font-medium">₱{Number(b.amount).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Wrench size={16} className="text-primary-600" />
            Maintenance Summary
          </h3>
          {report.maintenanceSummary.length === 0 ? (
            <p className="text-sm text-slate-400">No maintenance requests yet.</p>
          ) : (
            <ul className="text-sm space-y-2">
              {report.maintenanceSummary.map((m) => (
                <li key={m.status} className="flex justify-between">
                  <span className="text-slate-700 capitalize">{m.status.toLowerCase().replace("_", " ")}</span>
                  <span className="font-medium text-slate-900">{m.count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400 uppercase">{label}</p>
      <p className="font-semibold text-slate-900 mt-1">{value}</p>
    </div>
  );
}
