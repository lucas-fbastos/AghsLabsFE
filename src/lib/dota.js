const CDN = 'https://cdn.cloudflare.steamstatic.com'

export function imageUrl(path) {
  if (!path || typeof path !== 'string') return ''
  if (path.startsWith('/')) return `${CDN}${path}`
  if (/^https:\/\//i.test(path)) return path
  return ''
}

export function formatDuration(value) {
  if (value == null) return '—'
  let seconds = 0
  if (typeof value === 'number') seconds = value
  else {
    const iso = String(value).match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/i)
    if (iso) seconds = Number(iso[1] || 0) * 3600 + Number(iso[2] || 0) * 60 + Number(iso[3] || 0)
    else if (/^\d+$/.test(String(value))) seconds = Number(value)
  }
  if (!seconds) return '—'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainder = Math.floor(seconds % 60)
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}` : `${minutes}:${String(remainder).padStart(2, '0')}`
}

export const number = (value) => value == null ? '—' : Intl.NumberFormat('en-US').format(value)
export const compact = (value) => value == null ? '—' : Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
export const displayName = (player) => player?.personaName || player?.name || 'Anonymous player'
export const modeName = (mode) => (mode || 'Unknown').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())

export function mvpScore(player) {
  return (player.kills || 0) * 3 + (player.assists || 0) + (player.heroDamage || 0) / 7000 - (player.deaths || 0) * 1.2
}

export function repeatedItemsFromMatch(match) {
  const items = new Map()
  for (const player of [...(match.radiantTeam || []), ...(match.direTeam || [])]) {
    for (const item of player.items || []) {
      if (!item?.itemId) continue
      const existing = items.get(item.itemId)
      if (existing) existing.count += 1
      else items.set(item.itemId, { ...item, count: 1 })
    }
  }
  return [...items.values()]
    .filter(item => item.count > 1)
    .sort((a, b) => b.count - a.count || (a.name || '').localeCompare(b.name || ''))
}
