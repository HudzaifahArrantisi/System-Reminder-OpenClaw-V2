interface DashboardHeroProps {
  title: string;
  subtitle: string;
  badge: string;
}

export default function DashboardHero({ title, subtitle, badge }: DashboardHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/50 p-6 md:p-8">
      <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-24 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="relative">
        <span className="inline-flex rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
          {badge}
        </span>
        <h1 className="mt-4 text-2xl font-bold text-white md:text-3xl">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300 md:text-base">{subtitle}</p>
      </div>
    </section>
  );
}
