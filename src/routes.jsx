import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { AppShell, PublicShell } from './components/layout';
import { RedirectIfAuthenticated, RequireAuth } from './auth';
import { isEnabled } from './config/features';
import Feed from './pages/Feed';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Films from './pages/Films';
import FilmDetail from './pages/FilmDetail';
import Series from './pages/Series';
import SeriesDetail from './pages/SeriesDetail';
import Profile from './pages/Profile';
// import Diary from './pages/Diary';
import Watched from './pages/Watched';
// import Watchlist from './pages/Watchlist';
import Lists from './pages/Lists';
import ListDetail from './pages/ListDetail';
import ReviewDetail from './pages/ReviewDetail';
import Members from './pages/Members';
import Search from './pages/Search';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

export function AppRoutes() {
  return (
// Links antigos (/resenha/:id) continuam funcionando.
function RedirecionarComentario() {
  const { reviewId } = useParams();
  return <Navigate to={`/comentario/${reviewId}`} replace />;
}

    <Routes>
      <Route element={<RedirectIfAuthenticated />}>
        <Route element={<PublicShell />}>
          <Route path="boas-vindas" element={<Landing />} />
          <Route path="entrar" element={<Login />} />
          <Route path="cadastro" element={<Signup />} />
          <Route path="esqueci-senha" element={<ForgotPassword />} />
        </Route>
      </Route>

      <Route element={<PublicShell />}>
        <Route path="redefinir-senha/:uid/:token" element={<ResetPassword />} />
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
          <Route path="comentario/:reviewId" element={<ReviewDetail />} />
          <Route
            path="resenha/:reviewId"
            element={<RedirecionarComentario />}
          />

          <Route path="membros" element={<Members />} />
          <Route path="u/:username" element={<Profile />} />
          <Route path="u/:username/filmes" element={<Watched />} />
          {/* <Route path="u/:username/diario" element={<Diary />} /> */}
          {/* <Route path="u/:username/watchlist" element={<Watchlist />} /> */}

          <Route path="busca" element={<Search />} />
          <Route path="configuracoes" element={<Settings />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
