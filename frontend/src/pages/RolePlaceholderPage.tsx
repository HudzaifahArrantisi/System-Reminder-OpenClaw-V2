interface RolePlaceholderPageProps {
  title: string;
  description: string;
}

export default function RolePlaceholderPage({ title, description }: RolePlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-4xl rounded-2xl border border-slate-700/70 bg-slate-900/70 p-6">
      <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
      <p className="mt-2 text-slate-300">{description}</p>
      <p className="mt-4 text-sm text-slate-400">
        Halaman ini adalah placeholder untuk fase implementasi berikutnya.
      </p>
    </div>
  );
}
