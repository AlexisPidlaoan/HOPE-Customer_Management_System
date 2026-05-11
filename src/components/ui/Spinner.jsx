export default function Spinner({ size = 'md', label = 'Loading…' }) {
  const sizes = { sm: 'w-5 h-5 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-[3px]' };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10" role="status" aria-label={label}>
      <div className={`${sizes[size]} rounded-full border-slate-200 border-t-blue-600 animate-spin-slow`} />
      <span className="text-sm text-slate-400">{label}</span>
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full border-[3px] border-slate-700 border-t-blue-500 animate-spin-slow" />
        <p className="text-slate-300 font-semibold tracking-wide">Loading HopeCMS…</p>
      </div>
    </div>
  );
}
