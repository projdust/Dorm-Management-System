import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Search, Plus, ShieldCheck, Ban, Check } from "lucide-react";
import EmptyState from "../../../components/ui/EmptyState";
import { SkeletonRow } from "../../../components/ui/Skeleton";
import StatusBadge from "../../../components/ui/StatusBadge";
import Modal from "../../../components/ui/Modal";
import * as usersService from "../services/users.service";

/**
 * User & Role Management
 * ADMIN-only: manage user accounts and roles (Admin/Staff/Tenant)
 */
export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function loadUsers(params = {}) {
    setIsLoading(true);
    try {
      const data = await usersService.fetchAll(params);
      setUsers(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadUsers({ search });
  }

  async function handleToggleActive(user) {
    try {
      await usersService.update(user.id, { isActive: !user.isActive });
      toast.success(`${user.firstName} ${user.lastName} ${user.isActive ? "deactivated" : "reactivated"}.`);
      loadUsers(search ? { search } : {});
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </form>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add User
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 uppercase border-b border-slate-100">
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium">Email</th>
              <th className="pb-2 font-medium">Role</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} columns={5} />)
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    icon={ShieldCheck}
                    title="No users yet"
                    description="Add your first admin or staff account."
                    action={
                      <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                        Add User
                      </button>
                    }
                  />
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td className="py-3 font-medium text-slate-900">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="py-3 text-slate-600">{u.email}</td>
                  <td className="py-3 text-slate-600 capitalize">{u.role.toLowerCase()}</td>
                  <td className="py-3">
                    <StatusBadge status={u.isActive ? "ACTIVE" : "INACTIVE"} />
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => handleToggleActive(u)}
                      className={`inline-flex items-center gap-1 text-sm font-medium ${
                        u.isActive ? "text-red-600 hover:text-red-700" : "text-emerald-600 hover:text-emerald-700"
                      }`}
                    >
                      {u.isActive ? <Ban size={14} /> : <Check size={14} />}
                      {u.isActive ? "Deactivate" : "Reactivate"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => {
          setIsModalOpen(false);
          loadUsers();
        }}
      />
    </div>
  );
}

function AddUserModal({ isOpen, onClose, onCreated }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(values) {
    try {
      await usersService.create(values);
      toast.success("User added successfully.");
      reset();
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add user.");
    }
  }

  return (
    <Modal title="Add User" isOpen={isOpen} onClose={onClose}>
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
          <input type="email" className="input-field" {...register("email", { required: "Required" })} />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
          <input
            type="password"
            className="input-field"
            placeholder="Leave blank for default password"
            {...register("password")}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
          <select className="input-field" {...register("role", { required: "Required" })}>
            <option value="TENANT">Tenant</option>
            <option value="STAFF">Staff</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? "Adding..." : "Add User"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
