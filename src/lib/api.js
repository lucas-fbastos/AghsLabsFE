const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

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
  playerRecent: (id, signal) => get(`/matches/${id}/recent`, signal),
  playerWinLoss: (id, signal) => get(`/matches/${id}/winLose`, signal),
}
