import { NavLink } from 'react-router-dom';
import {
  Clapperboard,
  House,
  ListVideo,
  Search,
  Tv,
  Users,
} from 'lucide-react';
import { onlyEnabled } from '../../config/features';
import { cx } from '../../lib/cx';

const ITENS = [
  { to: '/', label: 'Início', icon: House, end: true },
  { to: '/filmes', label: 'Filmes', icon: Clapperboard },
  { to: '/series', label: 'Séries', icon: Tv, feature: 'series' },
  { to: '/listas', label: 'Listas', icon: ListVideo },
  { to: '/membros', label: 'Membros', icon: Users },
  { to: '/busca', label: 'Buscar', icon: Search },
];

// Navegação fixa na base da tela, só abaixo de md.
export function BottomNav() {
  return (
    <nav
      aria-label="Navegação inferior"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="flex">
        {onlyEnabled(ITENS).map(({ to, label, icon: Icone, end }) => (
          <li key={to} className="min-w-0 flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cx(
                  'flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition-colors',
                  isActive ? 'text-accent' : 'text-muted hover:text-fg',
                )
              }
            >
              <Icone size={20} aria-hidden="true" />
              <span className="truncate">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
