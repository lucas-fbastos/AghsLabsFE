<script setup>
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {Search, ArrowRight} from '@lucide/vue'

const router = useRouter()
const matchId = ref('')
const error = ref('')

function submit() {
  const id = matchId.value.trim()
  if (!/^\d+$/.test(id)) {
    error.value = 'Enter a numeric Dota 2 match ID.'
    return
  }
  error.value = ''
  router.push(`/matches/${id}`)
}
</script>

<template>
  <form class="w-full" @submit.prevent="submit" novalidate>
    <label class="sr-only" for="match-id">Dota 2 match ID</label>
    <div
        class="flex items-center gap-3 rounded-full border border-[#d946ff]/45 bg-black p-2 pl-5 shadow-[0_16px_70px_rgba(0,0,0,.6),0_0_60px_rgba(217,70,255,.18)]">
      <Search :size="22" class="shrink-0 text-[#d946ff]"/>
      <input id="match-id" v-model="matchId" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off"
             placeholder="Enter a match ID to uncover the story..."
             class="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-[#a5aaa5] sm:text-base"
             aria-describedby="match-search-hint" @input="error = ''"/>
      <button type="submit"
              class="flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#d946ff] px-5 py-3 text-sm font-bold text-[#121713] transition hover:bg-[#d946ff] sm:px-7">
        Analyze <span class="hidden sm:inline">match</span>
        <ArrowRight :size="17"/>
      </button>
    </div>
    <p id="match-search-hint" class="mt-3 min-h-5 text-center text-xs"
       :class="error ? 'text-[#f2a59a]' : 'text-[#c6ccc1]'">{{ error || 'Paste a Dota 2 match ID and press Enter' }}</p>
  </form>
</template>
