<script setup>
import {PackageOpen} from '@lucide/vue'
import {imageUrl, number} from '../lib/dota.js'

defineProps({items: {type: Array, default: () => []}})

function badgeStyle(count) {
  const prominence = Math.min(count - 2, 10)
  const hue = (286 + prominence * 12.6) % 360
  return {
    fontSize: `${12 + prominence}px`,
    color: `hsl(${hue} 100% 79%)`,
    borderColor: `hsl(${hue} 85% 57% / .7)`,
    backgroundColor: `hsl(${hue} 64% 13%)`,
    boxShadow: `0 0 ${8 + prominence * 2}px hsl(${hue} 90% 55% / .35)`,
  }
}
</script>

<template>
  <section class="mt-12" aria-labelledby="hot-items-title">
    <p class="eyebrow">What showed up most</p>
    <h2 id="hot-items-title" class="display-font mt-1 text-3xl">Hottest items of the match</h2>
    <p class="mt-2 mb-6 text-xs muted">Repeated items across both teams' final inventories, ranked by appearances.</p>
    <div v-if="items.length" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <article v-for="item in items" :key="item.itemId" class="panel relative flex items-center gap-4 rounded-xl p-4">
        <div
            class="grid h-14 w-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-white/15 bg-black/30">
          <img v-if="imageUrl(item.image)" :src="imageUrl(item.image)" :alt="item.name || 'Item'"
               class="h-full w-full object-cover" loading="lazy"/>
          <PackageOpen v-else :size="22" class="muted"/>
        </div>
        <div class="min-w-0 pr-14">
          <h3 class="truncate text-sm font-semibold text-[#eeeae2]">{{ item.name || 'Unknown item' }}</h3>
          <p class="mt-1 text-xs muted">{{ number(item.cost) }} gold</p>
        </div>
        <span class="item-count-pill" :style="badgeStyle(item.count)"
              :aria-label="`${item.count} copies of ${item.name || 'this item'} in this match`">{{ item.count }}x</span>
      </article>
    </div>
    <div v-else class="panel rounded-xl p-8 text-sm muted">No item appears more than once in the final inventories.
    </div>
  </section>
</template>
