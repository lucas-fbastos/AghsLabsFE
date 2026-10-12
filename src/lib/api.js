const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

function withQuery(path, parameters) {
  const query = new URLSearchParams()
  Object.entries(parameters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value))
  })
  const suffix = query.toString()
  return suffix ? `${path}?${suffix}` : path
}

async function get(path, signal, notFoundMessage = 'No data was found for that ID.') {
  let response
  try {
    response = await fetch(`${API_BASE}${path}`, { signal, headers: { Accept: 'application/json' } })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('Could not reach Aghs Labs API. Start the backend and try again.')
  }

  if (!response.ok) {
    if (response.status === 404) throw new Error(notFoundMessage)
    throw new Error(`The API returned an error (${response.status}). Please try again.`)
  }

  return response.json()
}

export const api = {
  match: (id, signal) => get(`/matches/details/${id}`, signal),
  liveMatches: (limit = 10, signal) => get(`/matches/live?limit=${limit}`, signal),
  heroes: (signal) => get('/heroes', signal, 'No heroes are available yet. Seed the API database and try again.'),
  player: (id, signal) => get(`/player/${id}`, signal),
  playerSearch: (query, kind = 'any', signal) => get(
    withQuery('/players/search', { q: query, kind }),
    signal,
    'No players matched that search.',
  ),
  playerRecent: (id, signal) => get(`/matches/${id}/recent`, signal),
  playerWinLoss: (id, signal) => get(`/matches/${id}/winLose`, signal),
  playerComparison: (leftId, rightId, options = {}, signal) => get(
    withQuery(`/compare/players/${leftId}/${rightId}`, {
      candidateLimit: options.candidateLimit ?? 30,
      pairLimit: options.pairLimit ?? 10,
    }),
    signal,
    'No comparable recent matches were found for these players.',
  ),
  matchComparison: (pair, signal) => get(withQuery('/compare/matches', {
    leftPlayerId: pair.leftPlayerId,
    leftMatchId: pair.leftMatchId,
    leftSlot: pair.leftSlot,
    rightPlayerId: pair.rightPlayerId,
    rightMatchId: pair.rightMatchId,
    rightSlot: pair.rightSlot,
  }), signal, 'Detailed comparison data is not available for this match pair.'),
}
