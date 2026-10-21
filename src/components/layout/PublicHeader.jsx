import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { onlyEnabled } from '../../config/features';
import { cx } from '../../lib/cx';
import { Logo } from './Logo';
import { SearchForm } from './SearchForm';

const NAV = [
  { hash: '#inicio', label: 'Início' },
  { hash: '#filmes', label: 'Filmes' },
  { hash: '#series', label: 'Séries', feature: 'series' },
  { hash: '#sobre', label: 'Sobre' },
];

export function PublicHeader({ overlay = false }) {
  return (
    <header
      data-overlay={overlay || undefined}
      className={cx(
        'top-0 left-0 z-50 flex h-17.5 w-full items-center px-6 md:h-20 lg:px-[5%]',
        overlay
          ? 'absolute bg-transparent text-white'
          : 'sticky border-b border-line bg-bg/90 backdrop-blur-md',
      )}
    >
      <div className="lg:flex-1">
        <Logo to="/boas-vindas" />
      </div>

      <nav className="hidden gap-7.5 lg:flex" aria-label="Navegação principal">
        {onlyEnabled(NAV).map((item) => (
          <Link
            key={item.hash}
            to={`/boas-vindas${item.hash}`}
            className="text-[15px] font-semibold transition-opacity hover:opacity-65"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex flex-1 items-center justify-end gap-5">
        <SearchForm className="hidden sm:flex" />

        <Link
          to="/entrar"
          className="flex items-center gap-2 rounded-full bg-cta px-3.5 py-2.25 font-bold text-cta-fg transition-transform hover:-translate-y-0.5 sm:px-4.5 sm:py-2.5"
        >
          <User size={18} />
          Entrar
        </Link>
      </div>
    </header>
  );
}
