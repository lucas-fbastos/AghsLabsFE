<script setup>
import { computed } from 'vue'
import { Clock3, Hash, MapPin, Swords } from '@lucide/vue'
import { formatDuration, modeName } from '../lib/dota.js'

const props = defineProps({ match: { type: Object, required: true } })
const winner = computed(() => props.match.radiantWin ? 'Radiant' : 'Dire')
</script>

<template>
  <section class="glass relative overflow-hidden rounded-2xl p-6 sm:p-9">
    <div class="relative flex flex-wrap items-center justify-between gap-4 text-[.67rem] font-bold uppercase tracking-[.17em] text-[#abb7aa]"><span class="flex items-center gap-2"><span class="size-2 rounded-full bg-[#d946ff] shadow-[0_0_10px_#d946ff]"></span> Match analysis</span><span class="flex items-center gap-2"><Hash :size="14" /> {{ match.matchId }}</span></div>
    <div class="relative mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-8">
      <div class="text-left sm:text-center"><p class="eyebrow score-team-label radiant-text">The Radiant</p><p class="display-font radiant-text mt-3 text-[clamp(2.3rem,6vw,5rem)] leading-none">{{ match.radiantScore ?? '—' }}</p><p class="mt-3 text-xs text-[#9cab9e]">{{ winner === 'Radiant' ? 'VICTORY' : 'DEFEAT' }}</p></div>
      <div class="flex flex-col items-center"><div class="grid size-12 place-items-center rounded-full border border-[#d946ff]/40 bg-[#d946ff]/10 text-[#d946ff] sm:size-16"><Swords :size="27" :stroke-width="1.2" /></div><span class="display-font mt-3 text-lg text-[#d1ccb9]">VS</span></div>
      <div class="text-right sm:text-center"><p class="eyebrow score-team-label dire-text">The Dire</p><p class="display-font dire-text mt-3 text-[clamp(2.3rem,6vw,5rem)] leading-none">{{ match.direScore ?? '—' }}</p><p class="mt-3 text-xs text-[#9cab9e]">{{ winner === 'Dire' ? 'VICTORY' : 'DEFEAT' }}</p></div>
    </div>
    <div class="relative mx-auto mt-8 flex w-fit flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-full border border-[#d946ff]/20 bg-black px-6 py-3 text-xs text-[#d4d8d0]"><span class="flex items-center gap-2"><Clock3 :size="14" class="gold" /> {{ formatDuration(match.duration) }}</span><span class="flex items-center gap-2"><Swords :size="14" class="gold" /> {{ modeName(match.gameMode) }}</span><span class="flex items-center gap-2"><MapPin :size="14" class="gold" /> Cluster {{ match.cluster ?? '—' }}</span></div>
  </section>
</template>
