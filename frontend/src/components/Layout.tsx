import { Outlet, Navigate, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
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

  const roleTheme =
    user.role === "dosen"
      ? {
          sidebar: "from-slate-900 via-slate-900 to-slate-800 border-slate-700/70",
          rolePill: "bg-blue-500/10 text-blue-200 border-blue-500/30",
          navActive: "bg-blue-500/15 text-blue-100 border-blue-500/30",
          navIdle: "text-slate-300 hover:bg-slate-800 hover:text-slate-100",
        }
      : {
          sidebar: "from-slate-900 via-slate-900 to-slate-800 border-slate-700/70",
          rolePill: "bg-emerald-500/10 text-emerald-200 border-emerald-500/30",
          navActive: "bg-emerald-500/15 text-emerald-100 border-emerald-500/30",
          navIdle: "text-slate-300 hover:bg-slate-800 hover:text-slate-100",
        };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className={`w-64 bg-gradient-to-b ${roleTheme.sidebar} border-r hidden md:flex flex-col`}>
        <div className="p-6 border-b border-slate-700/50">
          <h1 className="text-xl font-black bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            OpenClaw E-Learning
          </h1>
          <p className={`mt-3 inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-widest ${roleTheme.rolePill}`}>
            {user.role === "dosen" ? "Mode Dosen" : "Mode Mahasiswa"}
          </p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`block px-4 py-3 rounded-lg border transition-all ${
                location.pathname === item.path
                  ? roleTheme.navActive
                  : `border-transparent ${roleTheme.navIdle}`
              }`}
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
