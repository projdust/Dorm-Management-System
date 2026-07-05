import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Wrench } from "lucide-react";
import EmptyState from "../../../components/ui/EmptyState";
import { SkeletonRow } from "../../../components/ui/Skeleton";
import StatusBadge from "../../../components/ui/StatusBadge";
import Modal from "../../../components/ui/Modal";
import * as maintenanceService from "../services/maintenance.service";

const PRIORITY_COLORS = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-amber-50 text-amber-600",
  HIGH: "bg-orange-50 text-orange-600",
  URGENT: "bg-red-50 text-red-600",
};

/**
 * Maintenance Requests
 * List view of requests by status (Open/In Progress/Resolved/Closed), priority badges.
 */
export default function MaintenancePage() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function loadRequests(params = {}) {
    setIsLoading(true);
    try {
      const data = await maintenanceService.fetchAll(params);
      setRequests(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load maintenance requests.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  function handleFilterChange(e) {
    const status = e.target.value;
    setStatusFilter(status);
    loadRequests(status ? { status } : {});
  }

  async function handleStatusChange(request, status) {
    try {
      await maintenanceService.update(request.id, { status });
      toast.success("Status updated.");
      loadRequests(statusFilter ? { status: statusFilter } : {});
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <select value={statusFilter} onChange={handleFilterChange} className="input-field max-w-xs">
          <option value="">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          New Request
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 uppercase border-b border-slate-100">
              <th className="pb-2 font-medium">Title</th>
              <th className="pb-2 font-medium">Room</th>
              <th className="pb-2 font-medium">Requested By</th>
              <th className="pb-2 font-medium">Priority</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} columns={6} />)
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <EmptyState
                    icon={Wrench}
                    title="No maintenance requests"
                    description="File a request when something needs fixing."
                    action={
                      <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                        New Request
                      </button>
                    }
                  />
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id}>
                  <td className="py-3 font-medium text-slate-900">{request.title}</td>
                  <td className="py-3 text-slate-600">{request.roomNumber || "-"}</td>
                  <td className="py-3 text-slate-600">{request.requestedByName}</td>
                  <td className="py-3">
                    <span className={`badge ${PRIORITY_COLORS[request.priority]}`}>
                      {request.priority}
                    </span>
                  </td>
                  <td className="py-3">
                    <StatusBadge status={request.status} />
                  </td>
                  <td className="py-3">
                    <select
                      className="input-field text-xs py-1"
                      value={request.status}
                      onChange={(e) => handleStatusChange(request, e.target.value)}
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <NewRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => {
          setIsModalOpen(false);
          loadRequests();
        }}
      />
    </div>
  );
}

function NewRequestModal({ isOpen, onClose, onCreated }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(values) {
    try {
      await maintenanceService.create(values);
      toast.success("Request submitted.");
      reset();
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit request.");
    }
  }

  return (
    <Modal title="New Maintenance Request" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
          <input className="input-field" placeholder="e.g. Leaking faucet" {...register("title", { required: "Required" })} />
          {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea
            className="input-field"
            rows={3}
            {...register("description", { required: "Required" })}
          />
          {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
          <select className="input-field" {...register("priority")}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
