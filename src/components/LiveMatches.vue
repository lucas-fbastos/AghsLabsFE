<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Clock3, Radio } from '@lucide/vue'
import { RouterLink } from 'vue-router'
import { api } from '../lib/api.js'
import { formatDuration, number } from '../lib/dota.js'
import HeroPortrait from './HeroPortrait.vue'

const matches = ref([])
const loading = ref(true)
const error = ref('')
let controller
const heroImages = images => Array.isArray(images)
  ? images.filter(image => typeof image === 'string' && image.trim()).slice(0, 5)
  : []
const visibleMatches = computed(() => matches.value.filter(match => {
  return match?.matchId != null
    && match.duration != null
    && match.radiantScore != null
    && match.direScore != null
    && heroImages(match.radiantHeroImages).length > 0
    && heroImages(match.direHeroImages).length > 0
}))

const liveDuration = duration => {
  if (duration === 0 || duration === 'PT0S') return '0:00'
  return formatDuration(duration)
}

async function loadMatches() {
  controller?.abort()
  controller = new AbortController()

  try {
    matches.value = await api.liveMatches(5, controller.signal)
    error.value = ''
  } catch (err) {
    if (err.name !== 'AbortError') error.value = err.message
  } finally {
    if (!controller.signal.aborted) loading.value = false
  }
}

onMounted(() => {
  loadMatches()
})

onBeforeUnmount(() => {
  controller?.abort()
})
</script>

<template>
  <section class="border-t border-white/10 bg-[#101010] py-16 sm:py-20" aria-labelledby="live-matches-title">
    <div class="site-container">
      <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="eyebrow flex items-center gap-2 text-[#70e2a1]">
            <Radio :size="15" /> Recent
          </p>
          <h2 id="live-matches-title" class="display-font mt-2 text-3xl sm:text-4xl">
            Recent matches
          </h2>
        </div>
        <p class="text-sm muted">Up to 5 ongoing matches.</p>
      </div>

      <p v-if="loading" class="panel rounded-xl p-6 text-sm muted" role="status">
        Loading live matches…
      </p>
      <p v-else-if="error" class="panel rounded-xl p-6 text-sm muted" role="status">
        {{ error }}
      </p>
      <p v-else-if="!visibleMatches.length" class="panel rounded-xl p-6 text-sm muted">
        No live matches are available right now.
      </p>

      <div v-else class="grid gap-4">
        <RouterLink
          v-for="match in visibleMatches"
          :key="match.matchId"
          :to="`/matches/${match.matchId}`"
          class="panel block overflow-hidden rounded-2xl p-4 transition hover:border-[#d946ff]/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d946ff] sm:p-5"
          :aria-label="`Open match ${match.matchId}`"
        >
          <div class="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span class="text-xs font-semibold text-[#d946ff]">
                Match #{{ match.matchId }}
              </span>
              <span class="text-xs muted">Avg MMR {{ number(match.averageMmr) }}</span>
            </div>
            <div class="flex shrink-0 items-center gap-4 text-sm">
              <p class="flex items-center gap-1.5 font-mono text-xs text-[#d4d8d0]">
                <Clock3 :size="14" class="text-[#70e2a1]" />
                {{ liveDuration(match.duration) }}
              </p>
            </div>
          </div>

          <div class="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2 sm:gap-5">
            <div>
              <div class="grid grid-cols-5 gap-1.5 sm:gap-3">
                <div
                  v-for="(heroImage, index) in heroImages(match.radiantHeroImages)"
                  :key="`${heroImage}-${index}`"
                  class="min-w-0"
                >
                  <HeroPortrait :hero="heroImage" size="small" />
                </div>
              </div>
              <p
                class="mt-2 text-center text-lg font-bold text-[#70e2a1]"
                :aria-label="`Radiant score ${match.radiantScore ?? 0}`"
              >
                {{ match.radiantScore ?? 0 }}
              </p>
            </div>

            <span class="display-font mt-3 text-[.65rem] text-[#d1ccb9] sm:mt-5 sm:text-sm">VS</span>

            <div>
              <div class="grid grid-cols-5 gap-1.5 sm:gap-3">
                <div
                  v-for="(heroImage, index) in heroImages(match.direHeroImages)"
                  :key="`${heroImage}-${index}`"
                  class="min-w-0"
                >
                  <HeroPortrait :hero="heroImage" size="small" />
                </div>
              </div>
              <p
                class="mt-2 text-center text-lg font-bold text-[#ff6464]"
                :aria-label="`Dire score ${match.direScore ?? 0}`"
              >
                {{ match.direScore ?? 0 }}
              </p>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>
  </section>
</template>
