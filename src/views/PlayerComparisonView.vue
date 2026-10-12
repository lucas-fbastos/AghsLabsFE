<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, RefreshCw, Scale, Sparkles, Swords } from '@lucide/vue'
import { api } from '../lib/api.js'
import DeepComparisonDetails from '../components/DeepComparisonDetails.vue'
import HeroUsagePanel from '../components/HeroUsagePanel.vue'
import MatchPairCard from '../components/MatchPairCard.vue'
import PlayerMiniProfile from '../components/PlayerMiniProfile.vue'

const route = useRoute()
const overview = ref(null)
const loading = ref(true)
const error = ref('')
const expandedKey = ref('')
const detailStates = reactive(new Map())
let overviewController
let detailController
let activeDetailKey = ''

const leftId = computed(() => String(route.params.leftId || ''))
const rightId = computed(() => String(route.params.rightId || ''))
const leftName = computed(() => overview.value?.leftPlayer?.personaName || 'Player one')
const rightName = computed(() => overview.value?.rightPlayer?.personaName || 'Player two')
const pairs = computed(() => overview.value?.pairs || [])
const pairKey = pair => `${pair.left?.matchId}:${pair.left?.playerSlot}-${pair.right?.matchId}:${pair.right?.playerSlot}`

function warningText(warning) {
  const [code, count] = String(warning || '').split('=')
  if (code === 'LEFT_MATCHES_EXCLUDED') return `${count} match${count === '1' ? '' : 'es'} from ${leftName.value} could not be used for pairing.`
  if (code === 'RIGHT_MATCHES_EXCLUDED') return `${count} match${count === '1' ? '' : 'es'} from ${rightName.value} could not be used for pairing.`
  if (code === 'NO_COMPARABLE_MATCH_PAIRS') return 'No complete match pairs were available in this recent window.'
  if (code === 'NO_SAME_HERO_PAIR') return 'No pair used the same hero, so deep comparison is unavailable in this window.'
  return code.replaceAll('_', ' ').toLowerCase().replace(/^./, letter => letter.toUpperCase())
}

function detailState(pair) {
  return detailStates.get(pairKey(pair)) || { loading: false, error: '', data: null }
}

async function loadOverview() {
  overviewController?.abort()
  detailController?.abort()
  const requestController = new AbortController()
  overviewController = requestController
  overview.value = null
  expandedKey.value = ''
  detailStates.clear()
  loading.value = true
  error.value = ''

  if (!/^\d+$/.test(leftId.value) || !/^\d+$/.test(rightId.value)) {
    error.value = 'Both player IDs must be numeric.'
    loading.value = false
    return
  }
  if (leftId.value === rightId.value) {
    error.value = 'Choose two different player accounts to compare.'
    loading.value = false
    return
  }

  try {
    overview.value = await api.playerComparison(leftId.value, rightId.value, {
      candidateLimit: 30,
      pairLimit: 10,
    }, requestController.signal)
  } catch (err) {
    if (err.name !== 'AbortError') error.value = err.message
  } finally {
    if (!requestController.signal.aborted) loading.value = false
  }
}

async function loadDetails(pair, force = false) {
  const key = pairKey(pair)
  const existing = detailStates.get(key)
  if (!force && (existing?.data || existing?.loading)) return

  detailController?.abort()
  if (activeDetailKey && detailStates.has(activeDetailKey)) {
    detailStates.get(activeDetailKey).loading = false
  }
  const requestController = new AbortController()
  detailController = requestController
  activeDetailKey = key
  const state = existing || reactive({ loading: false, error: '', data: null })
  state.loading = true
  state.error = ''
  if (force) state.data = null
  detailStates.set(key, state)

  try {
    state.data = await api.matchComparison({
      leftPlayerId: leftId.value,
      leftMatchId: pair.left.matchId,
      leftSlot: pair.left.playerSlot,
      rightPlayerId: rightId.value,
      rightMatchId: pair.right.matchId,
      rightSlot: pair.right.playerSlot,
    }, requestController.signal)
  } catch (err) {
    if (err.name !== 'AbortError') state.error = err.message
  } finally {
    if (!requestController.signal.aborted) state.loading = false
  }
}

function togglePair(pair) {
  if (!pair.deepComparisonAvailable) return
  const key = pairKey(pair)
  if (expandedKey.value === key) {
    expandedKey.value = ''
    return
  }
  expandedKey.value = key
  loadDetails(pair)
}

watch([leftId, rightId], loadOverview, { immediate: true })

onBeforeUnmount(() => {
  overviewController?.abort()
  detailController?.abort()
})
</script>

