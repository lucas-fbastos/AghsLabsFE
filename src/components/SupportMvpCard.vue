<script setup>
import HeroPortrait from './HeroPortrait.vue'
import {RouterLink} from 'vue-router'
import {compact, displayName} from '../lib/dota.js'

defineProps({player: {type: Object, required: true}, rank: {type: Number, required: true}})
const playerProfilePath = accountId => accountId ? `/players/${accountId}` : undefined
const primaryStat = player => {
  const healing = player.heroHeal ?? player.heroHealing ?? 0
  return healing > 0
    ? {value: compact(healing), label: 'healing'}
    : {value: `${Number(player.stuns || 0).toFixed(1)}s`, label: 'stuns'}
}
</script>

<template>
  <component :is="player.accountId ? RouterLink : 'div'" :to="playerProfilePath(player.accountId)"
             class="panel flex items-center gap-4 rounded-xl p-4 transition"
             :class="player.accountId ? 'hover:border-[#70e2a1]/60' : ''">
    <span class="display-font w-7 text-2xl text-[#70e2a1]">0{{ rank }}</span>
    <HeroPortrait :hero="player.hero"/>
    <div class="min-w-0 flex-1">
      <p class="truncate text-lg font-semibold text-[#eeeae0]">{{ displayName(player) }}</p>
      <p class="truncate text-base muted">{{ player.hero?.localizedName || 'Unknown hero' }}</p>
    </div>
    <div class="text-right">
      <p class="text-base font-semibold text-[#70e2a1]">{{ primaryStat(player).value }} {{ primaryStat(player).label }}</p>
      <p class="text-sm muted">{{ Number(player.stuns || 0).toFixed(1) }}s stuns · {{ player.obsPlaced || 0 }} wards · {{ player.senPlaced || 0 }} sentries</p>
    </div>
  </component>
</template>
