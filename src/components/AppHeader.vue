<script setup>
import { ref } from 'vue'
import { Menu, X, ArrowUpRight, Swords } from '@lucide/vue'

const open = ref(false)
const links = [
  { to: '/heroes', label: 'Heroes' },
  { to: '/players', label: 'Pro players' },
  { to: '/tournaments', label: 'Tournaments' },
]
</script>

<template>
  <header class="absolute inset-x-0 top-0 z-30 border-b border-[#d946ff]/20 bg-black">
    <div class="site-container flex h-[76px] items-center justify-between gap-5">
      <RouterLink to="/" class="group flex shrink-0 items-center gap-3" @click="open = false" aria-label="Aghs Labs home">
        <span class="flex size-10 items-center justify-center rounded-lg border border-[#d946ff]/45 bg-[#d946ff]/10 text-[#d946ff] shadow-[0_0_25px_rgba(217,70,255,.2)]"><Swords :size="21" :stroke-width="1.5" /></span>
        <span class="display-font text-[1.4rem] leading-none tracking-[.04em] text-[#eee9d8]">AGHS <span class="text-[#d946ff]">LABS</span><small class="mt-1 block font-sans text-[.48rem] font-bold tracking-[.32em] text-[#aab4ad]">DOTA 2 INTELLIGENCE</small></span>
      </RouterLink>
      <nav class="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
        <RouterLink v-for="link in links" :key="link.to" :to="link.to" class="border-b-2 border-transparent py-2 text-[.82rem] font-semibold text-[#cbd2cb] transition hover:text-[#d946ff]" active-class="!border-[#d946ff] !text-[#d946ff]">{{ link.label }}</RouterLink>
      </nav>
      <RouterLink to="/" class="hidden items-center gap-2 rounded-lg border border-[#d946ff]/40 px-4 py-2 text-xs font-bold uppercase tracking-[.13em] text-[#d946ff] transition hover:bg-[#d946ff]/10 sm:flex">Find a match <ArrowUpRight :size="15" /></RouterLink>
      <button class="rounded-lg border border-white/20 p-2 text-[#e9e5d8] lg:hidden" type="button" :aria-label="open ? 'Close menu' : 'Open menu'" :aria-expanded="open" @click="open = !open"><X v-if="open" :size="20" /><Menu v-else :size="20" /></button>
    </div>
    <nav v-if="open" class="glass site-container mb-3 grid rounded-xl p-2 lg:hidden" aria-label="Mobile navigation">
      <RouterLink v-for="link in links" :key="link.to" :to="link.to" class="rounded-lg px-4 py-3 text-sm text-[#e6e9df] hover:bg-white/10" @click="open = false">{{ link.label }}</RouterLink>
      <RouterLink to="/" class="rounded-lg px-4 py-3 text-sm text-[#d946ff] hover:bg-white/10" @click="open = false">Find a match</RouterLink>
    </nav>
  </header>
</template>
