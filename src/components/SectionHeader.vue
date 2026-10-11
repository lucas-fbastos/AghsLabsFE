<script setup>
defineProps({kicker: String, title: String, description: String})
</script>

<template>
  <div class="mb-8">
    <p class="eyebrow mb-3">{{ kicker }}</p>
    <h1 class="display-font text-4xl text-[#f4f1e7] sm:text-5xl">{{ title }}</h1>
    <p v-if="description" class="mt-3 max-w-2xl text-sm leading-7 muted">{{ description }}</p>
  </div>
</template>
