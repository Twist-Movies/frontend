import { NavLink } from 'react-router-dom';
import { cx } from '../../lib/cx';
import { Button } from '../ui';
import { Logo } from './Logo';
import { SearchForm } from './SearchForm';
import { UserMenu } from './UserMenu';

const NAV = [
  { to: '/filmes', label: 'Filmes' },
  { to: '/series', label: 'Séries' },
  { to: '/listas', label: 'Listas' },
  { to: '/membros', label: 'Membros' },
];

export function TopBar({ username, onLogFilm, onSignOut }) {
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="flex h-full items-center gap-6 px-6 lg:px-[5%]">
        <Logo to="/" />

        <nav className="hidden gap-6 md:flex" aria-label="Navegação principal">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cx(
                  'border-b-2 py-2 text-[15px] font-semibold transition-colors',
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

        <div className="flex flex-1 items-center justify-end gap-4">
          <SearchForm
            placeholder="Filmes, séries, membros…"
            className="hidden md:flex"
          />
          <Button variant="primary" size="sm" onClick={onLogFilm}>
            + Registrar
          </Button>
          <UserMenu username={username} onSignOut={onSignOut} />
        </div>
      </div>
    </header>
  );
}
