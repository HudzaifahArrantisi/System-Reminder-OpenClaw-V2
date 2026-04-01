import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLE_NAVIGATION } from '../config/roleConfig';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Chatbot from './Chatbot';

export default function DashboardLayout() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return null;
  }

  const navItems = ROLE_NAVIGATION[user.role];
  const currentPage = navItems.find((item) => item.path === location.pathname)?.label || 'Dashboard';

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 md:flex">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(8,145,178,0.14),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(79,70,229,0.14),transparent_38%)]" />
      <Sidebar title={user.role.toUpperCase()} items={navItems} />
      <div className="relative flex min-h-screen flex-1 flex-col">
        <Navbar pageTitle={currentPage} />
        <main className="flex-1 p-4 md:p-6 md:pb-12">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
      <Chatbot />
    </div>
  );
}
