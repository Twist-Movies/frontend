export function EmptyState({ title, description, action, icon: Icone }) {
  return (
    <div className="rounded-xl border border-dashed border-line px-4 py-12 text-center text-muted">
      {Icone && (
        <Icone
          size={36}
          aria-hidden="true"
          className="mx-auto mb-3 text-faint"
          data-slot="icon"
        />
      )}
      <div className="mb-2 font-bold text-fg">{title}</div>
      {description && <p className="mb-3">{description}</p>}
      {action}
    </div>
  );
}
