import MovieCard from './MovieCard';

function MovieCarousel() {

  const movies = [
    {
      id: 1,
      title: 'Filme Exemplo 1',
      year: 2026,
      rating: 4.5,
      image: '/images/filme-1.jpg'
    },
    {
      id: 2,
      title: 'Filme Exemplo 2',
      year: 2025,
      rating: 4.2,
      image: '/images/filme-2.jpg'
    },
    {
      id: 3,
      title: 'Filme Exemplo 3',
      year: 2025,
      rating: 4.8,
      image: '/images/filme-3.jpg'
    },
    {
      id: 4,
      title: 'Filme Exemplo 4',
      year: 2024,
      rating: 3.9,
      image: '/images/filme-4.jpg'
    },
    {
      id: 5,
      title: 'Filme Exemplo 5',
      year: 2024,
      rating: 4.6,
      image: '/images/filme-5.jpg'
    }
  ];

  return (
    <section id="filmes" className="movies-section">

      <div className="section-header">

        <div>
          <p className="section-label">
            EM DESTAQUE
          </p>

          <h2>
            Filmes populares
          </h2>
        </div>

        <a href="#filmes">
          Ver todos
        </a>

      </div>

      <div className="movie-carousel">

        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
          />
        ))}

      </div>

    </section>
  );
}

export default MovieCarousel;