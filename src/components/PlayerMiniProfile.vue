<script setup>
import { ArrowUpRight, RefreshCw, UserRound, X } from '@lucide/vue'
import { imageUrl } from '../lib/dota.js'

defineProps({
  player: { type: Object, default: null },
  label: { type: String, default: 'Selected player' },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  removable: { type: Boolean, default: true },
  pro: { type: Boolean, default: false },
})

defineEmits(['remove', 'retry'])

const accountId = player => player?.accountId ?? player?.account_id ?? player?.id
const playerName = player => player?.personaName || player?.personaname || player?.name || 'Unknown player'
const avatar = player => player?.avatarImageFull || player?.avatarFull || player?.avatarfull || player?.avatar || ''
const profileUrl = player => player?.profileURL || player?.profileUrl || player?.profileurl || ''
const teamName = player => player?.teamName || player?.team?.name || player?.team_name || ''
</script>

<template>
  <article class="panel relative min-h-32 rounded-2xl p-5">
    <div v-if="loading" class="flex min-h-22 items-center gap-4" role="status">
      <span class="size-12 animate-pulse rounded-xl bg-white/[.06]"></span>
      <span class="space-y-2">
        <span class="block h-3 w-24 animate-pulse rounded bg-white/[.06]"></span>
        <span class="block h-5 w-40 animate-pulse rounded bg-white/[.08]"></span>
      </span>
      <span class="sr-only">Loading selected player profile…</span>
    </div>

    <div v-else-if="error" class="flex min-h-22 items-center justify-between gap-4">
      <div>
        <p class="eyebrow">Profile unavailable</p>
        <p class="mt-2 text-sm text-[#e9a293]">{{ error }}</p>
      </div>
      <div class="flex shrink-0 flex-wrap justify-end gap-2">
        <button type="button" class="ghost-button text-xs" @click="$emit('retry')">
          <RefreshCw :size="14" aria-hidden="true" /> Retry
        </button>
        <button v-if="removable" type="button" class="ghost-button text-xs" @click="$emit('remove')">Change</button>
      </div>
    </div>

    <div v-else-if="player" class="flex items-center gap-4">
      <img v-if="imageUrl(avatar(player))" :src="imageUrl(avatar(player))" :alt="playerName(player)" class="size-16 rounded-xl object-cover" />
      <span v-else class="grid size-16 shrink-0 place-items-center rounded-xl bg-[#d946ff]/10 text-[#d946ff]">
        <UserRound :size="28" aria-hidden="true" />
      </span>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <p class="eyebrow text-[.6rem]">{{ label }}</p>
          <span v-if="pro" class="comparison-pill">Pro</span>
        </div>
        <h2 class="display-font mt-1 truncate text-2xl">{{ playerName(player) }}</h2>
        <p class="mt-1 truncate text-xs muted">
          Account {{ accountId(player) }}<template v-if="teamName(player)"> · {{ teamName(player) }}</template>
        </p>
        <p v-if="player.rankTier != null || player.leaderboardRank != null" class="mt-1 text-[.68rem] text-[#9cc8ff]">
          <template v-if="player.rankTier != null">Rank tier {{ player.rankTier }}</template><template v-if="player.rankTier != null && player.leaderboardRank != null"> · </template><template v-if="player.leaderboardRank != null">Leaderboard #{{ player.leaderboardRank }}</template>
        </p>
        <a
          v-if="profileUrl(player).startsWith('https://')"
          :href="profileUrl(player)"
          target="_blank"
          rel="noopener noreferrer"
          class="mt-2 inline-flex items-center gap-1 text-xs text-[#c7dfff] hover:text-[#58a6ff]"
        >
          Steam profile <ArrowUpRight :size="13" aria-hidden="true" />
        </a>
      </div>
      <button
        v-if="removable"
        type="button"
        class="grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 text-[#aeb7b1] transition hover:border-white/25 hover:text-white"
        :aria-label="`Change ${label.toLowerCase()}`"
        @click="$emit('remove')"
      >
        <X :size="17" aria-hidden="true" />
      </button>
    </div>
  </article>
</template>
