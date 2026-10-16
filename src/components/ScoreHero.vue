<script setup>
import {computed} from 'vue'
import {Clock3, Hash, MapPin, Swords} from '@lucide/vue'
import {formatDuration, modeName} from '../lib/dota.js'

const props = defineProps({match: {type: Object, required: true}})
const teams = computed(() => {
  const radiant = {
    side: 'Radiant',
    name: props.match.radiantName,
    score: props.match.radiantScore,
    style: 'radiant-text',
  }
  const dire = {
    side: 'Dire',
    name: props.match.direName,
    score: props.match.direScore,
    style: 'dire-text',
  }
  const ordered = props.match.radiantWin ? [radiant, dire] : [dire, radiant]

  return ordered.map((team, index) => ({
    ...team,
    title: team.name || `The ${team.side}`,
    outcome: index === 0 ? 'VICTORY' : 'DEFEAT',
    alignment: index === 0 ? 'text-left sm:text-center' : 'text-right sm:text-center',
    column: index === 0 ? 'col-start-1 row-start-1' : 'col-start-3 row-start-1',
  }))
})
</script>

<template>
  <section class="glass score-hero relative overflow-hidden rounded-2xl p-6 sm:p-9">
    <div
        class="score-hero-meta relative flex flex-wrap items-center justify-between gap-4 font-bold uppercase tracking-[.17em] text-[#abb7aa]">
      <span class="flex items-center gap-2"><span
          class="size-2 rounded-full bg-[#d946ff] shadow-[0_0_10px_#d946ff]"></span> Match analysis</span><span
        class="flex items-center gap-2"><Hash :size="14"/> {{ match.matchId }}</span></div>
    <div class="relative mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-8">
      <div
        v-for="team in teams"
        :key="team.side"
        class="min-w-0"
        :class="[team.alignment, team.column]"
      >
        <p class="display-font truncate text-7xl" :class="team.style">{{ team.title }}</p>
        <p v-if="team.name" class="eyebrow mt-1 text-[.55rem] tracking-[.12em]" :class="team.style">
          {{ team.side }}
        </p>
        <p class="display-font score-value mt-3 leading-none" :class="team.style">
          {{ team.score ?? '—' }}
        </p>
        <p class="score-outcome mt-3 text-[#9cab9e]">{{ team.outcome }}</p>
      </div>
      <div class="col-start-2 row-start-1 flex flex-col items-center">
        <div
            class="grid size-12 place-items-center rounded-full border border-[#d946ff]/40 bg-[#d946ff]/10 text-[#d946ff] sm:size-16">
          <Swords :size="27" :stroke-width="1.2"/>
        </div>
        <span class="display-font score-versus mt-3 text-[#d1ccb9]">VS</span></div>
    </div>
    <div
        class="score-hero-details relative mx-auto mt-8 flex w-fit flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-full border border-[#d946ff]/20 bg-black px-6 py-3 text-[#d4d8d0]">
      <span class="flex items-center gap-2"><Clock3 :size="14" class="gold"/> {{
          formatDuration(match.duration)
        }}</span><span class="flex items-center gap-2"><Swords :size="14" class="gold"/> {{ modeName(match.gameMode) }}</span><span
        class="flex items-center gap-2">Average MMR: <span class="font-bold" :class="match.averageMmr === 0 ? 'text-[#89918b]' : 'text-[#c084fc]'">{{ match.averageMmr === 0 ? '-' : match.averageMmr ?? '—' }}</span></span><span
        class="flex items-center gap-2"><MapPin :size="14" class="gold"/> Cluster {{ match.cluster ?? '—' }}</span>
    </div>
  </section>
</template>
