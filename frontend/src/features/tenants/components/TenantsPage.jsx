import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Search, Plus, Users, Trash2, Pencil, RotateCcw } from "lucide-react";
import EmptyState from "../../../components/ui/EmptyState";
import { SkeletonRow } from "../../../components/ui/Skeleton";
import StatusBadge from "../../../components/ui/StatusBadge";
import Modal from "../../../components/ui/Modal";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import * as tenantsService from "../services/tenants.service";

/**
 * Residents Management
 * List/search/add/edit/remove tenants: Name, Room, Move-in, Contact, Email, Status, Actions
 */
export default function TenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [tenantBeingEdited, setTenantBeingEdited] = useState(null);
  const [tenantPendingDelete, setTenantPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadTenants(params = {}) {
    setIsLoading(true);
    try {
      const data = await tenantsService.fetchAll(params);
      setTenants(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load residents.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTenants();
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadTenants({ search });
  }

  async function handleConfirmDelete() {
    if (!tenantPendingDelete) return;
    setIsDeleting(true);
    try {
      await tenantsService.remove(tenantPendingDelete.id);
      toast.success(`${tenantPendingDelete.name} moved out.`);
      setTenantPendingDelete(null);
      loadTenants();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove resident.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleReactivate(tenant) {
    try {
      await tenantsService.update(tenant.id, { isActive: true, moveOutDate: null });
      toast.success(`${tenant.name} reactivated.`);
      loadTenants(search ? { search } : {});
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reactivate resident.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search residents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </form>
        <button onClick={() => setIsAddModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add Resident
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 uppercase border-b border-slate-100">
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium">Room</th>
              <th className="pb-2 font-medium">Move-in</th>
              <th className="pb-2 font-medium">Contact</th>
              <th className="pb-2 font-medium">Email</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} columns={7} />)
            ) : tenants.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState
                    icon={Users}
                    title="No residents yet"
                    description="Add your first resident to start managing occupancy."
                    action={
                      <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
                        Add Resident
                      </button>
                    }
                  />
                </td>
              </tr>
            ) : (
              tenants.map((tenant) => (
                <tr key={tenant.id}>
                  <td className="py-3 font-medium text-slate-900">{tenant.name}</td>
                  <td className="py-3 text-slate-600">
                    {tenant.room ? `${tenant.room} (${tenant.bedLabel})` : "Unassigned"}
                  </td>
                  <td className="py-3 text-slate-600">
                    {tenant.moveInDate ? new Date(tenant.moveInDate).toLocaleDateString() : "-"}
                  </td>
                  <td className="py-3 text-slate-600">{tenant.phone || "-"}</td>
                  <td className="py-3 text-slate-600">{tenant.email}</td>
                  <td className="py-3">
                    <StatusBadge status={tenant.status} />
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setTenantBeingEdited(tenant)}
                        className="text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 text-sm font-medium"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      {tenant.isActive ? (
                        <button
                          onClick={() => setTenantPendingDelete(tenant)}
                          className="text-red-600 hover:text-red-700 inline-flex items-center gap-1 text-sm font-medium"
                        >
                          <Trash2 size={14} />
                          Move out
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(tenant)}
                          className="text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 text-sm font-medium"
                        >
                          <RotateCcw size={14} />
                          Reactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddTenantModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreated={() => {
          setIsAddModalOpen(false);
          loadTenants();
        }}
      />

      <EditTenantModal
        tenant={tenantBeingEdited}
        onClose={() => setTenantBeingEdited(null)}
        onSaved={() => {
          setTenantBeingEdited(null);
          loadTenants(search ? { search } : {});
        }}
      />

      <ConfirmDialog
        isOpen={!!tenantPendingDelete}
        title="Move Out Resident"
        message={
          tenantPendingDelete
            ? `Are you sure you want to mark ${tenantPendingDelete.name} as moved out? Their records will be kept but they'll be deactivated.`
            : ""
        }
        confirmLabel="Move Out"
        isSubmitting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setTenantPendingDelete(null)}
      />
    </div>
  );
}

function AddTenantModal({ isOpen, onClose, onCreated }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(values) {
    try {
      await tenantsService.create(values);
      toast.success("Resident added successfully.");
      reset();
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add resident.");
    }
  }

  return (
    <Modal title="Add Resident" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
            <input className="input-field" {...register("firstName", { required: "Required" })} />
            {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
            <input className="input-field" {...register("lastName", { required: "Required" })} />
            {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
          <input
            type="email"
            className="input-field"
            {...register("email", { required: "Required" })}
          />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
            <input className="input-field" {...register("phone")} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Student ID</label>
            <input className="input-field" {...register("studentId")} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Move-in Date</label>
          <input type="date" className="input-field" {...register("moveInDate")} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? "Adding..." : "Add Resident"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function toDateInputValue(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().slice(0, 10);
}

function EditTenantModal({ tenant, onClose, onSaved }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  // Re-populate the form whenever a different tenant is opened for editing.
  useEffect(() => {
    if (tenant) {
      reset({
        firstName: tenant.name?.split(" ")[0] || "",
        lastName: tenant.name?.split(" ").slice(1).join(" ") || "",
        phone: tenant.phone || "",
        studentId: tenant.studentId || "",
        emergencyContactName: tenant.emergencyContactName || "",
        emergencyContactPhone: tenant.emergencyContactPhone || "",
        guardianName: tenant.guardianName || "",
        guardianPhone: tenant.guardianPhone || "",
        moveInDate: toDateInputValue(tenant.moveInDate),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant]);

  async function onSubmit(values) {
    try {
      await tenantsService.update(tenant.id, values);
      toast.success("Resident updated.");
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update resident.");
    }
  }

  return (
    <Modal title="Edit Resident" isOpen={!!tenant} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
            <input className="input-field" {...register("firstName", { required: "Required" })} />
            {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
            <input className="input-field" {...register("lastName", { required: "Required" })} />
            {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
            <input className="input-field" {...register("phone")} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Student ID</label>
            <input className="input-field" {...register("studentId")} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Emergency Contact Name</label>
            <input className="input-field" {...register("emergencyContactName")} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Emergency Contact Phone</label>
            <input className="input-field" {...register("emergencyContactPhone")} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Guardian Name</label>
            <input className="input-field" {...register("guardianName")} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Guardian Phone</label>
            <input className="input-field" {...register("guardianPhone")} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Move-in Date</label>
          <input type="date" className="input-field" {...register("moveInDate")} />
        </div>

        <p className="text-xs text-slate-400">
          Email can't be changed here since it's tied to the resident's login account.
        </p>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}