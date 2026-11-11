import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

// Imagem em tela cheia (lightbox). Não usa o Modal compartilhado: aqui não há
// painel, só a imagem sobre um fundo escurecido e desfocado.
export function ImagemAmpliavel({ open, src, alt, onClose }) {
  const botaoRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const anterior = document.activeElement;
    const aoTeclar = (e) => {
      if (e.key === 'Escape') onCloseRef.current();
      // Mantém o foco dentro do lightbox (único controle: o botão de fechar).
      if (e.key === 'Tab') {
        e.preventDefault();
        botaoRef.current?.focus();
      }
    };
    document.addEventListener('keydown', aoTeclar);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    botaoRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = overflow;
      anterior?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      data-testid="imagem-ampliada-fundo"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        ref={botaoRef}
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute top-4 right-4 inline-flex size-11 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white transition hover:bg-white/30"
      >
        <X className="size-6" aria-hidden="true" />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl"
      />
    </div>
  );
}
