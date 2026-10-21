import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { cx } from '../../lib/cx';

export function SearchForm({ placeholder = 'Pesquisar...', className = '' }) {
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
        'items-center rounded-full border border-fg/40 bg-black/25 py-1 pr-2 pl-4 backdrop-blur-md',
        className,
      )}
    >
      <input
        type="search"
        aria-label="Pesquisar filmes e séries"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-24 bg-transparent text-fg outline-none placeholder:text-fg/70 lg:w-40"
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
