import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { ConfirmationProvider } from "./components/ConfirmationProvider";

import Home from "./pages/Home";
import AllConcerts from "./pages/AllConcerts";
import ConcertDetail from "./pages/ConcertDetail";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OrderDetail from "./pages/OrderDetail";
import PetugasTicketScanner from "./pages/PetugasTicketScanner";
import AdminTicketScanner from "./pages/admin/AdminTicketScanner";

import AdminPayments from "./pages/admin/AdminPayments";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminConcerts from "./pages/admin/AdminConcerts";
import AdminArtists from "./pages/admin/AdminArtists";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminVenues from "./pages/admin/AdminVenues";
import AdminTicketTypes from "./pages/admin/AdminTicketTypes";
import AdminLayout from "./components/admin/AdminLayout";

// =========================
// USER LAYOUT
// =========================

function UserLayout({ children }) {
  return (
    <ConfirmationProvider>
      <Navbar />
      <div className="pb-20 md:pb-0">{children}</div>
    </ConfirmationProvider>
  );
}

function App() {
  useEffect(() => {
    const warnBeforeLeaving = (event) => {
      if (
        !sessionStorage.getItem("token") &&
        !localStorage.getItem("token")
      ) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () =>
      window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, []);

  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            PUBLIC - TANPA NAVBAR
        ========================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =========================
            PUBLIC - DENGAN NAVBAR
        ========================= */}

        <Route
          path="/"
          element={
            <UserLayout>
              <Home />
            </UserLayout>
          }
        />

        <Route
          path="/concerts"
          element={
            <UserLayout>
              <AllConcerts />
            </UserLayout>
          }
        />

        <Route
          path="/concert/:id"
          element={
            <UserLayout>
              <ConcertDetail />
            </UserLayout>
          }
        />


        {/* =========================
            USER - DENGAN NAVBAR
        ========================= */}

        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <UserLayout>
                <Orders />
              </UserLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <UserLayout>
                <OrderDetail />
              </UserLayout>
            </ProtectedRoute>
          }
        />


        {/* =========================
            ADMIN
            TANPA NAVBAR USER
        ========================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/concerts"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <AdminConcerts />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/artists"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <AdminArtists />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <AdminCategories />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/venues"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <AdminVenues />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/ticket-types"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <AdminTicketTypes />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <AdminPayments />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/ticket-scanner"
          element={
            <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
              <AdminLayout>
                <AdminTicketScanner canManageStaff />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/petugas/scan"
          element={
            <ProtectedRoute allowedRoles={["petugas"]}>
              <ConfirmationProvider>
                <PetugasTicketScanner />
              </ConfirmationProvider>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;