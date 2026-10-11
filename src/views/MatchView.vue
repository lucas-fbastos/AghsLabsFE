<script setup>
import {computed, ref, watch, onBeforeUnmount} from 'vue'
import {useRoute} from 'vue-router'
import {ArrowLeft, RefreshCw, Trophy} from '@lucide/vue'
import {PhCoins} from '@phosphor-icons/vue'
import {api} from '../lib/api.js'
import {repeatedItemsFromMatch, coreMvpScore, supportMvpScore, compact} from '../lib/dota.js'
import ScoreHero from '../components/ScoreHero.vue'
import TeamTable from '../components/TeamTable.vue'
import HotItems from '../components/HotItems.vue'
import MvpCard from '../components/MvpCard.vue'
import SupportMvpCard from '../components/SupportMvpCard.vue'

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

watch(() => route.params.id, load, {immediate: true})
onBeforeUnmount(() => controller?.abort())

const radiant = computed(() => [...(match.value?.radiantTeam || [])].sort((a, b) => (b.kills || 0) - (a.kills || 0)))
const dire = computed(() => [...(match.value?.direTeam || [])].sort((a, b) => (b.kills || 0) - (a.kills || 0)))
const scoreboards = computed(() => {
  const teams = [
    {side: 'Radiant', name: match.value?.radiantName, players: radiant.value},
    {side: 'Dire', name: match.value?.direName, players: dire.value},
  ]
  return match.value?.radiantWin ? teams : teams.reverse()
})
const allPlayers = computed(() => [...radiant.value, ...dire.value])
const hotItems = computed(() => match.value ? repeatedItemsFromMatch(match.value) : [])
const coreMvps = computed(() => [...allPlayers.value].sort((a, b) => coreMvpScore(b) - coreMvpScore(a)).slice(0, 3))
const supportMvps = computed(() => [...allPlayers.value].sort((a, b) => supportMvpScore(b) - supportMvpScore(a)).slice(0, 3))
const topDamage = computed(() => [...allPlayers.value].sort((a, b) => (b.heroDamage || 0) - (a.heroDamage || 0))[0])
const topKills = computed(() => [...allPlayers.value].sort((a, b) => (b.kills || 0) - (a.kills || 0))[0])
const topHealer = computed(() => [...allPlayers.value].sort((a, b) => (b.heroHeal || 0) - (a.heroHeal || 0))[0])
const damageTakenTotal = player => {
  const values = Object.values(player?.damageTaken || {}).map(Number).filter(Number.isFinite)
  return values.length ? values.reduce((total, value) => total + value, 0) : null
}
const topTanker = computed(() => [...allPlayers.value]
  .filter(player => damageTakenTotal(player) !== null)
  .sort((a, b) => damageTakenTotal(b) - damageTakenTotal(a))[0])
const netWorthEstimate = player => (player?.gold || 0) + (player?.goldSpent || 0)
const topNetWorth = computed(() => [...allPlayers.value].sort((a, b) => netWorthEstimate(b) - netWorthEstimate(a))[0])
</script>

