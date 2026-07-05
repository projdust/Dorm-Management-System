import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Search, Plus, DoorOpen, Trash2 } from "lucide-react";
import EmptyState from "../../../components/ui/EmptyState";
import { SkeletonRow } from "../../../components/ui/Skeleton";
import StatusBadge from "../../../components/ui/StatusBadge";
import Modal from "../../../components/ui/Modal";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import * as roomsService from "../services/rooms.service";
import * as buildingsService from "../services/buildings.service";

export default function RoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomPendingDelete, setRoomPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function loadRooms(params = {}) {
    setIsLoading(true);
    try {
      const data = await roomsService.fetchAll(params);
      setRooms(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load rooms.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadRooms();
    buildingsService
      .fetchAll()
      .then(setBuildings)
      .catch(() => {});
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadRooms({ search });
  }

  async function handleConfirmDelete() {
    if (!roomPendingDelete) return;
    setIsDeleting(true);
    try {
      await roomsService.remove(roomPendingDelete.id);
      toast.success(`Room ${roomPendingDelete.roomNumber} deleted.`);
      setRoomPendingDelete(null);
      loadRooms();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete room.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search rooms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </form>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Add Room
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 uppercase border-b border-slate-100">
              <th className="pb-2 font-medium">Room Number</th>
              <th className="pb-2 font-medium">Building</th>
              <th className="pb-2 font-medium">Type</th>
              <th className="pb-2 font-medium">Capacity</th>
              <th className="pb-2 font-medium">Occupied</th>
              <th className="pb-2 font-medium">Available</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} columns={8} />)
            ) : rooms.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <EmptyState
                    icon={DoorOpen}
                    title="No rooms yet"
                    description="Add your first room to start assigning residents."
                    action={
                      <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                        Add Room
                      </button>
                    }
                  />
                </td>
              </tr>
            ) : (
              rooms.map((room) => (
                <tr key={room.id}>
                  <td className="py-3 font-medium text-slate-900">{room.roomNumber}</td>
                  <td className="py-3 text-slate-600">{room.building}</td>
                  <td className="py-3 text-slate-600 capitalize">{room.type.toLowerCase()}</td>
                  <td className="py-3 text-slate-600">{room.capacity}</td>
                  <td className="py-3 text-slate-600">{room.occupied}</td>
                  <td className="py-3 text-slate-600">{room.available}</td>
                  <td className="py-3">
                    <StatusBadge status={room.status} />
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => setRoomPendingDelete(room)}
                      className="text-red-600 hover:text-red-700 inline-flex items-center gap-1 text-sm font-medium"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        buildings={buildings}
        onCreated={() => {
          setIsModalOpen(false);
          loadRooms();
        }}
      />

      <ConfirmDialog
        isOpen={!!roomPendingDelete}
        title="Delete Room"
        message={
          roomPendingDelete
            ? `Are you sure you want to delete room ${roomPendingDelete.roomNumber}? This cannot be undone.`
            : ""
        }
        isSubmitting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setRoomPendingDelete(null)}
      />
    </div>
  );
}

function AddRoomModal({ isOpen, onClose, buildings, onCreated }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmit(values) {
    try {
      await roomsService.create({
        ...values,
        capacity: Number(values.capacity),
        monthlyRate: Number(values.monthlyRate),
      });
      toast.success("Room added successfully.");
      reset();
      onCreated();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add room.");
    }
  }

  return (
    <Modal title="Add Room" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Room Number</label>
          <input className="input-field" placeholder="e.g. A-104" {...register("roomNumber", { required: "Required" })} />
          {errors.roomNumber && <p className="text-xs text-red-600 mt-1">{errors.roomNumber.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Building</label>
          <select className="input-field" {...register("buildingId", { required: "Required" })}>
            <option value="">Choose a building</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          {errors.buildingId && <p className="text-xs text-red-600 mt-1">{errors.buildingId.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Type</label>
            <select className="input-field" {...register("type", { required: "Required" })}>
              <option value="SINGLE">Single</option>
              <option value="DOUBLE">Double</option>
              <option value="TRIPLE">Triple</option>
              <option value="QUADRUPLE">Quadruple</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Capacity</label>
            <input
              type="number"
              className="input-field"
              min={1}
              max={10}
              {...register("capacity", { required: "Required", min: 1, max: 10 })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Monthly Rate (₱)</label>
          <input
            type="number"
            step="0.01"
            className="input-field"
            placeholder="3500"
            {...register("monthlyRate", { required: "Required", min: 0 })}
          />
          {errors.monthlyRate && <p className="text-xs text-red-600 mt-1">{errors.monthlyRate.message}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? "Adding..." : "Add Room"}
          </button>
        </div>
      </form>
    </Modal>
  );
}