/**
 * Modelo de domínio do TWIST. Sem back-end, estas definições são a fonte da
 * verdade e viram o contrato de API documentado na Sprint 6. O projeto é JS,
 * então elas vivem em JSDoc: o editor usa para autocompletar e checar.
 *
 * Uso: `/** @type {import('../types').Film} *\/`
 */

/**
 * @typedef {object} Film
 * @property {string} id
 * @property {string} title
 * @property {number} year
 * @property {string} director
 * @property {number} runtime Duração em minutos.
 * @property {string[]} genres
 * @property {string} synopsis
 * @property {string} [posterUrl]
 * @property {number} averageRating De 0 a 5.
 * @property {number} watchedCount
 */

/**
 * @typedef {object} Series
 * @property {string} id
 * @property {string} title
 * @property {number} startYear
 * @property {number} [endYear] Ausente enquanto a série está no ar.
 * @property {string} creator
 * @property {number} seasons
 * @property {string[]} genres
 * @property {string} synopsis
 * @property {string} [posterUrl]
 * @property {number} averageRating De 0 a 5.
 * @property {number} watchedCount
 */

/** @typedef {'film' | 'series'} MediaType */

/**
 * @typedef {object} User
 * @property {string} username
 * @property {string} displayName
 * @property {string} [bio]
 * @property {string} [avatarUrl]
 * @property {number} followers
 * @property {number} following
 * @property {number} filmsWatched
 */

/**
 * Um filme assistido e registrado por um usuário — a entrada do diário.
 * @typedef {object} LogEntry
 * @property {string} id
 * @property {string} filmId
 * @property {string} username
 * @property {string} watchedOn Data ISO (AAAA-MM-DD).
 * @property {number} [rating]
 * @property {boolean} liked
 * @property {boolean} rewatch
 * @property {string} [reviewId]
 */

/**
 * @typedef {object} Review
 * @property {string} id
 * @property {string} filmId
 * @property {string} username
 * @property {string} body
 * @property {number} [rating]
 * @property {boolean} containsSpoilers
 * @property {number} likes
 * @property {string} createdAt
 */

/**
 * @typedef {object} FilmList
 * @property {string} id
 * @property {string} title
 * @property {string} [description]
 * @property {string} username
 * @property {string[]} filmIds
 * @property {boolean} ranked
 * @property {number} likes
 */

/** @typedef {'watched' | 'reviewed' | 'liked' | 'listed' | 'followed'} ActivityKind */

/**
 * @typedef {object} ActivityItem
 * @property {string} id
 * @property {ActivityKind} kind
 * @property {string} username
 * @property {string} createdAt
 * @property {string} [filmId]
 * @property {string} [listId]
 * @property {string} [reviewId]
 * @property {string} [targetUsername]
 * @property {number} [rating]
 */

export {};
