<script setup>
import {computed, ref} from 'vue'
import {imageUrl} from '../lib/dota.js'

const props = defineProps({hero: {type: Object, default: null}, size: {type: String, default: 'medium'}})
const broken = ref(false)
const src = computed(() => imageUrl(
  typeof props.hero === 'string' ? props.hero : props.hero?.image || props.hero?.icon,
))
</script>

<template>
  <div class="relative shrink-0 overflow-hidden rounded-lg border border-white/15 bg-[#000000]"
       :class="size === 'large'
         ? 'h-16 w-24 sm:h-20 sm:w-32'
         : size === 'small'
           ? 'aspect-[4/3] w-full'
           : 'h-11 w-16'">
    <img v-if="src && !broken" :src="src" :alt="hero?.localizedName || 'Hero'" class="h-full w-full object-cover"
         loading="lazy" @error="broken = true"/>
    <div v-else class="display-font grid h-full w-full place-items-center text-xl text-[#d946ff]">
      {{ hero?.localizedName?.slice(0, 1) || '?' }}
    </div>
  </div>
</template>
