import { createBrowserRouter, Navigate } from "react-router-dom";

// Layouts
import AppShell from "@/components/layout/AppShell";

// Auth pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";

// Manager pages
import ManagerDashboard from "@/pages/manager/dashboard";
import ManagerUsers from "@/pages/manager/users";
import ManagerMenus from "@/pages/manager/menus";
import ManagerOrders from "@/pages/manager/orders";
import ManagerDeliveries from "@/pages/manager/deliveries";
import ManagerReceipts from "@/pages/manager/receipts";
import ManagerReports from "@/pages/manager/reports";
import ActivityLogsPage from "@/pages/manager/activity-logs";

// Cashier pages
import CashierDashboard from "@/pages/cashier/dashboard";
import CashierNewOrder from "@/pages/cashier/new-order";
import CashierPayment from "@/pages/cashier/payment";

// Customer pages
import CustomerMenu from "@/pages/customer/MenuPage";
import CustomerCart from "@/pages/customer/CartPage";
import CustomerOrders from "@/pages/customer/orders";

// Courier pages
import CourierDashboard from "@/pages/courier/dashboard";
import CourierDeliveryDetail from "@/pages/courier/delivery";

// Guard components (defined below)
import {
  RequireAuth,
  RequireRole,
  RedirectIfAuth,
} from "@/components/layout/RoleGuard";
import RoleBasedRedirect from "@/components/layout/RoleBasedRedirect";

export const router = createBrowserRouter([
  // ── PUBLIC ROUTES ────────────────────────────
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
    path: "/reset-password",
    element: (
      <RedirectIfAuth>
        <ResetPasswordPage />
      </RedirectIfAuth>
    ),
  },

  // ── PROTECTED ROUTES ─────────────────────────
  {
    path: "/",
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      // Root redirect berdasarkan role
      {
        index: true,
        element: <RoleBasedRedirect />,
      },

      // ── Manager ──────────────────────────────
      {
        path: "manager",
        element: (
          <RequireRole roles={["manager"]}>
            <Navigate to="/manager/dashboard" />
          </RequireRole>
        ),
      },
      {
        path: "manager/dashboard",
        element: (
          <RequireRole roles={["manager"]}>
            <ManagerDashboard />
          </RequireRole>
        ),
      },
      {
        path: "manager/users",
        element: (
          <RequireRole roles={["manager"]}>
            <ManagerUsers />
          </RequireRole>
        ),
      },
      {
        path: "manager/menus",
        element: (
          <RequireRole roles={["manager"]}>
            <ManagerMenus />
          </RequireRole>
        ),
      },
      {
        path: "manager/orders",
        element: (
          <RequireRole roles={["manager"]}>
            <ManagerOrders />
          </RequireRole>
        ),
      },
      {
        path: "manager/deliveries",
        element: (
          <RequireRole roles={["manager"]}>
            <ManagerDeliveries />
          </RequireRole>
        ),
      },
      {
        path: "manager/receipts",
        element: (
          <RequireRole roles={["manager"]}>
            <ManagerReceipts />
          </RequireRole>
        ),
      },
      {
        path: "manager/activity-logs",
        element: (
          <RequireRole roles={["manager"]}>
            <ActivityLogsPage />
          </RequireRole>
        ),
      },
      {
        path: "manager/reports",
        element: (
          <RequireRole roles={["manager"]}>
            <ManagerReports />
          </RequireRole>
        ),
      },

      // ── Kasir ─────────────────────────────────
      {
        path: "cashier/dashboard",
        element: (
          <RequireRole roles={["kasir", "manager"]}>
            <CashierDashboard />
          </RequireRole>
        ),
      },
      {
        path: "cashier/new-order",
        element: (
          <RequireRole roles={["kasir", "manager"]}>
            <CashierNewOrder />
          </RequireRole>
        ),
      },
      {
        path: "cashier/payment/:orderId",
        element: (
          <RequireRole roles={["kasir", "manager"]}>
            <CashierPayment />
          </RequireRole>
        ),
      },

      // ── Customer ──────────────────────────────
      {
        path: "menu",
        element: (
          <RequireRole roles={["pelanggan", "manager"]}>
            <CustomerMenu />
          </RequireRole>
        ),
      },
      {
        path: "cart",
        element: (
          <RequireRole roles={["pelanggan", "manager"]}>
            <CustomerCart />
          </RequireRole>
        ),
      },
      {
        path: "my-orders",
        element: (
          <RequireRole roles={["pelanggan", "manager"]}>
            <CustomerOrders />
          </RequireRole>
        ),
      },

      // ── Kurir ─────────────────────────────────
      {
        path: "courier/dashboard",
        element: (
          <RequireRole roles={["kurir", "manager"]}>
            <CourierDashboard />
          </RequireRole>
        ),
      },
      {
        path: "courier/delivery/:deliveryId",
        element: (
          <RequireRole roles={["kurir", "manager"]}>
            <CourierDeliveryDetail />
          </RequireRole>
        ),
      },
    ],
  },

  // Catch-all 404
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
