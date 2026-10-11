<script setup>
import HeroPortrait from './HeroPortrait.vue'
import {compact, displayName} from '../lib/dota.js'

defineProps({player: {type: Object, required: true}, rank: {type: Number, required: true}})
</script>

<template>
  <div class="panel flex items-center gap-4 rounded-xl p-4"><span
      class="display-font w-7 text-2xl text-[#d946ff]">0{{ rank }}</span>
    <HeroPortrait :hero="player.hero"/>
    <div class="min-w-0 flex-1"><p class="truncate text-sm font-semibold text-[#eeeae0]">{{ displayName(player) }}</p>
      <p class="truncate text-xs muted">{{ player.hero?.localizedName || 'Unknown hero' }}</p></div>
    <div class="text-right"><p class="text-sm font-semibold text-[#d946ff]">{{
        player.kills ?? 0
      }}/{{ player.deaths ?? 0 }}/{{ player.assists ?? 0 }}</p>
      <p class="text-[.65rem] muted">{{ compact(player.heroDamage) }} damage</p>
      <p class="text-[.65rem] muted">{{ compact(player.netWorth ?? ((player.gold || 0) + (player.goldSpent || 0))) }} net worth</p></div>
  </div>
</template>
