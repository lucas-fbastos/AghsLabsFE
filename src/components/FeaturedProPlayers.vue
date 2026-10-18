<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ArrowRight, RefreshCw, Trophy, UserRound } from '@lucide/vue'
import { RouterLink } from 'vue-router'
import { api } from '../lib/api.js'
import { formatDuration, imageUrl } from '../lib/dota.js'
import HeroPortrait from './HeroPortrait.vue'

const roles = ref([])
const loading = ref(true)
const error = ref('')
let controller

const visibleRoles = computed(() => roles.value.filter(role => {
  const player = role?.player
  const match = player?.recentWin
  return role?.playerRole != null
    && role.roleLabel
    && player?.accountId != null
    && match?.matchId != null
    && match?.hero?.id != null
}))

const playerName = player => player?.personaName || `Account ${player?.accountId}`
const teamLabel = player => player?.teamTag || player?.teamName || ''
const matchDate = value => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recent win'
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

async function loadPlayers() {
  controller?.abort()
  controller = new AbortController()
  loading.value = true

  try {
    const response = await api.featuredProPlayers(controller.signal)
    roles.value = Array.isArray(response?.roles) ? response.roles : []
    error.value = ''
  } catch (err) {
    if (err.name !== 'AbortError') {
      roles.value = []
      error.value = err.message
    }
  } finally {
    if (!controller.signal.aborted) loading.value = false
  }
}

onMounted(loadPlayers)
onBeforeUnmount(() => controller?.abort())
</script>

