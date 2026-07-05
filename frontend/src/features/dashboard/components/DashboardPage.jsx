import { useEffect, useState } from "react";
import { Users, DoorOpen, DoorClosed, Wallet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";
import StatCard from "../../../components/ui/StatCard";
import { SkeletonCard, SkeletonRow } from "../../../components/ui/Skeleton";
import EmptyState from "../../../components/ui/EmptyState";
import * as dashboardService from "../services/dashboard.service";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [activity, setActivity] = useState([]);
  const [occupancy, setOccupancy] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [summaryData, activityData, occupancyData] = await Promise.all([
          dashboardService.fetchSummary(),
          dashboardService.fetchRecentActivity(5),
          dashboardService.fetchOccupancyByBuilding(),
        ]);
        setSummary(summaryData);
        setActivity(activityData);
        setOccupancy(occupancyData);
      } catch (err) {
        toast.error("Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard label="Total Residents" value={summary?.totalResidents ?? 0} icon={Users} accentColor="bg-blue-600" />
            <StatCard label="Occupied Beds" value={summary?.occupiedBeds ?? 0} icon={DoorClosed} accentColor="bg-emerald-600" />
            <StatCard label="Available Beds" value={summary?.availableBeds ?? 0} icon={DoorOpen} accentColor="bg-amber-500" />
            <StatCard
              label="Outstanding Utility Bills"
              value={`₱${Number(summary?.outstandingUtilityBills ?? 0).toLocaleString()}`}
              icon={Wallet}
              accentColor="bg-purple-600"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent activity table */}
        <div className="card">
          <h2 className="font-semibold text-slate-900 mb-4">Recent Resident Activity</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 uppercase border-b border-slate-100">
                <th className="pb-2 font-medium">Student</th>
                <th className="pb-2 font-medium">Room</th>
                <th className="pb-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} columns={3} />)
              ) : activity.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <EmptyState title="No recent activity" description="New check-ins and assignments will show up here." />
                  </td>
                </tr>
              ) : (
                activity.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3">
                      {item.tenant.user.firstName} {item.tenant.user.lastName}
                    </td>
                    <td className="py-3">{item.bed.room.roomNumber}</td>
                    <td className="py-3 text-slate-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Occupancy chart */}
        <div className="card">
          <h2 className="font-semibold text-slate-900 mb-4">Room Occupancy Overview</h2>
          {isLoading ? (
            <div className="h-64 bg-slate-50 rounded animate-pulse" />
          ) : occupancy.length === 0 ? (
            <EmptyState title="No room data yet" description="Add buildings and rooms to see occupancy here." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={occupancy}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="building" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="occupied" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="available" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
