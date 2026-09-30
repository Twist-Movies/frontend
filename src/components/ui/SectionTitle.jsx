/** Cabeçalho de seção das telas internas, com ação opcional à direita. */
export function SectionTitle({ children, action }) {
  return (
    <div className="mb-4 flex items-center justify-between border-b border-line pb-2 text-xs font-bold tracking-wider text-muted uppercase">
      <span>{children}</span>
      {action}
    </div>
  );
}
