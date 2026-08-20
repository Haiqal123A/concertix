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
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminPayments />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;