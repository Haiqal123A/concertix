import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import ConcertDetail from "./pages/ConcertDetail";
import Orders from "./pages/Orders";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OrderDetail from "./pages/OrderDetail";

import AdminPayments from "./pages/admin/AdminPayments";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminConcerts from "./pages/admin/AdminConcerts";
import AdminArtists from "./pages/admin/AdminArtists";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminVenues from "./pages/admin/AdminVenues";
import AdminTicketTypes from "./pages/admin/AdminTicketTypes";
import AdminLayout from "./components/admin/AdminLayout";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>

        {/* =========================
            PUBLIC
        ========================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/concert/:id"
          element={<ConcertDetail />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =========================
            USER
        ========================= */}

        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <OrderDetail />
            </ProtectedRoute>
          }
        />


       {/* =========================
    ADMIN
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

      </Routes>
    </BrowserRouter>
  );
}

export default App;