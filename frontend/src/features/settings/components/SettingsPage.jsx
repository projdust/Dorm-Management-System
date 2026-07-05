import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Settings as SettingsIcon, Trash2 } from "lucide-react";
import EmptyState from "../../../components/ui/EmptyState";
import { SkeletonRow } from "../../../components/ui/Skeleton";
import Modal from "../../../components/ui/Modal";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import * as settingsService from "../services/settings.service";

/**
 * System Settings
 * ADMIN-only key-value settings: dorm name, currency, late fee rules, etc.
 */
export default function SettingsPage() {
  const [settings, setSettings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingValues, setEditingValues] = useState({});

  async function loadSettings() {
    setIsLoading(true);
    try {
      const data = await settingsService.fetchAll();
      setSettings(data);
      setEditingValues(Object.fromEntries(data.map((s) => [s.id, s.value])));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load settings.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function handleSave(setting) {
    const value = editingValues[setting.id];
    if (value === setting.value) return;
    try {
      await settingsService.update(setting.id, { value });
      toast.success(`${setting.key} updated.`);
      loadSettings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update setting.");
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await settingsService.remove(pendingDelete.id);
      toast.success("Setting removed.");
      setPendingDelete(null);
      loadSettings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove setting.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add Setting
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 uppercase border-b border-slate-100">
              <th className="pb-2 font-medium">Key</th>
              <th className="pb-2 font-medium">Value</th>
              <th className="pb-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} columns={3} />)
            ) : settings.length === 0 ? (
              <tr>
                <td colSpan={3}>
                  <EmptyState
                    icon={SettingsIcon}
                    title="No settings configured"
                    description="Add key-value settings like dorm name, currency, or late fee rules."
                    action={
                      <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                        Add Setting
                      </button>
                    }
                  />
                </td>
              </tr>
            ) : (
              settings.map((s) => (
                <tr key={s.id}>
                  <td className="py-3 font-medium text-slate-900">{s.key}</td>
                  <td className="py-3">
                    <input
                      className="input-field"
                      value={editingValues[s.id] ?? ""}
                      onChange={(e) => setEditingValues((prev) => ({ ...prev, [s.id]: e.target.value }))}
                      onBlur={() => handleSave(s)}
                    />
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => setPendingDelete(s)}
                      className="text-red-600 hover:text-red-700 inline-flex items-center gap-1 text-sm font-medium"
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddSettingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => {
          setIsModalOpen(false);
          loadSettings();
        }}
      />

      <ConfirmDialog
        isOpen={!!pendingDelete}
        title="Remove Setting"
        message={pendingDelete ? `Remove "${pendingDelete.key}"? This cannot be undone.` : ""}
        isSubmitting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

function AddSettingModal({ isOpen, onClose, onCreated }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(values) {
    try {
      await settingsService.create(values);
      toast.success("Setting added.");
      reset();
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add setting.");
    }
  }

  return (
    <Modal title="Add Setting" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Key</label>
          <input className="input-field" placeholder="e.g. dorm_name" {...register("key", { required: "Required" })} />
          {errors.key && <p className="text-xs text-red-600 mt-1">{errors.key.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Value</label>
          <input className="input-field" {...register("value", { required: "Required" })} />
          {errors.value && <p className="text-xs text-red-600 mt-1">{errors.value.message}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? "Adding..." : "Add Setting"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
