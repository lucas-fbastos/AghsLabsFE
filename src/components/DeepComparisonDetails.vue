<script setup>
import { computed } from 'vue'
import { AlertTriangle, Clock3, Swords } from '@lucide/vue'
import { compact, number } from '../lib/dota.js'
import ItemSlots from './ItemSlots.vue'

const props = defineProps({
  comparison: { type: Object, required: true },
  leftName: { type: String, default: 'Player one' },
  rightName: { type: String, default: 'Player two' },
})

const summaryMetrics = [
  ['level', 'Level'],
  ['kills', 'Kills'],
  ['deaths', 'Deaths'],
  ['assists', 'Assists'],
  ['lastHits', 'Last hits'],
  ['denies', 'Denies'],
  ['goldPerMinute', 'GPM'],
  ['xpPerMinute', 'XPM'],
  ['netWorth', 'Net worth'],
  ['heroDamage', 'Hero damage'],
  ['towerDamage', 'Tower damage'],
  ['heroHealing', 'Hero healing'],
  ['teamfightParticipation', 'Fight participation'],
]

const warnings = computed(() => props.comparison.availabilityWarnings || [])
const itemComparison = computed(() => props.comparison.itemComparison || {})
const abilityComparison = computed(() => props.comparison.abilityComparison || {})
const teamfights = computed(() => props.comparison.teamfightComparison || {})

const warningLabels = {
  LEFT_MATCH_NOT_PARSED: 'The left match has not been fully parsed by OpenDota.',
  RIGHT_MATCH_NOT_PARSED: 'The right match has not been fully parsed by OpenDota.',
  HERO_MISMATCH: 'These matches used different heroes.',
  LEFT_FARM_TIMELINE_UNAVAILABLE: 'The left match has no farm timeline.',
  RIGHT_FARM_TIMELINE_UNAVAILABLE: 'The right match has no farm timeline.',
  NO_SHARED_FARM_CHECKPOINTS: 'The matches have no shared farm checkpoints.',
  LEFT_PURCHASE_TIMINGS_UNAVAILABLE: 'The left match has no purchase timing data.',
  RIGHT_PURCHASE_TIMINGS_UNAVAILABLE: 'The right match has no purchase timing data.',
  LEFT_ABILITY_ORDER_UNAVAILABLE: 'The left match has no skill order data.',
  RIGHT_ABILITY_ORDER_UNAVAILABLE: 'The right match has no skill order data.',
  LEFT_TEAMFIGHTS_UNAVAILABLE: 'The left match has no teamfight data.',
  RIGHT_TEAMFIGHTS_UNAVAILABLE: 'The right match has no teamfight data.',
  LEFT_TEAMFIGHT_PLAYER_DATA_PARTIAL: 'Some left-player teamfight details are missing.',
  RIGHT_TEAMFIGHT_PLAYER_DATA_PARTIAL: 'Some right-player teamfight details are missing.',
}

function warningText(warning) {
  const code = String(warning || '')
  return warningLabels[code]
    || code.replaceAll('_', ' ').toLowerCase().replace(/^./, letter => letter.toUpperCase())
}

