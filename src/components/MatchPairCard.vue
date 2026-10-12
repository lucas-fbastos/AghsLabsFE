<script setup>
import { computed, useId } from 'vue'
import { AlertTriangle, CheckCircle2, ChevronDown, Clock3, ExternalLink, LockKeyhole, Sparkles } from '@lucide/vue'
import { compact, formatDuration, number } from '../lib/dota.js'
import HeroPortrait from './HeroPortrait.vue'
import ItemSlots from './ItemSlots.vue'

const props = defineProps({
  pair: { type: Object, required: true },
  leftName: { type: String, default: 'Player one' },
  rightName: { type: String, default: 'Player two' },
  expanded: { type: Boolean, default: false },
  dataStatus: {
    type: String,
    default: '',
    validator: value => ['', 'complete', 'partial'].includes(value),
  },
})

defineEmits(['toggle'])

const uid = useId().replaceAll(':', '')
const detailsId = `match-pair-details-${uid}`
const left = computed(() => props.pair.left || {})
const right = computed(() => props.pair.right || {})
const sameHero = computed(() => props.pair.deepComparisonAvailable
  || (left.value.heroId != null && String(left.value.heroId) === String(right.value.heroId)))
const tier = computed(() => String(props.pair.compatibilityTier || 'WEAK').toUpperCase())
const isOptimal = computed(() => sameHero.value && tier.value === 'OPTIMAL')
const canExpand = computed(() => Boolean(props.pair.deepComparisonAvailable && sameHero.value))
const score = computed(() => {
  const raw = Number(props.pair.qualityScore)
  if (!Number.isFinite(raw)) return null
  return Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(raw)
})
const reasonText = reason => String(reason || '').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase())
const hero = match => ({ localizedName: match?.heroName, image: match?.heroImage })
const outcome = match => match?.won == null ? '—' : match.won ? 'WIN' : 'LOSS'
const matchDate = value => {
  if (!value) return ''
  const numeric = Number(value)
  const date = new Date(Number.isFinite(numeric) && numeric < 1_000_000_000_000 ? numeric * 1000 : value)
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date)
}
const orderedItems = items => {
  if (!Array.isArray(items)) return []
  const hasSlots = items.some(item => Number.isInteger(item?.slot))
  if (!hasSlots) return items.slice(0, 6)
  return Array.from({ length: 6 }, (_, slot) => items.find(item => item?.slot === slot))
}
</script>

