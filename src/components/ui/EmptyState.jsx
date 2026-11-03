export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-xl border border-dashed border-line px-4 py-12 text-center text-muted">
      <div className="mb-2 font-bold text-fg">{title}</div>
      {description && <p className="mb-3">{description}</p>}
      {action}
    </div>
  );
}
