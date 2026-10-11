<script setup>
import {computed, onBeforeUnmount, ref} from 'vue'
import {Search, UserRound, ArrowUpRight} from '@lucide/vue'
import {api} from '../lib/api.js'
import {formatDuration, imageUrl, modeName} from '../lib/dota.js'
import HeroPortrait from '../components/HeroPortrait.vue'
import SectionHeader from '../components/SectionHeader.vue'

const accountId = ref('')
const player = ref(null)
const recent = ref([])
const winLoss = ref(null)
const error = ref('')
const loading = ref(false)
let controller
const winRate = computed(() => {
  const wins = Number(winLoss.value?.win || 0)
  const losses = Number(winLoss.value?.lose || 0)
  return wins + losses ? `${Math.round(wins / (wins + losses) * 100)}%` : '—'
})

async function search() {
  const id = accountId.value.trim()
  if (!/^\d+$/.test(id)) {
    error.value = 'Enter a numeric Dota account ID.';
    return
  }
  controller?.abort()
  const requestController = new AbortController()
  controller = requestController
  player.value = null
  recent.value = []
  winLoss.value = null
  error.value = ''
  loading.value = true
  try {
    player.value = await api.player(id, requestController.signal)
    const [recentResult, ratioResult] = await Promise.allSettled([api.playerRecent(id, requestController.signal), api.playerWinLoss(id, requestController.signal)])
    if (recentResult.status === 'fulfilled') recent.value = recentResult.value
    if (ratioResult.status === 'fulfilled') winLoss.value = ratioResult.value
  } catch (err) {
    if (err.name !== 'AbortError') error.value = err.message
  } finally {
    if (!requestController.signal.aborted) loading.value = false
  }
}

onBeforeUnmount(() => controller?.abort())
</script>

<template>
  <main class="subtle-grid min-h-screen pt-31.25 pb-20">
    <div class="site-container">
      <SectionHeader kicker="Player intelligence" title="Pro players & accounts"
                     description="Look up a Dota account by ID to view its profile and recent matches. The API does not currently expose a searchable pro-player directory."/>
      <form class="panel flex flex-col gap-3 rounded-2xl p-4 sm:flex-row" @submit.prevent="search"><label
          class="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-white/10 bg-black/30 px-4 py-3">
        <Search :size="19" class="gold"/>
        <input v-model="accountId" type="text" inputmode="numeric" placeholder="Enter a Dota account ID"
               aria-label="Dota account ID"
               class="min-w-0 flex-1 bg-transparent text-sm text-white outline-none"/></label>
        <button class="primary-button" type="submit" :disabled="loading">{{
            loading ? 'Searching...' : 'Find player'
          }}
        </button>
      </form>
      <p v-if="error" role="alert" class="mt-4 text-sm text-[#e9a293]">{{ error }}</p>
      <div v-if="player" class="mt-7 grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <section class="panel self-start rounded-2xl p-6">
          <div class="flex items-center gap-4"><img v-if="imageUrl(player.avatarImageFull)"
                                                    :src="imageUrl(player.avatarImageFull)" :alt="player.personaName"
                                                    class="size-16 rounded-xl object-cover"/>
            <div v-else class="grid size-16 place-items-center rounded-xl bg-[#d946ff]/10 text-[#d946ff]">
              <UserRound :size="28"/>
            </div>
            <div><p class="eyebrow">Player profile</p>
              <h2 class="display-font mt-1 text-2xl">{{ player.personaName || player.name || 'Unknown player' }}</h2>
            </div>
          </div>
          <div class="mt-7 grid grid-cols-3 gap-2 text-center">
            <div class="rounded-xl bg-black p-3"><p class="display-font text-xl gold">{{ winLoss?.win ?? '—' }}</p>
              <p class="mt-1 text-[.62rem] uppercase tracking-wider muted">Wins</p></div>
            <div class="rounded-xl bg-black p-3"><p class="display-font text-xl gold">{{ winLoss?.lose ?? '—' }}</p>
              <p class="mt-1 text-[.62rem] uppercase tracking-wider muted">Losses</p></div>
            <div class="rounded-xl bg-black p-3"><p class="display-font text-xl gold">{{ winRate }}</p>
              <p class="mt-1 text-[.62rem] uppercase tracking-wider muted">Win rate</p></div>
          </div>
          <a v-if="player.profileURL?.startsWith('https://')" :href="player.profileURL" target="_blank"
             rel="noopener noreferrer" class="ghost-button mt-6 text-xs">Steam profile
            <ArrowUpRight :size="14"/>
          </a></section>
        <section class="panel rounded-2xl p-6"><p class="eyebrow">Recent activity</p>
          <h2 class="display-font mt-1 text-2xl">Latest matches</h2>
          <div v-if="recent.length" class="mt-5 divide-y divide-white/10">
            <RouterLink v-for="entry in recent.slice(0, 10)" :key="entry.matchId" :to="`/matches/${entry.matchId}`"
                        class="flex items-center gap-3 py-3 transition hover:bg-black">
              <HeroPortrait :hero="entry.hero"/>
              <div class="min-w-0 flex-1"><p class="truncate text-sm font-semibold">
                {{ entry.hero?.localizedName || 'Unknown hero' }}</p>
                <p class="text-xs muted">{{ modeName(entry.gameMode) }} · {{ formatDuration(entry.duration) }}</p></div>
              <div class="text-right"><p class="text-xs font-bold" :class="entry.playerWon ? 'win-text' : 'loss-text'">
                {{ entry.playerWon ? 'WIN' : 'LOSS' }}</p>
                <p class="mt-1 text-xs muted">{{ entry.kills ?? 0 }}/{{ entry.deaths ?? 0 }}/{{
                    entry.assists ?? 0
                  }}</p></div>
            </RouterLink>
          </div>
          <p v-else class="mt-8 text-sm muted">No recent matches were returned for this player.</p></section>
      </div>
    </div>
  </main>
</template>