<template>
  <article
    class="comparison-pair overflow-hidden rounded-2xl border bg-black/30 transition"
    :class="sameHero ? 'comparison-pair-same' : 'border-white/10'"
  >
    <div
      class="block w-full p-4 text-left sm:p-5"
      :class="canExpand ? 'cursor-pointer hover:bg-white/[.025]' : 'cursor-default'"
      @click="canExpand && $emit('toggle')"
    >
      <div class="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-white/[.08] pb-3">
        <div class="flex flex-wrap items-center gap-2">
          <span v-if="isOptimal" class="optimal-pill"><Sparkles :size="12" aria-hidden="true" /> Optimal scenario</span>
          <span v-else-if="sameHero" class="optimal-pill"><Sparkles :size="12" aria-hidden="true" /> Same hero</span>
          <span v-if="dataStatus === 'complete'" class="inline-flex items-center gap-2 rounded-full border border-[#69f0ae]/50 bg-[#173c2c]/90 px-3.5 py-1.5 text-[.72rem] font-black uppercase tracking-[.11em] text-[#a7ffd0] shadow-[0_0_10px_rgba(105,240,174,.45),0_0_24px_rgba(105,240,174,.2)]">
            <CheckCircle2 :size="15" aria-hidden="true" /> Complete parsed data
          </span>
          <span v-else-if="dataStatus === 'partial'" class="inline-flex items-center gap-1.5 rounded-full border border-[#e7b451]/35 bg-[#e7b451]/10 px-3 py-1 text-[.66rem] font-bold uppercase tracking-wider text-[#e7c477]">
            <AlertTriangle :size="13" aria-hidden="true" /> Partial data
          </span>
          <span class="comparison-tier">{{ reasonText(tier) }}</span>
          <span v-if="score != null" class="text-[.68rem] font-semibold text-[#aac6e8]">Pair score {{ score }}</span>
        </div>
        <div class="flex items-center gap-3 text-[.68rem] muted">
          <span v-if="left.durationSeconds != null" class="inline-flex items-center gap-1"><Clock3 :size="12" aria-hidden="true" /> {{ formatDuration(left.durationSeconds) }}</span>
          <button
            v-if="canExpand"
            type="button"
            class="grid size-8 place-items-center rounded-lg text-[#58a6ff] transition hover:bg-[#58a6ff]/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#58a6ff]"
            :aria-expanded="expanded"
            :aria-controls="detailsId"
            :aria-label="expanded ? 'Collapse match comparison details' : 'Expand match comparison details'"
            @click.stop="$emit('toggle')"
          >
            <ChevronDown :size="18" class="transition" :class="expanded ? 'rotate-180' : ''" aria-hidden="true" />
          </button>
          <span v-else :id="`${detailsId}-unavailable`" class="inline-flex items-center gap-1"><LockKeyhole :size="12" aria-hidden="true" /> Same hero required for deep view</span>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center">
        <div v-for="(match, index) in [left, right]" :key="`${match.matchId}-${index}`" class="min-w-0" :class="index ? 'lg:col-start-3' : 'lg:col-start-1 lg:row-start-1'">
          <div class="flex items-center gap-3">
            <HeroPortrait :hero="hero(match)" />
            <div class="min-w-0 flex-1">
              <p class="truncate text-xs font-semibold text-[#aebbb3]">{{ index ? rightName : leftName }}</p>
              <p class="mt-0.5 truncate text-sm font-bold text-[#f1f1eb]">{{ match.heroName || 'Unknown hero' }}</p>
              <p class="mt-0.5 flex items-center gap-1 text-[.68rem] muted">
                <RouterLink
                  v-if="match.matchId != null"
                  :to="`/matches/${match.matchId}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 text-[#8fc4ff] underline decoration-[#58a6ff]/40 underline-offset-2 transition hover:text-[#c4e1ff]"
                  :aria-label="`Open match ${match.matchId} in a new tab`"
                  @click.stop
                >
                  Match #{{ match.matchId }} <ExternalLink :size="10" aria-hidden="true" />
                </RouterLink>
                <span v-else>Match unavailable</span>
                <template v-if="matchDate(match.startTime)"> · {{ matchDate(match.startTime) }}</template>
              </p>
            </div>
            <div class="text-right">
              <p class="text-xs font-black" :class="match.won == null ? 'muted' : match.won ? 'win-text' : 'loss-text'">{{ outcome(match) }}</p>
              <p class="mt-1 whitespace-nowrap text-sm font-semibold">{{ match.kills ?? '—' }}/{{ match.deaths ?? '—' }}/{{ match.assists ?? '—' }}</p>
            </div>
          </div>

          <div class="mt-4 grid grid-cols-3 gap-2 text-center">
            <div class="rounded-lg bg-white/[.035] px-2 py-2">
              <p class="text-xs font-semibold text-[#e6e9e3]">{{ number(match.lastHits) }}<template v-if="match.denies != null"> / {{ number(match.denies) }}</template></p>
              <p class="mt-1 text-[.58rem] uppercase tracking-wider muted">LH / DN</p>
            </div>
            <div class="rounded-lg bg-white/[.035] px-2 py-2">
              <p class="text-xs font-semibold text-[#e6e9e3]">{{ number(match.goldPerMinute) }} / {{ number(match.xpPerMinute) }}</p>
              <p class="mt-1 text-[.58rem] uppercase tracking-wider muted">GPM / XPM</p>
            </div>
            <div class="rounded-lg bg-white/[.035] px-2 py-2">
              <p class="text-xs font-semibold text-[#f5c84c]">{{ match.netWorth == null ? 'On expand' : compact(match.netWorth) }}</p>
              <p class="mt-1 text-[.58rem] uppercase tracking-wider muted">Net worth</p>
            </div>
          </div>
          <div class="mt-3">
            <ItemSlots :items="orderedItems(match.items)" />
          </div>
        </div>

        <div class="hidden text-center lg:col-start-2 lg:row-start-1 lg:block">
          <span class="display-font text-xl text-[#78867d]">VS</span>
        </div>
      </div>

      <div v-if="pair.compatibilityReasons?.length" class="mt-4 flex flex-wrap gap-1.5 border-t border-white/[.06] pt-3">
        <span v-for="reason in pair.compatibilityReasons" :key="reason" class="rounded-full border border-white/10 bg-white/[.035] px-2.5 py-1 text-[.62rem] text-[#aebbb4]">{{ reasonText(reason) }}</span>
      </div>
    </div>

    <div v-if="expanded && canExpand" :id="detailsId" class="border-t border-[#58a6ff]/20 bg-[#06111f]/45 p-4 sm:p-6">
      <slot name="details" />
    </div>
  </article>
</template>
