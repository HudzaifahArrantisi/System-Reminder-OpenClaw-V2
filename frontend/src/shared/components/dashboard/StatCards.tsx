export interface StatItem {
  label: string;
  value: string;
  trend?: string;
  tone?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'indigo';
}

const toneStyles: Record<NonNullable<StatItem['tone']>, string> = {
  cyan: 'from-cyan-500/20 to-cyan-400/5 border-cyan-400/30 text-cyan-200',
  emerald: 'from-emerald-500/20 to-emerald-400/5 border-emerald-400/30 text-emerald-200',
  amber: 'from-amber-500/20 to-amber-400/5 border-amber-400/30 text-amber-200',
  rose: 'from-rose-500/20 to-rose-400/5 border-rose-400/30 text-rose-200',
  indigo: 'from-indigo-500/20 to-indigo-400/5 border-indigo-400/30 text-indigo-200',
};

interface StatCardsProps {
  items: StatItem[];
}

export default function StatCards({ items }: StatCardsProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const tone = item.tone || 'cyan';
        return (
          <article
            key={item.label}
            className={`rounded-2xl border bg-gradient-to-br p-4 shadow-lg shadow-slate-950/20 ${toneStyles[tone]}`}
          >
            <p className="text-xs uppercase tracking-[0.16em] text-slate-300">{item.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-100">{item.value}</p>
            {item.trend ? <p className="mt-2 text-xs text-slate-300">{item.trend}</p> : null}
          </article>
        );
      })}
    </section>
  );
}
