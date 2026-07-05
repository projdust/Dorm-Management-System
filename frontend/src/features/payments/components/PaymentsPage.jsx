import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Receipt } from "lucide-react";
import EmptyState from "../../../components/ui/EmptyState";
import { SkeletonRow } from "../../../components/ui/Skeleton";
import StatusBadge from "../../../components/ui/StatusBadge";
import Modal from "../../../components/ui/Modal";
import * as paymentsService from "../services/payments.service";
import * as tenantsService from "../../tenants/services/tenants.service";

/**
 * Payments
 * List rent payments per tenant, filter by status, record new payment.
 */
export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function loadPayments(params = {}) {
    setIsLoading(true);
    try {
      const data = await paymentsService.fetchAll(params);
      setPayments(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load payments.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPayments();
    tenantsService
      .fetchAll()
      .then(setTenants)
      .catch(() => {});
  }, []);

  function handleFilterChange(e) {
    const status = e.target.value;
    setStatusFilter(status);
    loadPayments(status ? { status } : {});
  }

  async function handleStatusChange(payment, status) {
    try {
      await paymentsService.update(payment.id, { status });
      toast.success("Payment status updated.");
      loadPayments(statusFilter ? { status: statusFilter } : {});
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update payment status.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <select value={statusFilter} onChange={handleFilterChange} className="input-field max-w-xs">
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="PARTIAL">Partial</option>
          <option value="OVERDUE">Overdue</option>
          <option value="REFUNDED">Refunded</option>
        </select>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Record Payment
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 uppercase border-b border-slate-100">
              <th className="pb-2 font-medium">Resident</th>
              <th className="pb-2 font-medium">Amount</th>
              <th className="pb-2 font-medium">Method</th>
              <th className="pb-2 font-medium">Period</th>
              <th className="pb-2 font-medium">Paid At</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} columns={7} />)
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState
                    icon={Receipt}
                    title="No payments yet"
                    description="Record your first rent payment to start tracking collections."
                    action={
                      <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                        Record Payment
                      </button>
                    }
                  />
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="py-3 font-medium text-slate-900">{payment.tenantName}</td>
                  <td className="py-3 text-slate-600">₱{Number(payment.amount).toLocaleString()}</td>
                  <td className="py-3 text-slate-600 capitalize">{payment.method.toLowerCase().replace("_", " ")}</td>
                  <td className="py-3 text-slate-600">
                    {new Date(payment.periodStart).toLocaleDateString()} - {new Date(payment.periodEnd).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-slate-600">
                    {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : "-"}
                  </td>
                  <td className="py-3">
                    <StatusBadge status={payment.status} />
                  </td>
                  <td className="py-3">
                    <select
                      className="input-field text-xs py-1"
                      value={payment.status}
                      onChange={(e) => handleStatusChange(payment, e.target.value)}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid</option>
                      <option value="PARTIAL">Partial</option>
                      <option value="OVERDUE">Overdue</option>
                      <option value="REFUNDED">Refunded</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <RecordPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tenants={tenants}
        onCreated={() => {
          setIsModalOpen(false);
          loadPayments();
        }}
      />
    </div>
  );
}

function RecordPaymentModal({ isOpen, onClose, tenants, onCreated }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(values) {
    try {
      await paymentsService.create({ ...values, amount: Number(values.amount) });
      toast.success("Payment recorded.");
      reset();
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record payment.");
    }
  }

  return (
    <Modal title="Record Payment" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Resident</label>
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (₱)</label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              {...register("amount", { required: "Required", min: 0 })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Method</label>
            <select className="input-field" {...register("method", { required: "Required" })}>
              <option value="CASH">Cash</option>
              <option value="GCASH">GCash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CARD">Card</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Period Start</label>
            <input type="date" className="input-field" {...register("periodStart", { required: "Required" })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Period End</label>
            <input type="date" className="input-field" {...register("periodEnd", { required: "Required" })} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
          <select className="input-field" {...register("status")}>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="PARTIAL">Partial</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? "Saving..." : "Record Payment"}
          </button>
        </div>
      </form>
    </Modal>
  );
}