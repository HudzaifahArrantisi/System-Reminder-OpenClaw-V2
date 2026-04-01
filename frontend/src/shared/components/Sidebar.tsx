import { Link, useLocation } from 'react-router-dom';
import type { NavItem } from '../config/roleConfig';

interface SidebarProps {
  title: string;
  items: NavItem[];
}

export default function Sidebar({ title, items }: SidebarProps) {
  const location = useLocation();

  return (
    <aside className="z-20 w-full border-r border-slate-800/80 bg-slate-950/75 backdrop-blur-xl md:sticky md:top-0 md:h-screen md:w-72">
      <div className="border-b border-slate-800 px-5 py-4">
        <p className="text-xs uppercase tracking-[0.18em] text-cyan-300">Dashboard</p>
        <h1 className="mt-1 text-lg font-bold text-slate-100">{title}</h1>
      </div>
      <nav className="space-y-1 p-3">
        {items.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`block rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? 'bg-cyan-500/20 text-cyan-100 ring-1 ring-cyan-400/35'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
