function MovieCard({ movie }) {
  return (
    <article className="movie-card">

      <div className="movie-poster">

        <img
          src={movie.image}
          alt={`Pôster do filme ${movie.title}`}
        />

      </div>

      <div className="movie-info">

        <h3>{movie.title}</h3>

        <p>{movie.year}</p>

        <div className="movie-rating">
          ★ {movie.rating}
        </div>

      </div>

    </article>
  );
}

export default MovieCard;