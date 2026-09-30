import { Link } from 'react-router-dom';
import {
  Avatar,
  Card,
  PosterCard,
  PosterGrid,
  SectionTitle,
  StarRating,
} from '../components/ui';
import { activity, films, filmById } from '../data/mock';

function describe(item) {
  switch (item.kind) {
    case 'watched':
      return 'assistiu';
    case 'reviewed':
      return 'resenhou';
    case 'liked':
      return 'curtiu';
    case 'listed':
      return 'criou uma lista';
    case 'followed':
      return 'começou a seguir';
  }
}

function ActivityRow({ item }) {
  const film = item.filmId ? filmById(item.filmId) : undefined;

  return (
    <Card>
      <div className="flex items-start gap-3">
        <Avatar name={item.username} size="md" />
        <div className="flex flex-1 flex-col gap-1">
          <div>
            <Link to={`/u/${item.username}`} className="font-bold hover:text-accent">
              {item.username}
            </Link>{' '}
            <span className="text-muted">{describe(item)}</span>{' '}
            {film && (
              <Link to={`/filme/${film.id}`} className="font-bold hover:text-accent">
                {film.title}
              </Link>
            )}
          </div>
          {item.rating !== undefined && (
            <StarRating value={item.rating} size="sm" />
          )}
          <span className="text-sm text-faint">{item.createdAt}</span>
        </div>
      </div>
    </Card>
  );
}

/** Feed de atividade de quem o usuário segue — o coração social do TWIST. */
export default function Feed() {
  return (
    <div className="flex flex-col gap-8">
      <section>
        <SectionTitle
          action={
            <Link to="/filmes" className="text-faint normal-case hover:text-fg">
              ver tudo
            </Link>
          }
        >
          Populares esta semana
        </SectionTitle>
        <PosterGrid aria-label="Populares esta semana">
          {films.map((film) => (
            <PosterCard
              key={film.id}
              id={film.id}
              title={film.title}
              year={film.year}
              rating={film.averageRating}
            />
          ))}
        </PosterGrid>
      </section>

      <section className="grid items-start gap-8 lg:grid-cols-[1fr_260px]">
        <div>
          <SectionTitle>Atividade de quem você segue</SectionTitle>
          <div className="flex flex-col gap-4">
            {activity.map((item) => (
              <ActivityRow key={item.id} item={item} />
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div>
            <SectionTitle>Sua watchlist</SectionTitle>
            <div className="grid grid-cols-4 gap-3 lg:grid-cols-2">
              {films.slice(0, 4).map((film) => (
                <PosterCard
                  key={film.id}
                  id={film.id}
                  title={film.title}
                  compact
                />
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
