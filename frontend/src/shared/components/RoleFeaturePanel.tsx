interface RoleFeaturePanelProps {
  title: string;
  description: string;
  highlights: string[];
}

export default function RoleFeaturePanel({ title, description, highlights }: RoleFeaturePanelProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-slate-700/70 bg-slate-900/70 p-5">
      <header className="rounded-2xl border border-cyan-400/25 bg-gradient-to-r from-slate-900 to-cyan-950/40 p-4">
        <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">{description}</p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <ul className="grid gap-3 md:grid-cols-2">
          {highlights.map((item) => (
            <li key={item} className="rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-300">
              {item}
            </li>
          ))}
        </ul>

        <aside className="space-y-3 rounded-xl border border-slate-700 bg-slate-950/70 p-4">
          <h2 className="text-sm font-semibold text-slate-100">Status Implementasi</h2>
          <div>
            <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
              <span>UI Progress</span>
              <span>80%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500" />
            </div>
          </div>
          <div className="rounded-lg border border-slate-700/80 bg-slate-900/80 p-3 text-xs text-slate-300">
            Prioritas selanjutnya: hubungkan komponen ini ke API nyata agar data dashboard real-time.
          </div>
        </aside>
      </div>
    </section>
  );
}
