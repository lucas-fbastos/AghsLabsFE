<script setup>
import HeroPortrait from './HeroPortrait.vue'
import {RouterLink} from 'vue-router'
import {PhCoins} from '@phosphor-icons/vue'
import {compact, displayName} from '../lib/dota.js'

defineProps({player: {type: Object, required: true}, rank: {type: Number, required: true}})
const playerProfilePath = accountId => accountId ? `/players/${accountId}` : undefined
</script>

<template>
  <component :is="player.accountId ? RouterLink : 'div'" :to="playerProfilePath(player.accountId)"
             class="panel flex items-center gap-4 rounded-xl p-4 transition"
             :class="player.accountId ? 'hover:border-[#d946ff]/60' : ''"><span
      class="display-font w-7 text-2xl text-[#d946ff]">0{{ rank }}</span>
    <HeroPortrait :hero="player.hero"/>
    <div class="min-w-0 flex-1"><p class="truncate text-lg font-semibold text-[#eeeae0]">{{ displayName(player) }}</p>
      <p class="truncate text-base muted">{{ player.hero?.localizedName || 'Unknown hero' }}</p></div>
    <div class="text-right"><p class="text-lg font-semibold text-[#d946ff]">{{
        player.kills ?? 0
      }}/{{ player.deaths ?? 0 }}/{{ player.assists ?? 0 }}</p>
      <p class="text-sm muted">{{ compact(player.heroDamage) }} damage</p>
      <p class="flex items-center justify-end gap-1 text-sm text-[#f5c84c]">
        {{ compact(player.netWorth ?? ((player.gold || 0) + (player.goldSpent || 0))) }}
        <PhCoins :size="16"/>
        <span class="muted">net worth</span></p></div>
  </component>
</template>
