import AdminSidebar from "./AdminSidebar";

function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#080808] text-white">

      <AdminSidebar />

      <main className="min-h-screen lg:ml-64">
        {children}
      </main>

    </div>
  );
}

export default AdminLayout;