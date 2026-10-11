<script setup>
import HeroPortrait from './HeroPortrait.vue'
import {compact, displayName} from '../lib/dota.js'

defineProps({player: {type: Object, required: true}, rank: {type: Number, required: true}})
</script>

<template>
  <div class="panel flex items-center gap-4 rounded-xl p-4">
    <span class="display-font w-7 text-2xl text-[#70e2a1]">0{{ rank }}</span>
    <HeroPortrait :hero="player.hero"/>
    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-semibold text-[#eeeae0]">{{ displayName(player) }}</p>
      <p class="truncate text-xs muted">{{ player.hero?.localizedName || 'Unknown hero' }}</p>
    </div>
    <div class="text-right">
      <p class="text-xs font-semibold text-[#70e2a1]">{{ compact(player.heroHeal ?? player.heroHealing) }} healing</p>
      <p class="text-[.65rem] muted">{{ Number(player.stuns || 0).toFixed(1) }}s stuns · {{ player.obsPlaced || 0 }} wards · {{ player.senPlaced || 0 }} sentries</p>
    </div>
  </div>
</template>
