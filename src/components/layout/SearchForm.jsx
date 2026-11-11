import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { cx } from '../../lib/cx';

export function SearchForm({ placeholder = 'Buscar filmes…', className = '' }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const submitSearch = (e) => {
    e.preventDefault();
    const term = query.trim();
    if (term) navigate(`/busca?q=${encodeURIComponent(term)}`);
  };

  return (
    <form
      role="search"
      onSubmit={submitSearch}
      className={cx(
        'items-center gap-2 rounded-full border border-fg/40 bg-black/25 py-1.5 pr-3 pl-4 backdrop-blur-md',
        className,
      )}
    >
      <input
        type="search"
        aria-label="Pesquisar filmes e séries"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-36 min-w-0 bg-transparent text-fg outline-none placeholder:text-fg/70 lg:w-56"
      />
      <button
        type="submit"
        aria-label="Pesquisar"
        className="flex cursor-pointer items-center justify-center text-fg"
      >
        <Search size={20} />
      </button>
    </form>
  );
}
