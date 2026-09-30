import { useEffect, useRef } from 'react';
import { Button } from './Button';

/** Diálogo simples: fecha no Esc e no clique fora, trava o scroll do fundo. */
export function Modal({ open, title, onClose, children, footer }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      data-testid="modal-backdrop"
      className="fixed inset-0 z-100 flex items-start justify-center overflow-y-auto bg-black/65 px-4 py-8"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="m-auto w-full max-w-140 rounded-2xl border border-line bg-surface shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={panelRef}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line p-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <Button variant="quiet" onClick={onClose} aria-label="Fechar">
            &times;
          </Button>
        </div>
        <div className="p-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-line p-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
