<script setup>
import MatchSearch from '../components/MatchSearch.vue'
import LiveMatches from '../components/LiveMatches.vue'
import {ArrowDown, Crosshair, Shield, Trophy} from '@lucide/vue'
</script>

<template>
  <main>
    <section class="home-scene relative flex min-h-[68svh] items-center justify-center pt-19 sm:min-h-[70svh]">
      <div class="site-container relative z-10 mx-auto flex flex-col items-center pb-12 pt-10 text-center sm:pb-8">
        <div
            class="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d946ff]/40 bg-black px-4 py-2 text-[.65rem] font-bold uppercase tracking-[.2em] text-[#d946ff]">
          <span class="size-1.5 rounded-full bg-[#d946ff] shadow-[0_0_12px_#d946ff]"></span> The battlefield, decoded
        </div>
        <h1 class="display-font max-w-217.5 text-[clamp(2.8rem,6.2vw,5.6rem)] leading-[.98] tracking-[-.045em] text-[#f6f1e5] [text-shadow:0_4px_30px_rgba(0,0,0,.8)]">
          Every match has <span class="text-[#d946ff]">a story.</span></h1>
        <p class="mt-4 max-w-xl text-sm leading-7 text-[#d9ddd4] [text-shadow:0_2px_12px_#000] sm:text-base">Search any
          Dota 2 match to see the plays, players, and numbers behind the final throne.</p>
        <div class="mt-7 w-full max-w-190">
          <MatchSearch/>
        </div>
        <div
            class="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[.69rem] font-bold uppercase tracking-[.15em] text-[#d4ddd3] sm:gap-x-12">
          <span class="flex items-center gap-2"><Crosshair :size="16"
                                                           class="text-[#d946ff]"/> Match breakdowns</span><span
            class="flex items-center gap-2"><Shield :size="16" class="text-[#d946ff]"/> Hero builds</span><span
            class="flex items-center gap-2"><Trophy :size="16" class="text-[#d946ff]"/> Performance picks</span></div>
      </div>
      <a href="#explore" class="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[#e5ddc8]"
         aria-label="Scroll to explore">
        <ArrowDown :size="19"/>
      </a>
    </section>
    <LiveMatches />
    <section id="explore" class="relative border-t border-white/10 bg-[#151515] py-20">
      <div class="site-container">
        <div class="mb-9 flex flex-wrap items-end justify-between gap-5">
          <div><p class="eyebrow">Beyond the scoreboard</p>
            <h2 class="display-font mt-2 text-3xl sm:text-4xl">Know more. Play better.</h2></div>
          <p class="max-w-md text-sm leading-7 muted">Go from a match ID to a clear view of every hero, item build, and
            standout performance.</p></div>
        <div class="grid gap-4 md:grid-cols-2">
          <RouterLink to="/heroes" class="panel group rounded-2xl p-7 transition hover:border-[#d946ff]/60">
            <Shield :size="25" class="mb-8 text-[#d946ff]"/>
            <p class="eyebrow">01 / Heroes</p>
            <h3 class="display-font mt-2 text-2xl">Explore the roster</h3>
            <p class="mt-3 text-sm leading-6 muted">Find heroes by name, role, and primary attribute.</p><span
              class="mt-8 inline-block text-sm text-[#d946ff] group-hover:translate-x-1 transition">View heroes →</span>
          </RouterLink>
          <RouterLink to="/players" class="panel group rounded-2xl p-7 transition hover:border-[#d946ff]/60">
            <Trophy :size="25" class="mb-8 text-[#d946ff]"/>
            <p class="eyebrow">02 / Players</p>
            <h3 class="display-font mt-2 text-2xl">Compare with a pro</h3>
            <p class="mt-3 text-sm leading-6 muted">Pair your recent matches with a professional player’s closest scenarios.</p><span
              class="mt-8 inline-block text-sm text-[#d946ff] group-hover:translate-x-1 transition">Compare players →</span>
          </RouterLink>
        </div>
      </div>
    </section>
    <footer class="border-t border-white/10 bg-[#151515] py-6">
      <div class="site-container flex flex-wrap justify-between gap-3 text-xs muted"><span>AGHS LABS · DOTA 2 INTELLIGENCE</span><span>Match data powered by the Aghs Labs API</span>
      </div>
    </footer>
  </main>
</template>
