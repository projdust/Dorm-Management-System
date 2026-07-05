import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

import LoginPage from "./features/auth/components/LoginPage";
import DashboardPage from "./features/dashboard/components/DashboardPage";
import TenantsPage from "./features/tenants/components/TenantsPage";
import RoomsPage from "./features/rooms/components/RoomsPage";
import BedAssignmentPage from "./features/bedAssignment/components/BedAssignmentPage";
import PaymentsPage from "./features/payments/components/PaymentsPage";
import BillingPage from "./features/billing/components/BillingPage";
import MaintenancePage from "./features/maintenance/components/MaintenancePage";
import AnnouncementsPage from "./features/announcements/components/AnnouncementsPage";
import VisitorLogsPage from "./features/visitorLogs/components/VisitorLogsPage";
import ReportsPage from "./features/reports/components/ReportsPage";
import SettingsPage from "./features/settings/components/SettingsPage";
import NotificationsPage from "./features/notifications/components/NotificationsPage";
import UsersPage from "./features/users/components/UsersPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tenants" element={<TenantsPage />} />
            <Route path="/rooms" element={<RoomsPage />} />
            <Route path="/bed-assignments" element={<BedAssignmentPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/maintenance-requests" element={<MaintenancePage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/visitor-logs" element={<VisitorLogsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route
              path="/settings"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute roles={["ADMIN"]}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
