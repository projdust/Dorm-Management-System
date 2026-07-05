import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { BedDouble, LogOut } from "lucide-react";
import EmptyState from "../../../components/ui/EmptyState";
import { SkeletonRow } from "../../../components/ui/Skeleton";
import StatusBadge from "../../../components/ui/StatusBadge";
import * as bedAssignmentService from "../services/bedAssignment.service";
import * as tenantsService from "../../tenants/services/tenants.service";
import * as roomsService from "../../rooms/services/rooms.service";

/**
 * Room Allocation
 * Two-column layout: assignment form (left) + active assignments list (right).
 */
export default function BedAssignmentPage() {
  const [assignments, setAssignments] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadAssignments() {
    setIsLoading(true);
    try {
      const data = await bedAssignmentService.fetchAll({ status: "ACTIVE" });
      setAssignments(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load assignments.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadFormData() {
    try {
      const [tenantsData, roomsData] = await Promise.all([
        tenantsService.fetchAll(),
        roomsService.fetchAll(),
      ]);
      setTenants(tenantsData.filter((t) => !t.room));
      setRooms(roomsData);
    } catch {
      // form data is best-effort
    }
  }

  useEffect(() => {
    loadAssignments();
    loadFormData();
  }, []);

  async function handleEndAssignment(assignment) {
    try {
      await bedAssignmentService.remove(assignment.id);
      toast.success(`${assignment.tenantName} moved out of ${assignment.roomNumber}.`);
      loadAssignments();
      loadFormData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to end assignment.");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="card">
        <h2 className="font-semibold text-slate-900 mb-4">Assign Resident to Bed</h2>
        <AssignmentForm
          tenants={tenants}
          rooms={rooms}
          onAssigned={() => {
            loadAssignments();
            loadFormData();
          }}
        />
      </div>

      <div className="card overflow-x-auto">
        <h2 className="font-semibold text-slate-900 mb-4">Active Assignments</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 uppercase border-b border-slate-100">
              <th className="pb-2 font-medium">Resident</th>
              <th className="pb-2 font-medium">Room / Bed</th>
              <th className="pb-2 font-medium">Move-in</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} columns={5} />)
            ) : assignments.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    icon={BedDouble}
                    title="No active assignments"
                    description="Assign a resident to a bed using the form on the left."
                  />
                </td>
              </tr>
            ) : (
              assignments.map((a) => (
                <tr key={a.id}>
                  <td className="py-3 font-medium text-slate-900">{a.tenantName}</td>
                  <td className="py-3 text-slate-600">
                    {a.roomNumber} ({a.bedLabel})
                  </td>
                  <td className="py-3 text-slate-600">{new Date(a.moveInDate).toLocaleDateString()}</td>
                  <td className="py-3">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => handleEndAssignment(a)}
                      className="text-red-600 hover:text-red-700 inline-flex items-center gap-1 text-sm font-medium"
                    >
                      <LogOut size={14} />
                      End
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AssignmentForm({ tenants, rooms, onAssigned }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const selectedRoomId = watch("roomId");
  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const availableBeds = selectedRoom ? selectedRoom.beds.filter((b) => b.status === "VACANT") : [];

  async function onSubmit(values) {
    try {
      await bedAssignmentService.create({
        tenantId: values.tenantId,
        bedId: values.bedId,
        moveInDate: values.moveInDate,
      });
      toast.success("Resident assigned to bed.");
      reset();
      onAssigned();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign resident.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Resident</label>
        <select className="input-field" {...register("tenantId", { required: "Required" })}>
          <option value="">Choose an unassigned resident</option>
          {tenants.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        {errors.tenantId && <p className="text-xs text-red-600 mt-1">{errors.tenantId.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Room</label>
        <select className="input-field" {...register("roomId", { required: "Required" })}>
          <option value="">Choose a room</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.building} - {r.roomNumber} ({r.available} available)
            </option>
          ))}
        </select>
        {errors.roomId && <p className="text-xs text-red-600 mt-1">{errors.roomId.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Bed</label>
        <select className="input-field" {...register("bedId", { required: "Required" })} disabled={!selectedRoomId}>
          <option value="">{selectedRoomId ? "Choose a bed" : "Select a room first"}</option>
          {availableBeds.map((b) => (
            <option key={b.id} value={b.id}>
              {b.bedLabel}
            </option>
          ))}
        </select>
        {errors.bedId && <p className="text-xs text-red-600 mt-1">{errors.bedId.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Move-in Date</label>
        <input type="date" className="input-field" {...register("moveInDate", { required: "Required" })} />
        {errors.moveInDate && <p className="text-xs text-red-600 mt-1">{errors.moveInDate.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
        {isSubmitting ? "Assigning..." : "Assign Resident"}
      </button>
    </form>
  );
}
