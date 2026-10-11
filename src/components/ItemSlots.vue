<script setup>
import {imageUrl} from '../lib/dota.js'

defineProps({items: {type: Array, default: () => []}})
</script>

<template>
  <div class="flex flex-wrap gap-1" aria-label="Player items">
    <div v-for="index in 6" :key="index"
         class="grid h-9 w-10 place-items-center overflow-hidden rounded border border-white/10 bg-[#000000]"
         :title="items[index - 1]?.name || 'Empty slot'">
      <img v-if="imageUrl(items[index - 1]?.image)" :src="imageUrl(items[index - 1].image)"
           :alt="items[index - 1].name || 'Item'" class="h-full w-full object-cover" loading="lazy"/>
      <span v-else class="text-xs text-white/20">·</span>
    </div>
  </div>
</template>
