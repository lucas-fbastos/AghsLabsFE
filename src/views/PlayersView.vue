<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Scale, Sparkles } from '@lucide/vue'
import { api } from '../lib/api.js'
import PlayerMiniProfile from '../components/PlayerMiniProfile.vue'
import PlayerSearchCombobox from '../components/PlayerSearchCombobox.vue'
import SectionHeader from '../components/SectionHeader.vue'

const STORAGE_KEY = 'aghs-labs:last-comparison-player'
const router = useRouter()
const leftPlayer = ref(null)
const rightPlayer = ref(null)
const leftSeed = ref(null)
const rightSeed = ref(null)
const leftLoading = ref(false)
const rightLoading = ref(false)
const leftError = ref('')
const rightError = ref('')
const selectionError = ref('')
let leftController
let rightController

const accountId = player => player?.accountId ?? player?.account_id ?? player?.id
const canCompare = computed(() => {
  const leftId = accountId(leftPlayer.value)
  const rightId = accountId(rightPlayer.value)
  return leftId != null && rightId != null && String(leftId) !== String(rightId)
    && !leftLoading.value && !rightLoading.value && !leftError.value && !rightError.value
})

function rememberedPlayer() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    return accountId(value) != null ? value : null
  } catch {
    return null
  }
}

function remember(player) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(player))
  } catch {
    // Selection still works when storage is unavailable or full.
  }
}

async function resolvePlayer(side, seed) {
  const id = accountId(seed)
  if (id == null) return

  const isLeft = side === 'left'
  const otherId = accountId(isLeft ? rightPlayer.value : leftPlayer.value)
  if (otherId != null && String(id) === String(otherId)) {
    selectionError.value = 'Choose two different accounts to compare.'
    return
  }

  selectionError.value = ''
  const oldController = isLeft ? leftController : rightController
  oldController?.abort()
  const requestController = new AbortController()
  if (isLeft) {
    leftController = requestController
    leftSeed.value = seed
    leftPlayer.value = seed
    leftLoading.value = true
    leftError.value = ''
  } else {
    rightController = requestController
    rightSeed.value = seed
    rightPlayer.value = seed
    rightLoading.value = true
    rightError.value = ''
  }

  try {
    const profile = await api.player(id, requestController.signal)
    const resolved = { ...seed, ...profile }
    if (isLeft) {
      leftPlayer.value = resolved
      remember(resolved)
    } else {
      rightPlayer.value = resolved
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      if (isLeft) leftError.value = err.message
      else rightError.value = err.message
    }
  } finally {
    if (!requestController.signal.aborted) {
      if (isLeft) leftLoading.value = false
      else rightLoading.value = false
    }
  }
}

function clearLeft() {
  leftController?.abort()
  rightController?.abort()
  leftPlayer.value = null
  leftSeed.value = null
  leftError.value = ''
  leftLoading.value = false
  rightPlayer.value = null
  rightSeed.value = null
  rightError.value = ''
  rightLoading.value = false
  selectionError.value = ''
}

function clearRight() {
  rightController?.abort()
  rightPlayer.value = null
  rightSeed.value = null
  rightError.value = ''
  rightLoading.value = false
  selectionError.value = ''
}

function compare() {
  if (!canCompare.value) return
  router.push(`/players/compare/${accountId(leftPlayer.value)}/${accountId(rightPlayer.value)}`)
}

onMounted(() => {
  const saved = rememberedPlayer()
  if (saved) resolvePlayer('left', saved)
})

onBeforeUnmount(() => {
  leftController?.abort()
  rightController?.abort()
})
</script>

<template>
  <main class="subtle-grid min-h-screen pt-31.25 pb-20">
    <div class="site-container max-w-5xl">
      <SectionHeader
        kicker="Learn from the best"
        title="Compare your play with a pro"
        description="Choose your account, pick a professional player, then compare recent hero choices and the closest match scenarios side by side."
      />

      <section class="comparison-selection rounded-3xl border border-white/10 bg-black/25 p-5 sm:p-8" aria-labelledby="comparison-setup-title">
        <div class="mb-8 flex items-center gap-3">
          <span class="grid size-11 place-items-center rounded-xl border border-[#58a6ff]/35 bg-[#58a6ff]/10 text-[#58a6ff]">
            <Scale :size="22" aria-hidden="true" />
          </span>
          <div>
            <p class="eyebrow comparison-blue">Comparison setup</p>
            <h2 id="comparison-setup-title" class="display-font mt-1 text-2xl">Pick both players</h2>
          </div>
        </div>

        <div class="grid gap-7">
          <div>
            <div class="mb-3 flex items-center gap-3">
              <span class="comparison-step" aria-hidden="true">1</span>
              <div>
                <h3 class="text-sm font-bold text-[#eff2ec]">Choose your player</h3>
                <p class="mt-0.5 text-xs muted">Any public Dota account can be selected.</p>
              </div>
            </div>
            <PlayerMiniProfile
              v-if="leftPlayer"
              :player="leftPlayer"
              label="Your player"
              :loading="leftLoading"
              :error="leftError"
              @remove="clearLeft"
              @retry="resolvePlayer('left', leftSeed)"
            />
            <PlayerSearchCombobox
              v-else
              kind="any"
              label="Find a player"
              hint="Search OpenDota accounts by name or account ID."
              @select="resolvePlayer('left', $event)"
            />
          </div>

          <div v-if="leftPlayer">
            <div class="mb-3 flex items-center gap-3">
              <span class="comparison-step" aria-hidden="true">2</span>
              <div>
                <h3 class="text-sm font-bold text-[#eff2ec]">Choose a pro player</h3>
                <p class="mt-0.5 text-xs muted">The pro directory keeps this side focused on high-level play.</p>
              </div>
            </div>
            <PlayerMiniProfile
              v-if="rightPlayer"
              :player="rightPlayer"
              label="Professional player"
              :loading="rightLoading"
              :error="rightError"
              pro
              @remove="clearRight"
              @retry="resolvePlayer('right', rightSeed)"
            />
            <PlayerSearchCombobox
              v-else
              kind="pro"
              label="Find a professional"
              placeholder="Search professional players"
              hint="Search the Aghs Labs pro-player directory."
              :excluded-id="accountId(leftPlayer)"
              @select="resolvePlayer('right', $event)"
            />
          </div>
          <div v-else class="opacity-45" aria-hidden="true">
            <div class="mb-3 flex items-center gap-3">
              <span class="comparison-step">2</span>
              <div>
                <h3 class="text-sm font-bold text-[#eff2ec]">Choose a pro player</h3>
                <p class="mt-0.5 text-xs muted">Select your player first to unlock this step.</p>
              </div>
            </div>
            <div class="panel min-h-28 rounded-2xl p-5"></div>
          </div>
        </div>

        <p v-if="selectionError" class="mt-5 text-sm text-[#e9a293]" role="alert">{{ selectionError }}</p>

        <div v-if="rightPlayer" class="mt-8 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
          <p class="flex max-w-xl items-start gap-2 text-xs leading-6 muted">
            <Sparkles :size="16" class="mt-1 shrink-0 text-[#58a6ff]" aria-hidden="true" />
            We’ll inspect a 30-match window and show up to 10 complete match pairs—never unmatched filler.
          </p>
          <button class="primary-button shrink-0" type="button" :disabled="!canCompare" @click="compare">
            Compare players <ArrowRight :size="17" aria-hidden="true" />
          </button>
        </div>
      </section>
    </div>
  </main>
</template>
