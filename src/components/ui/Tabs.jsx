import { cx } from '../../lib/cx';

export function Tabs({ items, active, onChange }) {
  return (
    <div
      className="mb-6 flex gap-6 overflow-x-auto border-b border-line"
      role="tablist"
    >
      {items.map((item) => (
        <button
          key={item.id}
          role="tab"
          aria-selected={item.id === active}
          className={cx(
            'cursor-pointer border-b-2 py-2 text-xs font-bold tracking-wider whitespace-nowrap uppercase',
            item.id === active
              ? 'border-accent text-fg'
              : 'border-transparent text-muted hover:text-fg',
          )}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
