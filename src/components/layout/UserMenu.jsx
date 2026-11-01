import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../ui';
import { useTheme } from '../../lib/useTheme';

const ITEM =
  'block w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm text-fg hover:bg-surface-2';

export function UserMenu({ username, avatarUrl, onSignOut }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        className="flex cursor-pointer items-center"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu da conta"
      >
        <Avatar name={username} src={avatarUrl} size="md" />
      </button>

      {open && (
        <div
          className="absolute top-[calc(100%+8px)] right-0 z-60 flex min-w-48 flex-col rounded-xl border border-line bg-surface p-2 shadow-lg"
          role="menu"
        >
          <Link
            className={ITEM}
            role="menuitem"
            to={`/u/${username}`}
            onClick={() => setOpen(false)}
          >
            Meu perfil
          </Link>
          <Link
            className={ITEM}
            role="menuitem"
            to={`/u/${username}/diario`}
            onClick={() => setOpen(false)}
          >
            Diário
          </Link>
          <Link
            className={ITEM}
            role="menuitem"
            to={`/u/${username}/watchlist`}
            onClick={() => setOpen(false)}
          >
            Watchlist
          </Link>
          <Link
            className={ITEM}
            role="menuitem"
            to="/listas"
            onClick={() => setOpen(false)}
          >
            Minhas listas
          </Link>
          <div className="my-2 h-px bg-line" />
          <button className={ITEM} role="menuitem" onClick={toggle}>
            Tema: {theme === 'dark' ? 'escuro' : 'claro'}
          </button>
          <Link
            className={ITEM}
            role="menuitem"
            to="/configuracoes"
            onClick={() => setOpen(false)}
          >
            Configurações
          </Link>
          <button
            className={ITEM}
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
