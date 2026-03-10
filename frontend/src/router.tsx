import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {
  RequireAuth,
  RequireRole,
  RedirectIfAuth,
} from "@/components/layout/RoleGuard";
import RoleBasedRedirect from "@/components/layout/RoleBasedRedirect";
import { AppShell } from "@/components/layout/AppShell";

// ─── Auth pages ───────────────────────────────────────────────────────────────
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";

// ─── Manager ──────────────────────────────────────────────────────────────────
import ManagerDashboard from "@/pages/manager/dashboard";
import ManagerUsers from "@/pages/manager/users";
import ManagerMenus from "@/pages/manager/menus";
import ManagerOrders from "@/pages/manager/orders";
import ManagerDeliveries from "@/pages/manager/deliveries";
import ManagerReceipts from "@/pages/manager/receipts";
import ManagerReports from "@/pages/manager/reports";
import ActivityLogsPage from "@/pages/manager/activity-logs";

// ─── Kasir ────────────────────────────────────────────────────────────────────
import CashierDashboard from "@/pages/cashier/dashboard";
import NewOrderPage from "@/pages/cashier/new-order";
import PaymentPage from "@/pages/cashier/payment";
import PendingOrdersPage from "@/pages/cashier/pending-orders";
import CashierHistoryPage from "@/pages/cashier/history";

// ─── Kurir ────────────────────────────────────────────────────────────────────
import CourierDashboard from "@/pages/courier/dashboard";
import CourierDelivery from "@/pages/courier/delivery";
import CourierAssignedPage from "@/pages/courier/assigned";
import CourierHistoryPage from "@/pages/courier/history";

// ─── Pelanggan ────────────────────────────────────────────────────────────────
import CustomerMenuPage from "@/pages/customer/menus";
import CustomerMenuDetailPage from "@/pages/customer/menus/detail";
import CustomerOrdersPage from "@/pages/customer/orders";

// ─── Shared ───────────────────────────────────────────────────────────────────
import NotificationsPage from "@/pages/shared/notifications";

// ─── Misc ─────────────────────────────────────────────────────────────────────
import UnauthorizedPage from "@/pages/shared/Unauthorized";
import NotFoundPage from "@/pages/shared/NotFound";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ManagerOnly({ children }: { children: React.ReactNode }) {
  return <RequireRole roles={["manager"]}>{children}</RequireRole>;
}
function KasirOnly({ children }: { children: React.ReactNode }) {
  return <RequireRole roles={["kasir"]}>{children}</RequireRole>;
}
function KurirOnly({ children }: { children: React.ReactNode }) {
  return <RequireRole roles={["kurir"]}>{children}</RequireRole>;
}
function PelangganOnly({ children }: { children: React.ReactNode }) {
  return <RequireRole roles={["pelanggan"]}>{children}</RequireRole>;
}

// ─── Router ───────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  // ── Public: redirect jika sudah login ──────────────────────────────────────
  {
    path: "/login",
    element: (
      <RedirectIfAuth>
        <LoginPage />
      </RedirectIfAuth>
    ),
  },
  {
    path: "/register",
    element: (
      <RedirectIfAuth>
        <RegisterPage />
      </RedirectIfAuth>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <RedirectIfAuth>
        <ForgotPasswordPage />
      </RedirectIfAuth>
    ),
  },
  {
    // Reset password tidak wrap RedirectIfAuth — user bisa akses dari email link
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },

  // ── Protected: wajib login ─────────────────────────────────────────────────
  {
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      // Default "/" → redirect ke dashboard sesuai role
      { index: true, element: <RoleBasedRedirect /> },

      // ── Manager ─────────────────────────────────────────────────────────
      {
        path: "manager/dashboard",
        element: (
          <ManagerOnly>
            <ManagerDashboard />
          </ManagerOnly>
        ),
      },
      {
        path: "manager/users",
        element: (
          <ManagerOnly>
            <ManagerUsers />
          </ManagerOnly>
        ),
      },
      {
        path: "manager/menus",
        element: (
          <ManagerOnly>
            <ManagerMenus />
          </ManagerOnly>
        ),
      },
      {
        path: "manager/orders",
        element: (
          <ManagerOnly>
            <ManagerOrders />
          </ManagerOnly>
        ),
      },
      {
        path: "manager/deliveries",
        element: (
          <ManagerOnly>
            <ManagerDeliveries />
          </ManagerOnly>
        ),
      },
      {
        path: "manager/receipts",
        element: (
          <ManagerOnly>
            <ManagerReceipts />
          </ManagerOnly>
        ),
      },
      {
        path: "manager/reports",
        element: (
          <ManagerOnly>
            <ManagerReports />
          </ManagerOnly>
        ),
      },
      {
        path: "manager/activity-logs",
        element: (
          <ManagerOnly>
            <ActivityLogsPage />
          </ManagerOnly>
        ),
      },

      // ── Kasir ───────────────────────────────────────────────────────────
      {
        path: "cashier/dashboard",
        element: (
          <KasirOnly>
            <CashierDashboard />
          </KasirOnly>
        ),
      },
      {
        path: "cashier/new-order",
        element: (
          <KasirOnly>
            <NewOrderPage />
          </KasirOnly>
        ),
      },
      {
        path: "cashier/payment/:id",
        element: (
          <KasirOnly>
            <PaymentPage />
          </KasirOnly>
        ),
      },
      {
        path: "cashier/pending-orders",
        element: (
          <KasirOnly>
            <PendingOrdersPage />
          </KasirOnly>
        ),
      },
      {
        path: "cashier/history",
        element: (
          <KasirOnly>
            <CashierHistoryPage />
          </KasirOnly>
        ),
      },

      // ── Kurir ───────────────────────────────────────────────────────────
      {
        path: "courier/dashboard",
        element: (
          <KurirOnly>
            <CourierDashboard />
          </KurirOnly>
        ),
      },
      {
        path: "courier/assigned",
        element: (
          <KurirOnly>
            <CourierAssignedPage />
          </KurirOnly>
        ),
      },
      {
        path: "courier/history",
        element: (
          <KurirOnly>
            <CourierHistoryPage />
          </KurirOnly>
        ),
      },
      {
        path: "courier/deliveries/:deliveryId",
        element: (
          <KurirOnly>
            <CourierDelivery />
          </KurirOnly>
        ),
      },

      // ── Pelanggan ───────────────────────────────────────────────────────
      // Path sesuai RoleBasedRedirect: /menu dan /orders
      {
        path: "menu",
        element: (
          <PelangganOnly>
            <CustomerMenuPage />
          </PelangganOnly>
        ),
      },
      {
        path: "menu/:id",
        element: (
          <PelangganOnly>
            <CustomerMenuDetailPage />
          </PelangganOnly>
        ),
      },
      {
        path: "orders",
        element: (
          <PelangganOnly>
            <CustomerOrdersPage />
          </PelangganOnly>
        ),
      },

      // ── Shared (untuk semua authenticated users) ─────────────────────────
      {
        path: "notifications",
        element: (
          <RequireAuth>
            <NotificationsPage />
          </RequireAuth>
        ),
      },
    ],
  },

  // ── Misc ───────────────────────────────────────────────────────────────────
  { path: "/unauthorized", element: <UnauthorizedPage /> },
  { path: "*", element: <NotFoundPage /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
