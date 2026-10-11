<script setup>
import {Trophy} from '@lucide/vue'
import SectionHeader from '../components/SectionHeader.vue'
</script>

<template>
  <main class="subtle-grid min-h-screen pt-31.25 pb-20">
    <div class="site-container">
      <SectionHeader kicker="The competitive scene" title="Tournaments"
                     description="A home for tournament stories and competitive results."/>
      <div class="glass flex min-h-80 flex-col items-center justify-center rounded-2xl px-6 py-12 text-center"><span
          class="grid size-16 place-items-center rounded-full border border-[#d946ff]/30 bg-[#d946ff]/10 text-[#ea73ff]"><Trophy
          :size="30"/></span>
        <h2 class="display-font mt-6 text-3xl">Tournament data is coming</h2>
        <p class="mt-3 max-w-md text-sm leading-7 muted">The Aghs Labs API does not expose tournaments yet. When that
          endpoint is available, this page can show live event data.</p>
        <RouterLink to="/" class="primary-button mt-7">Analyze a match</RouterLink>
      </div>
    </div>
  </main>
</template>
