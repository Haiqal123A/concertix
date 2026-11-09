import AdminSidebar from "./AdminSidebar";
import "./AdminTheme.css";

function AdminLayout({ children }) {
  return (
    <div className="admin-shell min-h-screen bg-slate-50 text-slate-900">
      <AdminSidebar />

      <main className="min-h-screen lg:ml-64">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;