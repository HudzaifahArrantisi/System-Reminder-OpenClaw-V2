import { Outlet, Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const menuItems = user.role === 'dosen' 
    ? [
        { name: "Dashboard", path: "/dosen" },
        { name: "Pertemuan", path: "/dosen/courses" },
      ]
    : [
        { name: "Dashboard", path: "/mahasiswa" },
        { name: "Matkul Saya", path: "/mahasiswa/courses" },
      ];

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 border-r border-slate-700/50 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-700/50">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            OpenClaw E-Learning
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">{user.role}</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className="block px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700/50 shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-slate-800 border-b border-slate-700/50 p-4 flex justify-between items-center shrink-0">
          <h1 className="text-lg font-bold text-white">E-Learning</h1>
          <button onClick={handleLogout} className="text-sm text-red-400">Logout</button>
        </header>

        {/* Top Navbar */}
        <header className="hidden md:flex items-center justify-between bg-slate-800/50 border-b border-slate-700/50 px-8 py-4 shrink-0">
          <h2 className="text-xl font-semibold capitalize">{user.role} Portal</h2>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              {user.name.charAt(0)}
            </div>
            <span className="text-sm text-slate-300">{user.name}</span>
          </div>
        </header>

        {/* Scrollable Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
