import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  pageTitle: string;
}

export default function Navbar({ pageTitle }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/75 px-5 py-3 backdrop-blur-xl">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Student Hub</p>
        <h2 className="text-lg font-semibold text-slate-100">{pageTitle}</h2>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden rounded-lg border border-cyan-400/35 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100 sm:block">
          {user?.name} • {user?.role}
        </div>
        <button
          onClick={onLogout}
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
