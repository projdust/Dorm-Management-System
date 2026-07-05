import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Bell, Check, Trash2 } from "lucide-react";
import EmptyState from "../../../components/ui/EmptyState";
import { SkeletonRow } from "../../../components/ui/Skeleton";
import * as notificationsService from "../services/notifications.service";

const TYPE_LABELS = {
  ANNOUNCEMENT: "Announcement",
  PAYMENT_DUE: "Payment Due",
  MAINTENANCE_UPDATE: "Maintenance Update",
  SYSTEM: "System",
};

/**
 * Notifications
 * List of notifications for the logged-in user, mark as read.
 */
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("");

  async function loadNotifications(params = {}) {
    setIsLoading(true);
    try {
      const data = await notificationsService.fetchAll(params);
      setNotifications(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load notifications.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  function handleFilterChange(e) {
    const value = e.target.value;
    setFilter(value);
    loadNotifications(value ? { isRead: value } : {});
  }

  async function handleMarkRead(notification) {
    try {
      await notificationsService.update(notification.id, { isRead: true });
      loadNotifications(filter ? { isRead: filter } : {});
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update notification.");
    }
  }

  async function handleDelete(notification) {
    try {
      await notificationsService.remove(notification.id);
      toast.success("Notification removed.");
      loadNotifications(filter ? { isRead: filter } : {});
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove notification.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <select value={filter} onChange={handleFilterChange} className="input-field max-w-xs">
          <option value="">All</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
      </div>

      {isLoading ? (
        <div className="card space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonRow key={i} columns={1} />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You're all caught up. New notifications will appear here."
          />
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`card flex items-start justify-between gap-3 ${!n.isRead ? "border-l-4 border-primary-500" : ""}`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="badge bg-slate-100 text-slate-600 text-xs">
                    {TYPE_LABELS[n.type] || n.type}
                  </span>
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary-600" />}
                </div>
                <h3 className="font-semibold text-slate-900 mt-1">{n.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                <p className="text-xs text-slate-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkRead(n)}
                    className="text-slate-400 hover:text-primary-600"
                    title="Mark as read"
                  >
                    <Check size={16} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n)}
                  className="text-slate-400 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
