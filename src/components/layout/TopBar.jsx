import { Link, NavLink } from 'react-router-dom';
import { Search } from 'lucide-react';
import { onlyEnabled } from '../../config/features';
import { cx } from '../../lib/cx';
import { Button } from '../ui';
import { Logo } from './Logo';
import { SearchForm } from './SearchForm';
import { UserMenu } from './UserMenu';

const NAV = [
  { to: '/filmes', label: 'Filmes' },
  { to: '/series', label: 'Séries', feature: 'series' },
  { to: '/listas', label: 'Listas' },
  { to: '/membros', label: 'Membros' },
];

// No mobile a navegação fica na BottomNav (AppShell); aqui o nav só aparece de md em diante.
export function TopBar({ username, avatarUrl, onLogFilm, onSignOut }) {
  return (
    <header className="sticky top-0 z-50 h-14 border-b border-line bg-bg/90 backdrop-blur-md md:h-20">
      <div className="flex h-full items-center gap-3 px-4 md:gap-6 md:px-6 lg:px-[5%]">
        <Logo to="/" />

        <nav
          className="hidden flex-1 justify-center gap-8 md:flex"
          aria-label="Navegação principal"
        >
          {onlyEnabled(NAV).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cx(
                  'border-b-2 py-2 text-base font-semibold transition-colors',
                  isActive
                    ? 'border-accent text-fg'
                    : 'border-transparent text-muted hover:text-fg',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-3 md:flex-none md:gap-4">
          <SearchForm className="hidden md:flex" />
          <Link
            to="/busca"
            aria-label="Ir para a busca"
            className="flex size-9 items-center justify-center rounded-full text-fg hover:bg-surface-2 md:hidden"
          >
            <Search size={20} />
          </Link>
          <Button variant="primary" size="sm" onClick={onLogFilm}>
            + Registrar
          </Button>
          <UserMenu
            username={username}
            avatarUrl={avatarUrl}
            onSignOut={onSignOut}
          />
        </div>
      </div>
    </header>
  );
}
