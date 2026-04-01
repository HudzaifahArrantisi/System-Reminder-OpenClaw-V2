interface ActivityListProps {
  title: string;
  items: string[];
}

export default function ActivityList({ title, items }: ActivityListProps) {
  return (
    <section className="rounded-2xl border border-slate-700/70 bg-slate-900/70 p-5">
      <h2 className="text-base font-semibold text-slate-100">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-3 text-sm text-slate-300">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
