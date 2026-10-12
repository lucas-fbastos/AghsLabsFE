<script setup>
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue'
import { Search, UserRound } from '@lucide/vue'
import { api } from '../lib/api.js'
import { imageUrl } from '../lib/dota.js'

const props = defineProps({
  kind: { type: String, default: 'any' },
  label: { type: String, required: true },
  placeholder: { type: String, default: 'Search by player name or account ID' },
  hint: { type: String, default: '' },
  excludedId: { type: [String, Number], default: null },
})

const emit = defineEmits(['select'])
const uid = useId().replaceAll(':', '')
const inputId = `player-search-${uid}`
const listboxId = `${inputId}-results`
const query = ref('')
const results = ref([])
const loading = ref(false)
const error = ref('')
const open = ref(false)
const activeIndex = ref(-1)
let debounceTimer
let blurTimer
let controller

const accountId = player => player?.accountId ?? player?.account_id ?? player?.id
const playerName = player => player?.personaName || player?.personaname || player?.name || 'Unknown player'
const avatar = player => player?.avatarImageFull || player?.avatarFull || player?.avatarfull || player?.avatar || ''
const teamName = player => player?.teamName || player?.team?.name || player?.team_name || ''
const normalizedResults = computed(() => results.value.filter(player => {
  const id = accountId(player)
  return id != null && String(id) !== String(props.excludedId ?? '')
}))
const activeId = computed(() => activeIndex.value >= 0 ? `${inputId}-option-${activeIndex.value}` : undefined)
const status = computed(() => {
  if (loading.value) return 'Searching players…'
  if (error.value) return error.value
  if (query.value.trim().length < 2) return props.hint || 'Type at least two characters.'
  if (!open.value) return props.hint
  return normalizedResults.value.length
    ? `${normalizedResults.value.length} player${normalizedResults.value.length === 1 ? '' : 's'} found.`
    : 'No matching players found.'
})

function responsePlayers(response) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.players)) return response.players
  if (Array.isArray(response?.results)) return response.results
  return []
}

async function runSearch(value) {
  controller?.abort()
  const requestController = new AbortController()
  controller = requestController
  loading.value = true
  error.value = ''
  try {
    const response = await api.playerSearch(value, props.kind, requestController.signal)
    results.value = responsePlayers(response)
    activeIndex.value = normalizedResults.value.length ? 0 : -1
    open.value = true
  } catch (err) {
    if (err.name !== 'AbortError') {
      results.value = []
      activeIndex.value = -1
      error.value = err.message
      open.value = true
    }
  } finally {
    if (!requestController.signal.aborted) loading.value = false
  }
}

watch(query, value => {
  clearTimeout(debounceTimer)
  controller?.abort()
  error.value = ''
  activeIndex.value = -1
  const trimmed = value.trim()
  if (trimmed.length < 2) {
    results.value = []
    loading.value = false
    open.value = false
    return
  }
  loading.value = true
  debounceTimer = setTimeout(() => runSearch(trimmed), 300)
})

function select(player) {
  clearTimeout(blurTimer)
  open.value = false
  query.value = ''
  results.value = []
  emit('select', player)
}

function onKeydown(event) {
  if (event.key === 'Escape') {
    open.value = false
    return
  }
  if (!open.value || !normalizedResults.value.length) return
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % normalizedResults.value.length
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value - 1 + normalizedResults.value.length) % normalizedResults.value.length
  } else if (event.key === 'Enter' && activeIndex.value >= 0) {
    event.preventDefault()
    select(normalizedResults.value[activeIndex.value])
  }
}

function onBlur() {
  blurTimer = setTimeout(() => { open.value = false }, 150)
}

onBeforeUnmount(() => {
  clearTimeout(debounceTimer)
  clearTimeout(blurTimer)
  controller?.abort()
})
</script>

<template>
  <div class="relative">
    <label :for="inputId" class="mb-2 block text-sm font-semibold text-[#eef0e9]">{{ label }}</label>
    <div class="flex items-center gap-3 rounded-xl border border-white/12 bg-black/35 px-4 py-3 transition focus-within:border-[#d946ff]/70 focus-within:ring-2 focus-within:ring-[#d946ff]/15">
      <Search :size="19" class="shrink-0 text-[#ea73ff]" aria-hidden="true" />
      <input
        :id="inputId"
        v-model="query"
        type="search"
        autocomplete="off"
        :placeholder="placeholder"
        class="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#758079]"
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="open"
        :aria-controls="listboxId"
        :aria-activedescendant="activeId"
        :aria-describedby="`${inputId}-status`"
        @focus="open = query.trim().length >= 2"
        @blur="onBlur"
        @keydown="onKeydown"
      />
      <span v-if="loading" class="size-4 shrink-0 animate-spin rounded-full border-2 border-white/15 border-t-[#58a6ff]" aria-hidden="true"></span>
    </div>

    <p :id="`${inputId}-status`" class="mt-2 min-h-5 text-xs" :class="error ? 'text-[#e9a293]' : 'muted'" aria-live="polite">
      {{ status }}
    </p>

    <div
      v-if="open && !loading"
      :id="listboxId"
      role="listbox"
      :aria-label="`${label} results`"
      class="glass absolute inset-x-0 top-full z-20 -mt-4 max-h-80 overflow-y-auto rounded-xl p-2"
    >
      <button
        v-for="(player, index) in normalizedResults"
        :id="`${inputId}-option-${index}`"
        :key="accountId(player)"
        type="button"
        role="option"
        :aria-selected="activeIndex === index"
        class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition"
        :class="activeIndex === index ? 'bg-[#58a6ff]/12 ring-1 ring-[#58a6ff]/35' : 'hover:bg-white/[.06]'"
        @mouseenter="activeIndex = index"
        @pointerdown.prevent="select(player)"
      >
        <img v-if="imageUrl(avatar(player))" :src="imageUrl(avatar(player))" :alt="playerName(player)" class="size-10 rounded-lg object-cover" />
        <span v-else class="grid size-10 shrink-0 place-items-center rounded-lg bg-white/[.06] text-[#9ba7a0]">
          <UserRound :size="19" aria-hidden="true" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-sm font-semibold text-[#f2f1eb]">{{ playerName(player) }}</span>
          <span class="mt-0.5 block truncate text-xs muted">
            Account {{ accountId(player) }}<template v-if="teamName(player)"> · {{ teamName(player) }}</template>
          </span>
        </span>
        <span v-if="kind === 'pro' || player.isPro || player.pro" class="comparison-pill shrink-0">Pro</span>
      </button>
      <p v-if="!normalizedResults.length && !error" class="px-3 py-5 text-center text-sm muted">No matching players found.</p>
      <p v-if="error" class="px-3 py-5 text-center text-sm text-[#e9a293]">{{ error }}</p>
    </div>
  </div>
</template>