<template>
  <section class="border-t border-white/10 bg-[#101010] py-16 sm:py-20" aria-labelledby="featured-pros-title">
    <div class="site-container">
      <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="eyebrow flex items-center gap-2">
            <Trophy :size="15" aria-hidden="true" /> Learn from the best
          </p>
          <h2 id="featured-pros-title" class="display-font mt-2 text-3xl sm:text-4xl">
            Watch how the pros win
          </h2>
        </div>
        <p class="max-w-md text-sm leading-6 muted">
          Explore a recent winning performance from a standout player in every role.
        </p>
      </div>

      <div
        v-if="loading"
        class="flex snap-x snap-mandatory gap-4 overflow-hidden md:grid md:grid-cols-2 xl:grid-cols-4"
        role="status"
      >
        <article
          v-for="index in 4"
          :key="index"
          class="panel min-h-105 min-w-[86%] snap-start rounded-2xl p-5 md:min-w-0"
        >
          <div class="h-5 w-20 animate-pulse rounded bg-white/[.07]"></div>
          <div class="mt-6 flex items-center gap-3">
            <div class="size-14 animate-pulse rounded-xl bg-white/[.07]"></div>
            <div class="flex-1 space-y-2">
              <div class="h-5 w-3/4 animate-pulse rounded bg-white/[.08]"></div>
              <div class="h-3 w-1/2 animate-pulse rounded bg-white/[.06]"></div>
            </div>
          </div>
          <div class="mt-7 h-28 animate-pulse rounded-xl bg-white/[.05]"></div>
          <div class="mt-5 h-16 animate-pulse rounded-xl bg-white/[.05]"></div>
          <span class="sr-only">Loading featured professional players…</span>
        </article>
      </div>

      <div v-else-if="error" class="panel flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6" role="alert">
        <div>
          <p class="text-sm font-semibold text-[#f3eee4]">The pro spotlight is unavailable.</p>
          <p class="mt-1 text-sm muted">{{ error }}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="ghost-button text-xs" @click="loadPlayers">
            <RefreshCw :size="14" aria-hidden="true" /> Retry
          </button>
          <RouterLink to="/players" class="ghost-button text-xs">Browse players</RouterLink>
        </div>
      </div>

      <div v-else-if="!visibleRoles.length" class="panel rounded-2xl p-6">
        <p class="text-sm font-semibold text-[#f3eee4]">No featured pros are ready yet.</p>
        <p class="mt-1 text-sm muted">Browse the player directory while new winning matches are collected.</p>
        <RouterLink to="/players" class="ghost-button mt-4 text-xs">Browse players</RouterLink>
      </div>

      <div
        v-else
        class="featured-pro-scroll flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 xl:grid-cols-4"
        role="list"
        aria-label="Featured professional players by role"
        tabindex="0"
      >
        <article
          v-for="role in visibleRoles"
          :key="role.playerRole"
          class="panel group flex min-w-[86%] snap-start flex-col rounded-2xl p-5 transition hover:-translate-y-1 hover:border-[#d946ff]/55 focus-within:border-[#d946ff]/55 md:min-w-0"
          role="listitem"
        >
          <div class="flex items-center justify-between gap-3">
            <span class="rounded-full border border-[#d946ff]/35 bg-[#d946ff]/10 px-3 py-1 text-[.64rem] font-bold uppercase tracking-[.16em] text-[#ea73ff]">
              {{ role.roleLabel }}
            </span>
            <span class="rounded-full border border-[#70e2a1]/35 bg-[#70e2a1]/10 px-2.5 py-1 text-[.62rem] font-bold tracking-[.14em] text-[#70e2a1]">
              WIN
            </span>
          </div>

          <div class="mt-6 flex min-w-0 items-center gap-3">
            <img
              v-if="imageUrl(role.player.avatarFull)"
              :src="imageUrl(role.player.avatarFull)"
              :alt="playerName(role.player)"
              class="size-14 shrink-0 rounded-xl object-cover"
              loading="lazy"
            />
            <span v-else class="grid size-14 shrink-0 place-items-center rounded-xl bg-[#d946ff]/10 text-[#d946ff]">
              <UserRound :size="25" aria-hidden="true" />
            </span>
            <div class="min-w-0">
              <RouterLink
                :to="`/players/${role.player.accountId}`"
                class="display-font block truncate text-xl text-[#f6f1e5] transition hover:text-[#ea73ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d946ff]"
              >
                {{ playerName(role.player) }}
              </RouterLink>
              <p v-if="teamLabel(role.player)" class="mt-1 truncate text-xs muted">
                {{ teamLabel(role.player) }}
              </p>
              <p v-else class="mt-1 text-xs muted">Professional player</p>
            </div>
          </div>

          <div class="mt-7 rounded-xl border border-white/10 bg-black/30 p-4">
            <div class="flex items-center gap-3">
              <HeroPortrait :hero="role.player.recentWin.hero" size="large" />
              <div class="min-w-0">
                <p class="text-[.62rem] font-bold uppercase tracking-[.16em] text-[#70e2a1]">Recent victory</p>
                <p class="mt-1 truncate text-sm font-semibold text-[#f2eee6]">
                  {{ role.player.recentWin.hero.localizedName || 'Unknown hero' }}
                </p>
                <p class="mt-1 text-xs muted">
                  {{ matchDate(role.player.recentWin.matchStart) }} · {{ formatDuration(role.player.recentWin.duration) }}
                </p>
              </div>
            </div>
          </div>

          <div class="mt-4 grid grid-cols-3 gap-2 text-center">
            <div class="rounded-lg bg-black/35 px-2 py-3">
              <p class="text-sm font-bold text-[#f6f1e5]">{{ role.player.recentWin.kills ?? 0 }}</p>
              <p class="mt-1 text-[.58rem] uppercase tracking-wider muted">Kills</p>
            </div>
            <div class="rounded-lg bg-black/35 px-2 py-3">
              <p class="text-sm font-bold text-[#f6f1e5]">{{ role.player.recentWin.deaths ?? 0 }}</p>
              <p class="mt-1 text-[.58rem] uppercase tracking-wider muted">Deaths</p>
            </div>
            <div class="rounded-lg bg-black/35 px-2 py-3">
              <p class="text-sm font-bold text-[#f6f1e5]">{{ role.player.recentWin.assists ?? 0 }}</p>
              <p class="mt-1 text-[.58rem] uppercase tracking-wider muted">Assists</p>
            </div>
          </div>

          <div class="mt-auto flex items-center justify-between gap-3 pt-6">
            <RouterLink
              :to="`/players/${role.player.accountId}`"
              class="text-xs font-semibold text-[#d7cfe0] transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d946ff]"
            >
              View player
            </RouterLink>
            <RouterLink
              :to="`/matches/${role.player.recentWin.matchId}`"
              class="inline-flex items-center gap-1 text-xs font-bold text-[#ea73ff] transition group-hover:gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d946ff]"
            >
              View match <ArrowRight :size="14" aria-hidden="true" />
            </RouterLink>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.featured-pro-scroll {
  scrollbar-width: none;
}

.featured-pro-scroll::-webkit-scrollbar {
  display: none;
}
</style>
