<script setup>
import { computed } from 'vue'
import { PhCoins } from '@phosphor-icons/vue'
import HeroPortrait from './HeroPortrait.vue'
import ItemSlots from './ItemSlots.vue'
import { compact, displayName, number } from '../lib/dota.js'

const props = defineProps({
  players: { type: Array, default: () => [] },
  side: { type: String, required: true },
  name: { type: String, default: '' },
})

const totals = computed(() => props.players.reduce((result, player) => ({
  kills: result.kills + (player.kills || 0),
  deaths: result.deaths + (player.deaths || 0),
  assists: result.assists + (player.assists || 0),
  heroDamage: result.heroDamage + (player.heroDamage || 0),
  netWorth: result.netWorth + (player.netWorth || 0),
}), { kills: 0, deaths: 0, assists: 0, heroDamage: 0, netWorth: 0 }))
</script>

<template>
  <section class="panel overflow-hidden rounded-2xl">
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5 sm:px-7">
      <div class="flex items-center gap-3">
        <div class="min-w-0">
          <h2
            class="display-font truncate text-3xl sm:text-4xl"
            :class="side === 'Radiant' ? 'radiant-text' : 'dire-text'"
          >
            {{ name || side }}
          </h2>
          <p
            v-if="name"
            class="eyebrow mt-1 text-[.6rem]"
            :class="side === 'Radiant' ? 'radiant-text' : 'dire-text'"
          >
            {{ side }}
          </p>
        </div>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full min-w-[860px] text-left text-base">
        <thead class="bg-white/[.035] text-[.63rem] font-bold uppercase tracking-[.16em] text-[#88958d]">
          <tr>
            <th class="px-6 py-4 font-semibold">Hero / Player</th>
            <th class="px-2 py-4 text-center font-semibold">K / D / A</th>
            <th class="px-2 py-4 text-right font-semibold">LH / DN</th>
            <th class="px-2 py-4 text-right font-semibold">GPM / XPM</th>
            <th class="px-2 py-4 text-right font-semibold">Damage</th>
            <th class="px-2 py-4 text-right font-semibold">Net Worth</th>
            <th class="px-3 py-4 font-semibold">Items</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(player, index) in players"
            :key="`${player.hero?.id || 'hero'}-${index}`"
            class="border-t border-white/[.06] transition hover:bg-white/[.035]"
          >
            <td class="px-6 py-3">
              <div class="flex items-center gap-3">
                <HeroPortrait :hero="player.hero" />
                <div class="min-w-0">
                  <p class="truncate text-lg font-semibold text-[#f1f0e9]">
                    {{ displayName(player) }}
                  </p>
                  <p class="mt-0.5 truncate text-base text-[#9cac9d]">
                    {{ player.hero?.localizedName || 'Unknown hero' }}
                    <span v-if="player.level">· Lvl {{ player.level }}</span>
                  </p>
                </div>
              </div>
            </td>
            <td class="px-2 py-3 text-center text-lg font-semibold whitespace-nowrap">
              <span class="text-[#d946ff]">{{ player.kills ?? '—' }}</span>
              <span class="mx-1.5 text-white/25">/</span>
              <span class="text-[#ea73ff]">{{ player.deaths ?? '—' }}</span>
              <span class="mx-1.5 text-white/25">/</span>
              <span class="text-[#d4d8d0]">{{ player.assists ?? '—' }}</span>
            </td>
            <td class="px-2 py-3 text-right whitespace-nowrap text-[#b8c3bb]">
              {{ number(player.lastHits) }} / {{ number(player.denies) }}
            </td>
            <td class="px-2 py-3 text-right whitespace-nowrap text-[#b8c3bb]">
              {{ number(player.goldPerMin) }} / {{ number(player.xpPerMin) }}
            </td>
            <td class="px-2 py-3 text-right font-medium text-[#ea73ff]">
              {{ compact(player.heroDamage) }}
            </td>
            <td class="px-2 py-3 text-right">
              <span class="inline-flex items-center justify-end gap-1 text-[#f5c84c]">
                {{ compact(player.netWorth) }}
                <PhCoins :size="16" />
              </span>
            </td>
            <td class="px-3 py-3">
              <ItemSlots :items="player.items" />
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="border-t border-white/10 bg-white/[.035] text-sm font-semibold text-[#d7dbce]">
            <td class="px-6 py-4 uppercase tracking-[.12em]">Team total</td>
            <td class="px-2 py-4 text-center">
              {{ totals.kills }} / {{ totals.deaths }} / {{ totals.assists }}
            </td>
            <td></td>
            <td></td>
            <td class="px-2 py-4 text-right">{{ compact(totals.heroDamage) }}</td>
            <td class="px-2 py-4 text-right">
              <span class="inline-flex items-center justify-end gap-1 text-[#f5c84c]">
                {{ compact(totals.netWorth) }}
                <PhCoins :size="16" />
              </span>
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </section>
</template>