function clock(value) {
  if (value == null) return '—'
  const total = Math.max(0, Math.round(Number(value) || 0))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function signed(value, key) {
  if (value == null || !Number.isFinite(Number(value))) return '—'
  const numeric = Number(value)
  if (key === 'teamfightParticipation') {
    const percentage = Math.abs(numeric) <= 1 ? numeric * 100 : numeric
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`
  }
  return `${numeric > 0 ? '+' : ''}${Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(numeric)}`
}

function deltaClass(value, invert = false) {
  const numeric = Number(value)
  if (!Number.isFinite(numeric) || numeric === 0) return 'text-[#c5cec8]'
  const positive = invert ? numeric < 0 : numeric > 0
  return positive ? 'win-text' : 'loss-text'
}

function slotItems(items) {
  if (!Array.isArray(items)) return []
  return Array.from({ length: 6 }, (_, slot) => items.find(item => item?.slot === slot))
}

function fightMetrics(fight) {
  if (!fight) return []
  return [
    ['Fights', fight.fightCount],
    ['Damage', compact(fight.damage)],
    ['Healing', compact(fight.healing)],
    ['Deaths', fight.deaths],
    ['Buybacks', fight.buybacks],
    ['Gold swing', signed(fight.goldDelta)],
    ['XP swing', signed(fight.xpDelta)],
  ]
}
</script>

<template>
  <div>
    <div class="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
      <div>
        <p class="eyebrow comparison-blue">Deep comparison</p>
        <h3 class="display-font mt-1 text-2xl">How these games diverged</h3>
        <p class="mt-2 text-xs muted">All deltas are {{ comparison.deltaDefinition === 'LEFT_MINUS_RIGHT' ? `${leftName} minus ${rightName}` : 'shown in API order' }}.</p>
      </div>
      <span v-if="comparison.completeData" class="comparison-pill self-start">Complete parsed data</span>
      <span v-else class="inline-flex self-start items-center gap-1.5 rounded-full border border-[#e7b451]/30 bg-[#e7b451]/10 px-3 py-1 text-[.65rem] font-bold uppercase tracking-wider text-[#e7c477]">
        <AlertTriangle :size="13" aria-hidden="true" /> Partial data
      </span>
    </div>

    <div v-if="warnings.length" class="mb-6 rounded-xl border border-[#e7b451]/25 bg-[#e7b451]/[.07] p-4" role="note">
      <p class="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#e7c477]"><AlertTriangle :size="15" aria-hidden="true" /> Availability notes</p>
      <ul class="mt-2 grid gap-1 text-xs leading-5 text-[#d1c7ad]">
        <li v-for="warning in warnings" :key="warning">• {{ warningText(warning) }}</li>
      </ul>
    </div>

    <section aria-labelledby="summary-deltas-title">
      <h4 id="summary-deltas-title" class="text-sm font-bold text-[#eef2ec]">Summary deltas</h4>
      <div v-if="comparison.summaryDelta" class="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <div v-for="([key, label]) in summaryMetrics" :key="key" class="rounded-xl border border-white/[.07] bg-black/25 p-3">
          <p class="text-[.62rem] uppercase tracking-wider muted">{{ label }}</p>
          <p class="mt-1 text-base font-bold" :class="deltaClass(comparison.summaryDelta[key], key === 'deaths')">{{ signed(comparison.summaryDelta[key], key) }}</p>
        </div>
      </div>
      <p v-else class="mt-3 text-sm muted">Summary deltas are unavailable for this pair.</p>
    </section>

    <section class="mt-8" aria-labelledby="farm-checkpoints-title">
      <div class="flex flex-wrap items-end justify-between gap-2">
        <h4 id="farm-checkpoints-title" class="text-sm font-bold text-[#eef2ec]">Farm checkpoints</h4>
        <span class="text-[.65rem] muted">Gold · XP · last hits / denies · net worth</span>
      </div>
      <div v-if="comparison.farmCheckpoints?.length" class="mt-3 overflow-x-auto rounded-xl border border-white/[.08]">
        <table class="w-full min-w-180 text-left text-xs">
          <thead class="bg-white/[.04] text-[.6rem] uppercase tracking-wider text-[#93a39a]">
            <tr><th class="px-3 py-3">Time</th><th class="px-3 py-3">{{ leftName }}</th><th class="px-3 py-3">{{ rightName }}</th><th class="px-3 py-3">Delta</th></tr>
          </thead>
          <tbody>
            <tr v-for="checkpoint in comparison.farmCheckpoints" :key="checkpoint.timeSeconds" class="border-t border-white/[.06]">
              <td class="px-3 py-3 font-mono text-[#9cc8ff]">{{ clock(checkpoint.timeSeconds) }}</td>
              <td class="px-3 py-3"><span class="block">{{ number(checkpoint.left?.gold) }}g · {{ number(checkpoint.left?.xp) }} XP</span><span class="mt-1 block muted">{{ number(checkpoint.left?.lastHits) }}/{{ number(checkpoint.left?.denies) }} LH/DN · {{ compact(checkpoint.left?.netWorth) }} NW</span></td>
              <td class="px-3 py-3"><span class="block">{{ number(checkpoint.right?.gold) }}g · {{ number(checkpoint.right?.xp) }} XP</span><span class="mt-1 block muted">{{ number(checkpoint.right?.lastHits) }}/{{ number(checkpoint.right?.denies) }} LH/DN · {{ compact(checkpoint.right?.netWorth) }} NW</span></td>
              <td class="px-3 py-3 font-semibold" :class="deltaClass(checkpoint.delta?.netWorth)"><span class="block">{{ signed(checkpoint.delta?.gold) }}g · {{ signed(checkpoint.delta?.xp) }} XP</span><span class="mt-1 block">{{ signed(checkpoint.delta?.lastHits) }}/{{ signed(checkpoint.delta?.denies) }} LH/DN · {{ signed(checkpoint.delta?.netWorth) }} NW</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="mt-3 rounded-xl border border-white/[.07] bg-black/20 p-4 text-sm muted">Farm timelines were not available in the parsed match data.</p>
    </section>

    <section class="mt-8" aria-labelledby="items-title">
      <h4 id="items-title" class="text-sm font-bold text-[#eef2ec]">Items and purchase timing</h4>
      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <div class="rounded-xl border border-white/[.07] bg-black/20 p-4">
          <p class="mb-3 text-xs font-semibold text-[#aebbb4]">{{ leftName }} final build</p>
          <ItemSlots :items="slotItems(itemComparison.leftFinalItems)" />
        </div>
        <div class="rounded-xl border border-white/[.07] bg-black/20 p-4">
          <p class="mb-3 text-xs font-semibold text-[#aebbb4]">{{ rightName }} final build</p>
          <ItemSlots :items="slotItems(itemComparison.rightFinalItems)" />
        </div>
      </div>
      <div v-if="itemComparison.purchaseTimings?.length" class="mt-3 overflow-x-auto rounded-xl border border-white/[.08]">
        <table class="w-full min-w-130 text-left text-xs">
          <thead class="bg-white/[.04] text-[.6rem] uppercase tracking-wider text-[#93a39a]"><tr><th class="px-3 py-3">Item</th><th class="px-3 py-3">{{ leftName }}</th><th class="px-3 py-3">{{ rightName }}</th><th class="px-3 py-3">Delta</th></tr></thead>
          <tbody><tr v-for="timing in itemComparison.purchaseTimings" :key="timing.itemKey" class="border-t border-white/[.06]"><td class="px-3 py-3 font-semibold text-[#e6eae4]">{{ timing.itemKey?.replaceAll('_', ' ') || 'Unknown item' }}</td><td class="px-3 py-3">{{ clock(timing.leftTimeSeconds) }}</td><td class="px-3 py-3">{{ clock(timing.rightTimeSeconds) }}</td><td class="px-3 py-3 font-semibold" :class="deltaClass(timing.deltaSeconds, true)">{{ signed(timing.deltaSeconds) }}s</td></tr></tbody>
        </table>
      </div>
      <p v-else class="mt-3 text-xs muted">Comparable item purchase timings were not available.</p>
    </section>

    <section class="mt-8" aria-labelledby="skills-title">
      <h4 id="skills-title" class="text-sm font-bold text-[#eef2ec]">Skill order IDs</h4>
      <p class="mt-1 text-xs muted">Ability metadata is not currently enriched, so the parsed upgrade IDs are shown in order.</p>
      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <div v-for="(order, index) in [abilityComparison.leftOrderIds, abilityComparison.rightOrderIds]" :key="index" class="rounded-xl border border-white/[.07] bg-black/20 p-4">
          <p class="mb-3 text-xs font-semibold text-[#aebbb4]">{{ index ? rightName : leftName }}</p>
          <ol v-if="order?.length" class="flex flex-wrap gap-1.5" :aria-label="`${index ? rightName : leftName} skill upgrade order`">
            <li v-for="(abilityId, skillIndex) in order" :key="`${skillIndex}-${abilityId}`" class="inline-flex items-center gap-1 rounded-md border border-[#58a6ff]/20 bg-[#58a6ff]/[.07] px-2 py-1 font-mono text-[.68rem] text-[#bddaff]"><span class="text-[#778a9f]">{{ skillIndex + 1 }}.</span>{{ abilityId }}</li>
          </ol>
          <p v-else class="text-xs muted">No parsed skill order is available.</p>
        </div>
      </div>
    </section>

    <section class="mt-8" aria-labelledby="teamfights-title">
      <h4 id="teamfights-title" class="flex items-center gap-2 text-sm font-bold text-[#eef2ec]"><Swords :size="16" class="text-[#58a6ff]" aria-hidden="true" /> Teamfights</h4>
      <div v-if="teamfights.left || teamfights.right" class="mt-3 grid gap-3 lg:grid-cols-3">
        <div v-for="(fight, index) in [teamfights.left, teamfights.right, teamfights.delta]" :key="index" class="rounded-xl border border-white/[.07] bg-black/20 p-4">
          <p class="text-xs font-semibold" :class="index === 2 ? 'text-[#9cc8ff]' : 'text-[#aebbb4]'">{{ index === 0 ? leftName : index === 1 ? rightName : 'Delta' }}</p>
          <dl class="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
            <template v-for="([label, value]) in fightMetrics(fight)" :key="label"><dt class="text-[.65rem] muted">{{ label }}</dt><dd class="text-right text-xs font-semibold">{{ value ?? '—' }}</dd></template>
          </dl>
          <p v-if="fight?.firstFightStartSeconds != null" class="mt-3 flex items-center gap-1 text-[.65rem] muted"><Clock3 :size="12" aria-hidden="true" /> First fight {{ clock(fight.firstFightStartSeconds) }}</p>
        </div>
      </div>
      <p v-else class="mt-3 rounded-xl border border-white/[.07] bg-black/20 p-4 text-sm muted">Teamfight data is not available for these matches.</p>

      <div v-if="teamfights.leftTimeline?.length || teamfights.rightTimeline?.length" class="mt-3 grid gap-3 lg:grid-cols-2">
        <div v-for="(timeline, index) in [teamfights.leftTimeline, teamfights.rightTimeline]" :key="index" class="rounded-xl border border-white/[.07] bg-black/20 p-4">
          <p class="text-xs font-semibold text-[#aebbb4]">{{ index ? rightName : leftName }} fight timeline</p>
          <ol v-if="timeline?.length" class="mt-3 grid gap-2">
            <li v-for="(fight, fightIndex) in timeline" :key="`${fight.startSeconds}-${fightIndex}`" class="grid grid-cols-[auto_1fr] gap-3 rounded-lg bg-white/[.03] p-3 text-xs">
              <span class="font-mono text-[#9cc8ff]">{{ clock(fight.startSeconds) }}</span>
              <span class="text-[#c8d1cb]">{{ compact(fight.damage) }} damage · {{ fight.deaths ?? '—' }} deaths · {{ signed(fight.goldDelta) }} gold</span>
            </li>
          </ol>
          <p v-else class="mt-3 text-xs muted">No teamfight events available.</p>
        </div>
      </div>
    </section>
  </div>
</template>
