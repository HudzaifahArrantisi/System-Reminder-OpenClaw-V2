import { useState } from 'react';

export default function Chatbot() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {open && (
        <div className="mb-3 w-80 rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl shadow-slate-950">
          <p className="text-sm font-semibold text-slate-100">AI Assistant</p>
          <p className="mt-2 text-sm text-slate-300">
            Halo, saya siap bantu ringkas informasi dashboard, tugas, absensi, dan UKT.
          </p>
        </div>
      )}
      <button
        onClick={() => setOpen((value) => !value)}
        className="rounded-full border border-cyan-400/60 bg-cyan-500/20 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/30"
      >
        {open ? 'Close Bot' : 'Chatbot'}
      </button>
    </div>
  );
}
