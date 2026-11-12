import AdminNavbar from "./AdminNavbar";
import "./AdminTheme.css";

function AdminLayout({ children }) {
  return (
    <div className="admin-shell min-h-screen bg-slate-50 text-slate-900">
      <AdminNavbar />

      <main className="min-h-[calc(100vh-130px)] xl:min-h-[calc(100vh-77px)]">
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;