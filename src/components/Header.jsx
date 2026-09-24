import { Search, User } from 'lucide-react';

function Header() {
  return (
    <header className="site-header">

      <div className="header-logo">
        <a href="/" aria-label="Twist - Página inicial">
          <img src="/src/assets/icon.png" alt="Twist" />
        </a>
      </div>

      <nav className="main-navigation" aria-label="Navegação principal">

        <a href="#inicio">Início</a>

        <a href="#filmes">Filmes</a>

        <a href="#series">Séries</a>

        <a href="#sobre">Sobre</a>

      </nav>

      <div className="header-actions">

        <form className="search-form">

          <label htmlFor="search" className="sr-only">
            Pesquisar filmes e séries
          </label>

          <input
            id="search"
            type="search"
            placeholder="Pesquisar..."
          />

          <button type="submit" aria-label="Pesquisar">
            <Search size={20} />
          </button>

        </form>

        <a href="#login" className="login-button">
          <User size={18} />
          Entrar
        </a>

      </div>

    </header>
  );
}

export default Header;