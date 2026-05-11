export default function EmptyState({ icon = '📭', title = 'Nothing here', message = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-4xl mb-5 shadow-inner">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-700 mb-1">{title}</h3>
      {message && <p className="text-sm text-slate-400 max-w-xs">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
