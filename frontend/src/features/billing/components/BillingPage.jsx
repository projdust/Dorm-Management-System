import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Zap, Check } from "lucide-react";
import EmptyState from "../../../components/ui/EmptyState";
import { SkeletonRow } from "../../../components/ui/Skeleton";
import StatusBadge from "../../../components/ui/StatusBadge";
import Modal from "../../../components/ui/Modal";
import * as billingService from "../services/billing.service";
import * as tenantsService from "../../tenants/services/tenants.service";

/**
 * Utility Billing
 * List utility bills (Electricity/Water/Internet) per tenant/month, mark as paid.
 */
export default function BillingPage() {
  const [bills, setBills] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function loadBills(params = {}) {
    setIsLoading(true);
    try {
      const data = await billingService.fetchAll(params);
      setBills(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load bills.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBills();
    tenantsService
      .fetchAll()
      .then(setTenants)
      .catch(() => {});
  }, []);

  function handleFilterChange(e) {
    const status = e.target.value;
    setStatusFilter(status);
    loadBills(status ? { status } : {});
  }

  async function handleMarkPaid(bill) {
    try {
      await billingService.update(bill.id, { status: "PAID" });
      toast.success("Bill marked as paid.");
      loadBills(statusFilter ? { status: statusFilter } : {});
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update bill.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <select value={statusFilter} onChange={handleFilterChange} className="input-field max-w-xs">
          <option value="">All statuses</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
        </select>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add Bill
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 uppercase border-b border-slate-100">
              <th className="pb-2 font-medium">Resident</th>
              <th className="pb-2 font-medium">Type</th>
              <th className="pb-2 font-medium">Amount</th>
              <th className="pb-2 font-medium">Billing Month</th>
              <th className="pb-2 font-medium">Due Date</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} columns={7} />)
            ) : bills.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState
                    icon={Zap}
                    title="No utility bills yet"
                    description="Add a bill to start tracking utility charges per resident."
                    action={
                      <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                        Add Bill
                      </button>
                    }
                  />
                </td>
              </tr>
            ) : (
              bills.map((bill) => (
                <tr key={bill.id}>
                  <td className="py-3 font-medium text-slate-900">{bill.tenantName}</td>
                  <td className="py-3 text-slate-600 capitalize">{bill.type.toLowerCase()}</td>
                  <td className="py-3 text-slate-600">₱{Number(bill.amount).toLocaleString()}</td>
                  <td className="py-3 text-slate-600">
                    {new Date(bill.billingMonth).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
                  </td>
                  <td className="py-3 text-slate-600">{new Date(bill.dueDate).toLocaleDateString()}</td>
                  <td className="py-3">
                    <StatusBadge status={bill.status} />
                  </td>
                  <td className="py-3">
                    {bill.status !== "PAID" && (
                      <button
                        onClick={() => handleMarkPaid(bill)}
                        className="text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 text-sm font-medium"
                      >
                        <Check size={14} />
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddBillModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tenants={tenants}
        onCreated={() => {
          setIsModalOpen(false);
          loadBills();
        }}
      />
    </div>
  );
}

function AddBillModal({ isOpen, onClose, tenants, onCreated }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(values) {
    try {
      await billingService.create({ ...values, amount: Number(values.amount) });
      toast.success("Bill added.");
      reset();
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add bill.");
    }
  }

  return (
    <Modal title="Add Utility Bill" isOpen={isOpen} onClose={onClose}>
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
            <select className="input-field" {...register("type", { required: "Required" })}>
              <option value="ELECTRICITY">Electricity</option>
              <option value="WATER">Water</option>
              <option value="INTERNET">Internet</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Amount (₱)</label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              {...register("amount", { required: "Required", min: 0 })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Billing Month</label>
            <input type="date" className="input-field" {...register("billingMonth", { required: "Required" })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Due Date</label>
            <input type="date" className="input-field" {...register("dueDate", { required: "Required" })} />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? "Saving..." : "Add Bill"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
