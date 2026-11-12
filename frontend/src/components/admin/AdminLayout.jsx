import AdminNavbar from "./AdminNavbar";
import { ConfirmationProvider } from "../ConfirmationProvider";
import "./AdminTheme.css";

function AdminLayout({ children }) {
  return (
    <ConfirmationProvider>
      <div className="admin-shell min-h-screen bg-slate-50 text-slate-900">
        <AdminNavbar />

        <main className="min-h-screen pb-24 pt-32 xl:pb-0 xl:pt-20">
          {children}
        </main>
      </div>
    </ConfirmationProvider>
  );
}

export default AdminLayout;