<template>
  <main class="subtle-grid min-h-screen pt-29 pb-20">
    <div class="site-container">
      <RouterLink to="/"
                  class="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-[#d946ff] hover:text-[#d946ff]">
        <ArrowLeft :size="15"/>
        New search
      </RouterLink>
      <div v-if="loading" class="grid min-h-[55vh] place-items-center">
        <div class="text-center">
          <div
              class="mx-auto mb-5 size-10 animate-spin rounded-full border-2 border-[#d946ff]/20 border-t-[#d946ff]"></div>
          <p class="eyebrow">Retrieving match data</p>
          <p class="mt-2 text-sm muted">Decoding the battlefield...</p></div>
      </div>
      <div v-else-if="error" class="glass mx-auto mt-20 max-w-xl rounded-2xl p-10 text-center"><p class="eyebrow">Match
        unavailable</p>
        <h1 class="display-font mt-3 text-3xl">We couldn't load this match.</h1>
        <p class="mt-4 text-sm leading-7 muted">{{ error }}</p>
        <button class="primary-button mt-7" type="button" @click="load">
          <RefreshCw :size="16"/>
          Try again
        </button>
      </div>
      <template v-else-if="match">
        <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div><p class="eyebrow">After action report</p>
            <h1 class="display-font mt-2 text-3xl sm:text-4xl">Match overview</h1></div>
          <p class="text-xs muted">Data from Aghs Labs API · Match #{{ match.matchId }}</p></div>
        <section
            class="winner-banner mb-5 flex flex-col items-center justify-center gap-3 rounded-2xl px-5 py-8 text-center sm:py-10"
            :class="match.radiantWin ? 'radiant-bg' : 'dire-bg'" aria-label="Match winner">
          <span class="grid size-14 place-items-center rounded-xl border border-white/20 bg-black/30"
                :class="match.radiantWin ? 'radiant-text' : 'dire-text'" aria-hidden="true"><Trophy :size="28"/></span>
          <div><p class="text-xs font-bold uppercase tracking-[.24em] muted">Match winner</p>
            <p class="winner-title mt-2" :class="match.radiantWin ? 'radiant-text' : 'dire-text'">The
              {{ match.radiantWin ? 'Radiant' : 'Dire' }}</p></div>
        </section>
        <ScoreHero :match="match"/>
        <section class="mt-8 grid gap-8 lg:grid-cols-2">
          <div>
            <p class="eyebrow">Standout performances</p>
            <h2 class="display-font mt-1 text-3xl">Core MVPs</h2>
            <p class="mt-2 mb-5 text-xs muted">Ranked by kills, damage, and net worth, with assists and deaths factored in.</p>
            <div class="grid gap-3">
              <MvpCard v-for="(player, index) in coreMvps" :key="`${player.playerSlot}-${player.hero?.id}-${index}`"
                       :player="player" :rank="index + 1"/>
            </div>
          </div>
          <div>
            <p class="eyebrow">Team support</p>
            <h2 class="display-font mt-1 text-3xl">Support MVPs</h2>
            <p class="mt-2 mb-5 text-xs muted">Ranked by healing, stun duration, observer wards, and sentries placed.</p>
            <div class="grid gap-3">
              <SupportMvpCard v-for="(player, index) in supportMvps" :key="`${player.playerSlot}-${player.hero?.id}-${index}`"
                              :player="player" :rank="index + 1"/>
            </div>
          </div>
        </section>
        <section class="panel mt-5 self-start rounded-2xl p-6"><p class="eyebrow">Match insight</p>
          <h3 class="display-font mt-2 text-2xl">At a glance</h3>
          <div class="mt-6 space-y-4 text-sm">
            <div class="flex justify-between gap-4 border-b border-white/10 pb-4"><span
                class="muted">Top eliminations</span><span class="text-right">{{
                topKills?.personaName || topKills?.name || topKills?.hero?.localizedName || '—'
              }} <b class="gold">· {{ topKills?.kills ?? '—' }}</b></span></div>
            <div class="flex justify-between gap-4 border-b border-white/10 pb-4"><span
                class="muted">Top damage</span><span class="text-right">{{
                topDamage?.personaName || topDamage?.name || topDamage?.hero?.localizedName || '—'
              }} <b class="gold">· {{ compact(topDamage?.heroDamage) }}</b></span></div>
            <div class="flex justify-between gap-4 border-b border-white/10 pb-4"><span
                class="muted">Top healer</span><span class="text-right">{{
                topHealer?.personaName || topHealer?.name || topHealer?.hero?.localizedName || '—'
              }} <b class="gold">· {{ compact(topHealer?.heroHeal) }}</b></span></div>
            <div class="flex justify-between gap-4 border-b border-white/10 pb-4"><span
                class="muted">Top tanker</span><span class="text-right">{{
                topTanker?.personaName || topTanker?.name || topTanker?.hero?.localizedName || '—'
              }} <b class="gold">· {{ topTanker ? compact(damageTakenTotal(topTanker)) : '—' }}</b></span></div>
            <div class="flex justify-between gap-4"><span class="muted" title="Estimated from current gold plus gold spent">Top net worth*</span><span class="text-right">{{
                topNetWorth?.personaName || topNetWorth?.name || topNetWorth?.hero?.localizedName || '—'
              }} <b class="inline-flex items-center gap-1 text-[#f5c84c]">· {{ compact(netWorthEstimate(topNetWorth)) }}<PhCoins :size="16"/></b></span></div>
          </div>
          <p class="mt-4 text-xs muted">* Estimated from current gold and total gold spent.</p>
        </section>
        <div class="mt-12 mb-5 flex flex-wrap items-end justify-between gap-3">
          <div><p class="eyebrow">The breakdown</p>
            <h2 class="display-font mt-1 text-3xl">Team scoreboards</h2></div>
          <span class="text-xs muted">Stats, heroes, and final item builds</span></div>
        <div class="grid gap-5">
          <TeamTable
            v-for="team in scoreboards"
            :key="team.side"
            :players="team.players"
            :side="team.side"
            :name="team.name"
          />
        </div>
        <HotItems :items="hotItems"/>
      </template>
    </div>
  </main>
</template>
