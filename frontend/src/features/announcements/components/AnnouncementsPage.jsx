import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Megaphone, Pin, Trash2 } from "lucide-react";
import EmptyState from "../../../components/ui/EmptyState";
import { SkeletonRow } from "../../../components/ui/Skeleton";
import Modal from "../../../components/ui/Modal";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import * as announcementsService from "../services/announcements.service";
import { useAuth } from "../../../context/AuthContext";

/**
 * Announcements
 * Feed of announcements, pin/unpin, create new (ADMIN/STAFF only).
 */
export default function AnnouncementsPage() {
  const { user } = useAuth();
  const canManage = user?.role === "ADMIN" || user?.role === "STAFF";
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadAnnouncements() {
    setIsLoading(true);
    try {
      const data = await announcementsService.fetchAll();
      setAnnouncements(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load announcements.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadAnnouncements();
  }, []);

  async function handleTogglePin(announcement) {
    try {
      await announcementsService.update(announcement.id, { isPinned: !announcement.isPinned });
      loadAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update announcement.");
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await announcementsService.remove(pendingDelete.id);
      toast.success("Announcement deleted.");
      setPendingDelete(null);
      loadAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete announcement.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            New Announcement
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="card space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonRow key={i} columns={1} />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Megaphone}
            title="No announcements yet"
            description="Post an announcement so residents stay informed."
            action={
              canManage && (
                <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                  New Announcement
                </button>
              )
            }
          />
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div key={a.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    {a.isPinned && <Pin size={14} className="text-primary-600" />}
                    <h3 className="font-semibold text-slate-900">{a.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{a.content}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    By {a.createdByName} · {new Date(a.publishedAt).toLocaleDateString()}
                  </p>
                </div>
                {canManage && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleTogglePin(a)}
                      className="text-slate-400 hover:text-primary-600"
                      title={a.isPinned ? "Unpin" : "Pin"}
                    >
                      <Pin size={16} />
                    </button>
                    <button
                      onClick={() => setPendingDelete(a)}
                      className="text-slate-400 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <NewAnnouncementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => {
          setIsModalOpen(false);
          loadAnnouncements();
        }}
      />

      <ConfirmDialog
        isOpen={!!pendingDelete}
        title="Delete Announcement"
        message={pendingDelete ? `Delete "${pendingDelete.title}"? This cannot be undone.` : ""}
        isSubmitting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

function NewAnnouncementModal({ isOpen, onClose, onCreated }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(values) {
    try {
      await announcementsService.create(values);
      toast.success("Announcement posted.");
      reset();
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post announcement.");
    }
  }

  return (
    <Modal title="New Announcement" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
          <input className="input-field" {...register("title", { required: "Required" })} />
          {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Content</label>
          <textarea className="input-field" rows={4} {...register("content", { required: "Required" })} />
          {errors.content && <p className="text-xs text-red-600 mt-1">{errors.content.message}</p>}
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="isPinned" {...register("isPinned")} />
          <label htmlFor="isPinned" className="text-sm text-slate-700">
            Pin to top
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? "Posting..." : "Post Announcement"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
