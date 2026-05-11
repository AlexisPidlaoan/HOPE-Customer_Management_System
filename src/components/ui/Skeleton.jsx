export default function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-slate-200 rounded-md ${className}`}></div>
  );
}

export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex gap-4 mb-6">
        {Array(columns).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-6 flex-1" />
        ))}
      </div>
      {Array(rows).fill(0).map((_, i) => (
        <div key={i} className="flex gap-4 mb-4">
          {Array(columns).fill(0).map((_, j) => (
            <Skeleton key={j} className="h-5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
