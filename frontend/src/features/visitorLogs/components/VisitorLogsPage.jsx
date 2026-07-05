import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, UserCheck, LogOut } from "lucide-react";
import EmptyState from "../../../components/ui/EmptyState";
import { SkeletonRow } from "../../../components/ui/Skeleton";
import StatusBadge from "../../../components/ui/StatusBadge";
import Modal from "../../../components/ui/Modal";
import * as visitorLogsService from "../services/visitorLogs.service";
import * as tenantsService from "../../tenants/services/tenants.service";

/**
 * Visitor Logs
 * Check-in/check-out log table per tenant, filter by status.
 */
export default function VisitorLogsPage() {
  const [logs, setLogs] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function loadLogs(params = {}) {
    setIsLoading(true);
    try {
      const data = await visitorLogsService.fetchAll(params);
      setLogs(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load visitor logs.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadLogs();
    tenantsService
      .fetchAll()
      .then(setTenants)
      .catch(() => {});
  }, []);

  function handleFilterChange(e) {
    const status = e.target.value;
    setStatusFilter(status);
    loadLogs(status ? { status } : {});
  }

  async function handleCheckOut(log) {
    try {
      await visitorLogsService.update(log.id, { checkOut: true });
      toast.success(`${log.visitorName} checked out.`);
      loadLogs(statusFilter ? { status: statusFilter } : {});
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to check out visitor.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <select value={statusFilter} onChange={handleFilterChange} className="input-field max-w-xs">
          <option value="">All</option>
          <option value="CHECKED_IN">Checked In</option>
          <option value="CHECKED_OUT">Checked Out</option>
        </select>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Log Visitor
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 uppercase border-b border-slate-100">
              <th className="pb-2 font-medium">Visitor</th>
              <th className="pb-2 font-medium">Visiting</th>
              <th className="pb-2 font-medium">Purpose</th>
              <th className="pb-2 font-medium">Check-in</th>
              <th className="pb-2 font-medium">Check-out</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} columns={7} />)
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState
                    icon={UserCheck}
                    title="No visitor logs yet"
                    description="Log a visitor check-in to start tracking building access."
                    action={
                      <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                        Log Visitor
                      </button>
                    }
                  />
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="py-3 font-medium text-slate-900">{log.visitorName}</td>
                  <td className="py-3 text-slate-600">{log.tenantName}</td>
                  <td className="py-3 text-slate-600">{log.purpose || "-"}</td>
                  <td className="py-3 text-slate-600">{new Date(log.checkInTime).toLocaleString()}</td>
                  <td className="py-3 text-slate-600">
                    {log.checkOutTime ? new Date(log.checkOutTime).toLocaleString() : "-"}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="py-3">
                    {log.status === "CHECKED_IN" && (
                      <button
                        onClick={() => handleCheckOut(log)}
                        className="text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 text-sm font-medium"
                      >
                        <LogOut size={14} />
                        Check out
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <LogVisitorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tenants={tenants}
        onCreated={() => {
          setIsModalOpen(false);
          loadLogs();
        }}
      />
    </div>
  );
}

function LogVisitorModal({ isOpen, onClose, tenants, onCreated }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(values) {
    try {
      await visitorLogsService.create(values);
      toast.success("Visitor checked in.");
      reset();
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to log visitor.");
    }
  }

  return (
    <Modal title="Log Visitor" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Visiting Resident</label>
          <select className="input-field" {...register("tenantId", { required: "Required" })}>
            <option value="">Choose a resident</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {errors.tenantId && <p className="text-xs text-red-600 mt-1">{errors.tenantId.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Visitor Name</label>
          <input className="input-field" {...register("visitorName", { required: "Required" })} />
          {errors.visitorName && <p className="text-xs text-red-600 mt-1">{errors.visitorName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact (optional)</label>
          <input className="input-field" {...register("visitorContact")} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Purpose (optional)</label>
          <input className="input-field" {...register("purpose")} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? "Saving..." : "Check In"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
