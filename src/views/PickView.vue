<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { usePlayersStore } from '@/stores/players'
import { useStandingsStore } from '@/stores/standings'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/AppLayout.vue'
import PlayerTable from '@/components/PlayerTable.vue'
import PlayerFilters from '@/components/PlayerFilters.vue'
import PickConfirmModal from '@/components/PickConfirmModal.vue'
import type { Player } from '@/types'
import { CheckCircle, AlertCircle, Lock } from 'lucide-vue-next'

const playersStore = usePlayersStore()
const standingsStore = useStandingsStore()
const authStore = useAuthStore()

const selectedPlayer = ref<Player | null>(null)
const showConfirmModal = ref(false)
const pickSuccess = ref(false)
const pickError = ref<string | null>(null)

const currentGW = computed(() => playersStore.currentGameweek?.number ?? null)
const isDeadlinePassed = computed(() => playersStore.currentGameweek?.isDeadlinePassed ?? false)
const hasPicked = computed(() => standingsStore.myCurrentPick !== null)
const currentPick = computed(() => standingsStore.myCurrentPick)
const pickingDisabled = computed(() => hasPicked.value || isDeadlinePassed.value || currentGW.value === null)

onMounted(async () => {
  authStore.initAuth()
  await playersStore.fetchCurrentGameweek()
  await Promise.all([
    playersStore.fetchPlayers(),
    playersStore.fetchTeams(),
    standingsStore.fetchMyCurrentPick()
  ])
})

function handleSelectPlayer(player: Player) {
  if (pickingDisabled.value) return
  selectedPlayer.value = player
  showConfirmModal.value = true
}

async function confirmPick() {
  if (!selectedPlayer.value || currentGW.value === null) return

  showConfirmModal.value = false

  try {
    await standingsStore.makePick(selectedPlayer.value, currentGW.value)
    pickSuccess.value = true
    setTimeout(() => pickSuccess.value = false, 3000)
  }
  catch (err: any) {
    pickError.value = err.response?.data?.message ?? 'Failed to submit your pick'
    setTimeout(() => pickError.value = null, 3000)
  }
  finally {
    selectedPlayer.value = null
  }
}

function cancelPick() {
  showConfirmModal.value = false
  selectedPlayer.value = null
}
</script>

<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-4 sm:mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">Pick Your Differential</h1>
            <p v-if="currentGW !== null" class="text-sm sm:text-base text-slate-400">
              Gameweek {{ currentGW }} - Select one player with &lt;5% ownership
            </p>
            <p v-else class="text-sm sm:text-base text-slate-400">
              No active gameweek yet — check back soon
            </p>
          </div>

          <!-- Current Pick Status -->
          <div v-if="hasPicked && currentPick" class="bg-primary-500/20 border border-primary-500/30 rounded-xl px-3 sm:px-4 py-2 sm:py-3">
            <div class="flex items-center gap-2 text-primary-400 text-sm sm:text-base">
              <CheckCircle class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span class="font-medium">Your pick: {{ currentPick.playerName }}</span>
            </div>
          </div>

          <!-- Picks Closed, Never Picked -->
          <div v-else-if="isDeadlinePassed" class="bg-slate-700/50 border border-slate-600 rounded-xl px-3 sm:px-4 py-2 sm:py-3">
            <div class="flex items-center gap-2 text-slate-300 text-sm sm:text-base">
              <Lock class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span class="font-medium">Picks are closed for this gameweek</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="pickSuccess" class="mb-4 sm:mb-6 bg-primary-500/20 border border-primary-500/30 rounded-xl px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 text-primary-400 text-sm sm:text-base">
          <CheckCircle class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span>Pick confirmed! Good luck this gameweek.</span>
        </div>
        <div v-else-if="pickError" class="mb-4 sm:mb-6 bg-red-500/20 border border-red-500/30 rounded-xl px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 text-red-400 text-sm sm:text-base">
          <AlertCircle class="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span>{{ pickError }}</span>
        </div>
      </Transition>

      <!-- Filters -->
      <PlayerFilters class="mb-4 sm:mb-6" />

      <!-- Loading State -->
      <div v-if="playersStore.loading" class="flex items-center justify-center py-16 sm:py-20">
        <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="playersStore.error" class="bg-red-500/20 border border-red-500/30 rounded-xl p-4 sm:p-6 text-center">
        <AlertCircle class="w-10 h-10 sm:w-12 sm:h-12 text-red-400 mx-auto mb-3 sm:mb-4" />
        <h3 class="text-lg sm:text-xl font-semibold text-white mb-2">Failed to load players</h3>
        <p class="text-sm sm:text-base text-slate-400 mb-4">{{ playersStore.error }}</p>
        <button
          @click="playersStore.fetchPlayers"
          class="bg-primary-500 hover:bg-primary-600 text-white font-medium px-5 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base"
        >
          Try Again
        </button>
      </div>

      <!-- Players Table -->
      <PlayerTable
        v-else
        :players="playersStore.filteredPlayers"
        :disabled="pickingDisabled"
        @select="handleSelectPlayer"
      />

      <!-- Results Count -->
      <div v-if="!playersStore.loading && !playersStore.error" class="mt-3 sm:mt-4 text-slate-400 text-xs sm:text-sm">
        Showing {{ playersStore.filteredPlayers.length }} players
      </div>
    </div>

    <!-- Confirm Modal -->
    <PickConfirmModal
      v-if="showConfirmModal && selectedPlayer && currentGW !== null"
      :player="selectedPlayer"
      :gameweek="currentGW"
      @confirm="confirmPick"
      @cancel="cancelPick"
    />
  </AppLayout>
</template>
