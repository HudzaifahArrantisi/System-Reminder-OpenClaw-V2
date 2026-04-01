import { Link } from 'react-router-dom';

interface QuickActionItem {
  label: string;
  path: string;
}

interface QuickActionsProps {
  title: string;
  items: QuickActionItem[];
}

export default function QuickActions({ title, items }: QuickActionsProps) {
  return (
    <section className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-5">
      <h2 className="text-base font-semibold text-slate-100">{title}</h2>
      <div className="mt-4 grid gap-2">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-200"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
