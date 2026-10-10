<script setup>
import { computed, onMounted, ref } from 'vue'
import { Search, RefreshCw } from '@lucide/vue'
import { api } from '../lib/api.js'
import HeroPortrait from '../components/HeroPortrait.vue'
import SectionHeader from '../components/SectionHeader.vue'

const heroes = ref([])
const query = ref('')
const attribute = ref('any')
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try { heroes.value = await api.heroes() }
  catch (err) { error.value = err.message }
  finally { loading.value = false }
}
onMounted(load)

const filtered = computed(() => heroes.value.filter((hero) => {
  const nameMatch = (hero.localizedName || hero.name || '').toLowerCase().includes(query.value.toLowerCase())
  const attrMatch = attribute.value === 'any' || hero.primaryAttribute === attribute.value
  return nameMatch && attrMatch
}).sort((a, b) => (a.localizedName || '').localeCompare(b.localizedName || '')))
const attributes = [{ value: 'any', label: 'All heroes' }, { value: 'str', label: 'Strength' }, { value: 'agi', label: 'Agility' }, { value: 'int', label: 'Intelligence' }, { value: 'all', label: 'Universal' }]
</script>

<template>
  <main class="subtle-grid min-h-screen pt-[125px] pb-20"><div class="site-container"><SectionHeader kicker="Know your heroes" title="The hero roster" description="Explore the heroes available through the Aghs Labs API. Search by name or narrow the roster by primary attribute." />
    <div class="panel mb-6 flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between"><label class="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-white/10 bg-black/30 px-4 py-3 sm:max-w-md"><Search :size="18" class="gold" /><input v-model="query" type="search" placeholder="Search heroes..." class="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#87928a]" /></label><div class="flex flex-wrap gap-2"><button v-for="option in attributes" :key="option.value" class="rounded-full border px-3 py-2 text-xs font-semibold transition" :class="attribute === option.value ? 'border-[#d946ff] bg-[#d946ff]/15 text-[#d946ff]' : 'border-white/10 text-[#aeb9af] hover:border-white/30'" type="button" @click="attribute = option.value">{{ option.label }}</button></div></div>
    <div v-if="loading" class="py-20 text-center text-sm muted">Loading hero roster...</div><div v-else-if="error" class="glass rounded-xl p-8 text-center"><p>{{ error }}</p><button class="ghost-button mt-5 text-xs" @click="load"><RefreshCw :size="15" /> Retry</button></div><template v-else><p class="mb-4 text-xs muted">{{ filtered.length }} heroes</p><div v-if="filtered.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"><div v-for="hero in filtered" :key="hero.id" class="panel flex items-center gap-4 rounded-xl p-3.5 transition hover:border-[#d946ff]/35"><HeroPortrait :hero="hero" size="large" /><div class="min-w-0"><h2 class="truncate text-sm font-bold text-[#f0eee5]">{{ hero.localizedName }}</h2><p class="mt-1 text-xs capitalize muted">{{ hero.primaryAttribute === 'str' ? 'Strength' : hero.primaryAttribute === 'agi' ? 'Agility' : hero.primaryAttribute === 'int' ? 'Intelligence' : 'Universal' }}</p><p class="mt-1 truncate text-[.65rem] text-[#d946ff]">{{ (hero.roles || []).map(role => role.description).filter(Boolean).join(' · ') || hero.attackType || 'Hero' }}</p></div></div></div><div v-else class="panel rounded-xl p-10 text-center text-sm muted">No heroes match your search.</div></template>
  </div></main>
</template>
