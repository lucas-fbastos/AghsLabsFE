<script setup>
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, RefreshCw, Sparkles, Trophy, TrendingUp } from '@lucide/vue'
import { api } from '../lib/api.js'
import { repeatedItemsFromMatch, mvpScore, compact } from '../lib/dota.js'
import ScoreHero from '../components/ScoreHero.vue'
import TeamTable from '../components/TeamTable.vue'
import HotItems from '../components/HotItems.vue'
import MvpCard from '../components/MvpCard.vue'

const route = useRoute()
const match = ref(null)
const loading = ref(true)
const error = ref('')
let controller

async function load() {
  controller?.abort()
  const requestController = new AbortController()
  controller = requestController
  loading.value = true
  error.value = ''
  match.value = null
  try {
    const result = await api.match(route.params.id, requestController.signal)
    match.value = result
  } catch (err) {
    if (err.name !== 'AbortError') error.value = err.message
  } finally {
    if (!requestController.signal.aborted) loading.value = false
  }
}

watch(() => route.params.id, load, { immediate: true })
onBeforeUnmount(() => controller?.abort())

const radiant = computed(() => [...(match.value?.radiantTeam || [])].sort((a, b) => (b.kills || 0) - (a.kills || 0)))
const dire = computed(() => [...(match.value?.direTeam || [])].sort((a, b) => (b.kills || 0) - (a.kills || 0)))
const scoreboards = computed(() => {
  const teams = [{ side: 'Radiant', players: radiant.value }, { side: 'Dire', players: dire.value }]
  return match.value?.radiantWin ? teams : teams.reverse()
})
const allPlayers = computed(() => [...radiant.value, ...dire.value])
const hotItems = computed(() => match.value ? repeatedItemsFromMatch(match.value) : [])
const mvps = computed(() => [...allPlayers.value].sort((a, b) => mvpScore(b) - mvpScore(a)).slice(0, 3))
const topDamage = computed(() => [...allPlayers.value].sort((a, b) => (b.heroDamage || 0) - (a.heroDamage || 0))[0])
const topKills = computed(() => [...allPlayers.value].sort((a, b) => (b.kills || 0) - (a.kills || 0))[0])
const totalKills = computed(() => (match.value?.radiantScore || 0) + (match.value?.direScore || 0))
</script>

<template>
  <main class="subtle-grid min-h-screen pt-[116px] pb-20">
    <div class="site-container">
      <RouterLink to="/" class="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-[#d946ff] hover:text-[#d946ff]"><ArrowLeft :size="15" /> New search</RouterLink>
      <div v-if="loading" class="grid min-h-[55vh] place-items-center"><div class="text-center"><div class="mx-auto mb-5 size-10 animate-spin rounded-full border-2 border-[#d946ff]/20 border-t-[#d946ff]"></div><p class="eyebrow">Retrieving match data</p><p class="mt-2 text-sm muted">Decoding the battlefield...</p></div></div>
      <div v-else-if="error" class="glass mx-auto mt-20 max-w-xl rounded-2xl p-10 text-center"><p class="eyebrow">Match unavailable</p><h1 class="display-font mt-3 text-3xl">We couldn't load this match.</h1><p class="mt-4 text-sm leading-7 muted">{{ error }}</p><button class="primary-button mt-7" type="button" @click="load"><RefreshCw :size="16" /> Try again</button></div>
      <template v-else-if="match">
        <div class="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p class="eyebrow">After action report</p><h1 class="display-font mt-2 text-3xl sm:text-4xl">Match overview</h1></div><p class="text-xs muted">Data from Aghs Labs API · Match #{{ match.matchId }}</p></div>
        <section class="winner-banner mb-5 flex flex-col items-center justify-center gap-3 rounded-2xl px-5 py-8 text-center sm:py-10" :class="match.radiantWin ? 'radiant-bg' : 'dire-bg'" aria-label="Match winner">
          <span class="grid size-14 place-items-center rounded-xl border border-white/20 bg-black/30" :class="match.radiantWin ? 'radiant-text' : 'dire-text'" aria-hidden="true"><Trophy :size="28" /></span>
          <div><p class="text-xs font-bold uppercase tracking-[.24em] muted">Match winner</p><p class="winner-title mt-2" :class="match.radiantWin ? 'radiant-text' : 'dire-text'">The {{ match.radiantWin ? 'Radiant' : 'Dire' }}</p></div>
        </section>
        <ScoreHero :match="match" />
        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <div class="panel flex items-center gap-4 rounded-xl p-5"><span class="grid size-11 place-items-center rounded-lg bg-[#d946ff]/10 text-[#d946ff]"><Sparkles :size="21" /></span><div><p class="text-[.63rem] uppercase tracking-[.16em] muted">Total kills</p><p class="display-font mt-1 text-xl">{{ totalKills }}</p></div></div>
          <div class="panel flex items-center gap-4 rounded-xl p-5"><span class="grid size-11 place-items-center rounded-lg bg-[#d946ff]/10 text-[#d946ff]"><TrendingUp :size="21" /></span><div><p class="text-[.63rem] uppercase tracking-[.16em] muted">Highest hero damage</p><p class="display-font mt-1 truncate text-xl">{{ compact(topDamage?.heroDamage) }} <span class="font-sans text-xs muted">{{ topDamage?.hero?.localizedName }}</span></p></div></div>
        </div>
        <div class="mt-12 mb-5 flex flex-wrap items-end justify-between gap-3"><div><p class="eyebrow">The breakdown</p><h2 class="display-font mt-1 text-3xl">Team scoreboards</h2></div><span class="text-xs muted">Stats, heroes, and final item builds</span></div>
        <div class="grid gap-5"><TeamTable v-for="team in scoreboards" :key="team.side" :players="team.players" :side="team.side" /></div>
        <HotItems :items="hotItems" />
        <div class="mt-12 grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><section><p class="eyebrow">Standout performances</p><h2 class="display-font mt-1 text-3xl">Match MVPs</h2><p class="mt-2 mb-5 text-xs muted">Ranked from kills, assists, damage, and deaths. These are Aghs Labs estimates.</p><div class="grid gap-3"><MvpCard v-for="(player, index) in mvps" :key="`${player.hero?.id}-${index}`" :player="player" :rank="index + 1" /></div></section><section class="panel self-start rounded-2xl p-6"><p class="eyebrow">Match insight</p><h3 class="display-font mt-2 text-2xl">At a glance</h3><div class="mt-6 space-y-4 text-sm"><div class="flex justify-between gap-4 border-b border-white/10 pb-4"><span class="muted">Top eliminations</span><span class="text-right">{{ topKills?.personaName || topKills?.name || topKills?.hero?.localizedName || '—' }} <b class="gold">· {{ topKills?.kills ?? '—' }}</b></span></div><div class="flex justify-between gap-4 border-b border-white/10 pb-4"><span class="muted">Top damage</span><span class="text-right">{{ topDamage?.personaName || topDamage?.name || topDamage?.hero?.localizedName || '—' }} <b class="gold">· {{ compact(topDamage?.heroDamage) }}</b></span></div><div class="flex justify-between gap-4"><span class="muted">Heroes recorded</span><span class="gold font-semibold">{{ allPlayers.length }}</span></div></div></section></div>
      </template>
    </div>
  </main>
</template>