<template>
  <main class="subtle-grid min-h-screen pt-29 pb-20">
    <div class="site-container max-w-7xl">
      <RouterLink to="/players" class="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.15em] text-[#58a6ff] hover:text-[#9cc8ff]">
        <ArrowLeft :size="15" aria-hidden="true" /> Change players
      </RouterLink>

      <div v-if="loading" class="grid min-h-[55vh] place-items-center" role="status">
        <div class="text-center">
          <div class="mx-auto mb-5 size-10 animate-spin rounded-full border-2 border-[#58a6ff]/20 border-t-[#58a6ff]"></div>
          <p class="eyebrow comparison-blue">Building comparison</p>
          <p class="mt-2 text-sm muted">Pairing the closest recent match scenarios…</p>
        </div>
      </div>

      <div v-else-if="error" class="glass mx-auto mt-16 max-w-xl rounded-2xl p-8 text-center sm:p-10">
        <p class="eyebrow comparison-blue">Comparison unavailable</p>
        <h1 class="display-font mt-3 text-3xl">We couldn’t compare these players.</h1>
        <p class="mt-4 text-sm leading-7 muted">{{ error }}</p>
        <div class="mt-7 flex flex-wrap justify-center gap-3">
          <button class="primary-button" type="button" @click="loadOverview"><RefreshCw :size="16" aria-hidden="true" /> Try again</button>
          <RouterLink to="/players" class="ghost-button text-sm">Choose other players</RouterLink>
        </div>
      </div>

      <template v-else-if="overview">
        <header class="mb-8">
          <p class="eyebrow comparison-blue">Player comparison</p>
          <div class="mt-2 flex flex-wrap items-end justify-between gap-3">
            <h1 class="display-font text-3xl sm:text-4xl">Recent form, side by side</h1>
            <p class="text-xs muted">{{ overview.leftCandidateCount ?? 0 }} + {{ overview.rightCandidateCount ?? 0 }} recent candidates inspected</p>
          </div>
        </header>

        <section class="mb-8 grid items-stretch gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]" aria-label="Selected players">
          <PlayerMiniProfile :player="overview.leftPlayer" label="Your player" :removable="false" />
          <span class="mx-auto grid size-11 place-items-center self-center rounded-full border border-[#58a6ff]/35 bg-[#58a6ff]/10 text-[#58a6ff]" aria-hidden="true"><Swords :size="20" /></span>
          <PlayerMiniProfile :player="overview.rightPlayer" label="Professional player" :removable="false" pro />
        </section>

        <div v-if="overview.warnings?.length" class="mb-8 rounded-xl border border-[#e7b451]/25 bg-[#e7b451]/[.07] p-4" role="note">
          <p class="text-xs font-bold uppercase tracking-wider text-[#e7c477]">Comparison notes</p>
          <ul class="mt-2 grid gap-1 text-xs leading-5 text-[#d1c7ad]"><li v-for="warning in overview.warnings" :key="warning">• {{ warningText(warning) }}</li></ul>
        </div>

        <section aria-labelledby="hero-pools-title">
          <div class="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div><p class="eyebrow comparison-blue">30-match window</p><h2 id="hero-pools-title" class="display-font mt-1 text-3xl">Hero pools and win rates</h2></div>
            <span class="text-xs muted">Grouped from the recent candidates used for pairing</span>
          </div>
          <div class="grid gap-4 lg:grid-cols-2">
            <HeroUsagePanel :player="overview.leftPlayer" :aggregates="overview.leftHeroAggregates" />
            <HeroUsagePanel :player="overview.rightPlayer" :aggregates="overview.rightHeroAggregates" />
          </div>
        </section>

        <section class="mt-12" aria-labelledby="paired-matches-title">
          <div class="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p class="eyebrow comparison-blue">Closest scenarios</p>
              <h2 id="paired-matches-title" class="display-font mt-1 text-3xl">Paired recent matches</h2>
              <p class="mt-2 max-w-2xl text-xs leading-5 muted">Only complete pairs are shown. Same-hero pairs can be opened for farm, build, skill, and teamfight details.</p>
            </div>
            <span class="comparison-pill"><Sparkles :size="12" aria-hidden="true" /> {{ pairs.length }} of 10 pairs</span>
          </div>

          <div v-if="pairs.length" class="grid gap-4">
            <MatchPairCard
              v-for="pair in pairs"
              :key="pairKey(pair)"
              :pair="pair"
              :left-name="leftName"
              :right-name="rightName"
              :expanded="expandedKey === pairKey(pair)"
              :data-status="detailState(pair).data ? (detailState(pair).data.completeData ? 'complete' : 'partial') : ''"
              @toggle="togglePair(pair)"
            >
              <template #details>
                <div v-if="detailState(pair).loading" class="flex min-h-36 items-center justify-center gap-3 text-sm text-[#aebbb4]" role="status">
                  <span class="size-5 animate-spin rounded-full border-2 border-[#58a6ff]/20 border-t-[#58a6ff]" aria-hidden="true"></span>
                  Loading parsed match timelines…
                </div>
                <div v-else-if="detailState(pair).error" class="rounded-xl border border-[#e9a293]/20 bg-[#e9a293]/[.06] p-5 text-center">
                  <p class="text-sm text-[#e9a293]">{{ detailState(pair).error }}</p>
                  <button type="button" class="ghost-button mt-4 text-xs" @click="loadDetails(pair, true)"><RefreshCw :size="14" aria-hidden="true" /> Retry details</button>
                </div>
                <DeepComparisonDetails v-else-if="detailState(pair).data" :comparison="detailState(pair).data" :left-name="leftName" :right-name="rightName" />
              </template>
            </MatchPairCard>
          </div>

          <div v-else class="panel rounded-2xl p-10 text-center">
            <span class="mx-auto grid size-12 place-items-center rounded-xl border border-[#58a6ff]/25 bg-[#58a6ff]/10 text-[#58a6ff]"><Scale :size="23" aria-hidden="true" /></span>
            <h3 class="display-font mt-4 text-2xl">No complete pairs found</h3>
            <p class="mx-auto mt-2 max-w-lg text-sm leading-6 muted">The players have recent activity, but the current candidate window did not produce a complete comparison pair.</p>
          </div>
        </section>
      </template>
    </div>
  </main>
</template>
