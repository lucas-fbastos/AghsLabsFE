<script setup>
import { computed } from 'vue'
import HeroPortrait from './HeroPortrait.vue'

const props = defineProps({
  player: { type: Object, required: true },
  aggregates: { type: Array, default: () => [] },
  label: { type: String, default: 'Recent hero pool' },
})

const playerName = computed(() => props.player?.personaName || props.player?.name || 'Unknown player')
const sorted = computed(() => [...props.aggregates].sort((a, b) => (b.games || 0) - (a.games || 0) || (b.winRate || 0) - (a.winRate || 0)))
const winRatePercent = value => {
  const numeric = Number(value) || 0
  return numeric <= 1 ? numeric * 100 : numeric
}
const percentage = value => `${Math.max(0, Math.min(100, winRatePercent(value)))}%`
</script>

<template>
  <section class="panel rounded-2xl p-5 sm:p-6" :aria-label="`${playerName} hero usage`">
    <p class="eyebrow text-[.6rem]">{{ label }}</p>
    <h3 class="display-font mt-1 truncate text-2xl">{{ playerName }}</h3>
    <p class="mt-2 text-xs muted">Usage and results across the 30-match candidate window.</p>

    <div v-if="sorted.length" class="mt-5 grid gap-2.5">
      <div v-for="hero in sorted" :key="hero.heroId" class="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-white/[.07] bg-black/20 p-2.5">
        <HeroPortrait :hero="{ localizedName: hero.heroName, image: hero.heroImage }" />
        <div class="min-w-0">
          <div class="flex items-center justify-between gap-2">
            <p class="truncate text-sm font-semibold text-[#eff1eb]">{{ hero.heroName || 'Unknown hero' }}</p>
            <span class="text-xs muted">{{ hero.games ?? 0 }} games</span>
          </div>
          <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[.07]" aria-hidden="true">
            <span class="block h-full rounded-full bg-[#58a6ff]" :style="{ width: percentage(hero.winRate) }"></span>
          </div>
        </div>
        <div class="text-right">
          <p class="text-sm font-bold" :class="winRatePercent(hero.winRate) >= 50 ? 'win-text' : 'loss-text'">{{ Math.round(winRatePercent(hero.winRate)) }}%</p>
          <p class="mt-0.5 text-[.65rem] muted">{{ hero.wins ?? 0 }}W</p>
        </div>
      </div>
    </div>
    <p v-else class="mt-5 rounded-xl border border-white/[.07] bg-black/20 p-5 text-sm muted">No hero usage data is available in this window.</p>
  </section>
</template>
