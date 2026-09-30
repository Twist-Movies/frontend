import { Route, Routes } from 'react-router-dom';
import { AppShell, PublicShell } from './components/layout';
import { RedirectIfAuthenticated, RequireAuth } from './auth';
import { isEnabled } from './config/features';
import Feed from './pages/Feed';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Films from './pages/Films';
import FilmDetail from './pages/FilmDetail';
import Series from './pages/Series';
import SeriesDetail from './pages/SeriesDetail';
import Profile from './pages/Profile';
import Diary from './pages/Diary';
import Watched from './pages/Watched';
import Watchlist from './pages/Watchlist';
import Lists from './pages/Lists';
import ListDetail from './pages/ListDetail';
import ReviewDetail from './pages/ReviewDetail';
import Members from './pages/Members';
import Search from './pages/Search';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

/**
 * Mapa de rotas do TWIST, separado do BrowserRouter para que os testes possam
 * montá-lo num MemoryRouter.
 *
 * Dois ramos: o público, que só existe para quem ainda não entrou, e o
 * autenticado, protegido pelo RequireAuth.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RedirectIfAuthenticated />}>
        <Route element={<PublicShell />}>
          <Route path="boas-vindas" element={<Landing />} />
          <Route path="entrar" element={<Login />} />
          <Route path="cadastro" element={<Signup />} />
        </Route>
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route index element={<Feed />} />

          <Route path="filmes" element={<Films />} />
          <Route path="filme/:filmId" element={<FilmDetail />} />

          {isEnabled('series') && (
            <>
              <Route path="series" element={<Series />} />
              <Route path="serie/:seriesId" element={<SeriesDetail />} />
            </>
          )}

          <Route path="listas" element={<Lists />} />
          <Route path="lista/:listId" element={<ListDetail />} />
          <Route path="resenha/:reviewId" element={<ReviewDetail />} />

          <Route path="membros" element={<Members />} />
          <Route path="u/:username" element={<Profile />} />
          <Route path="u/:username/filmes" element={<Watched />} />
          <Route path="u/:username/diario" element={<Diary />} />
          <Route path="u/:username/watchlist" element={<Watchlist />} />

          <Route path="busca" element={<Search />} />
          <Route path="configuracoes" element={<Settings />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
