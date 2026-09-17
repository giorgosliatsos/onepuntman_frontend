<script setup lang="ts">
import { ref } from 'vue'
import type { UserStanding } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { getUserAvatarUrl } from '@/utils/avatar'
import { ChevronDown, ChevronUp, Trophy, Medal, Award } from 'lucide-vue-next'

defineProps<{
  standings: UserStanding[]
}>()

const authStore = useAuthStore()
const expandedRows = ref<Set<string>>(new Set())

function toggleRow(userId: string) {
  if (expandedRows.value.has(userId)) {
    expandedRows.value.delete(userId)
  } else {
    expandedRows.value.add(userId)
  }
}

function isExpanded(userId: string): boolean {
  return expandedRows.value.has(userId)
}

function getRankIcon(rank: number) {
  if (rank === 1) return Trophy
  if (rank === 2) return Medal
  if (rank === 3) return Award
  return null
}

function getRankColor(rank: number): string {
  if (rank === 1) return 'text-amber-400'
  if (rank === 2) return 'text-slate-300'
  if (rank === 3) return 'text-amber-600'
  return 'text-slate-400'
}

function onShirtError(event: Event) {
  (event.target as HTMLImageElement).style.visibility = 'hidden'
}
</script>

<template>
  <div class="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
    <!-- Table Header -->
    <div class="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-800 border-b border-slate-700 text-sm font-medium text-slate-400">
      <div class="col-span-1 text-center">Θέση</div>
      <div class="col-span-4">Παίκτης</div>
      <div class="hidden sm:block sm:col-span-1 text-right">Picks</div>
      <div class="col-span-4 sm:col-span-3 text-right">Μέση Ιδιοκτησία</div>
      <div class="col-span-2 text-right">Σύνολο Πόντων</div>
      <div class="col-span-1"></div>
    </div>

    <!-- Empty State -->
    <div v-if="standings.length === 0" class="px-6 py-12 text-center">
      <Trophy class="w-12 h-12 text-slate-600 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-white mb-2">Δεν υπάρχει ακόμη κατάταξη</h3>
      <p class="text-slate-400">Γίνετε ο πρώτος που θα κάνει μια επιλογή!</p>
    </div>

    <!-- Standings Rows (already sorted by points desc from the backend) -->
    <div
      v-for="(entry, index) in standings"
      :key="entry.userId"
      :class="[
        'border-b border-slate-700/50 last:border-b-0',
        entry.userId === authStore.user?.id ? 'bg-primary-500/10' : ''
      ]"
    >
      <!-- Main Row -->
      <div
        @click="toggleRow(entry.userId)"
        class="grid grid-cols-12 gap-4 px-4 py-4 items-center cursor-pointer hover:bg-slate-700/30 transition-colors"
      >
        <!-- Rank -->
        <div class="col-span-1 flex items-center justify-center">
          <component
            v-if="getRankIcon(index + 1)"
            :is="getRankIcon(index + 1)"
            :class="['w-5 h-5', getRankColor(index + 1)]"
          />
          <span v-else :class="['font-bold', getRankColor(index + 1)]">
            {{ index + 1 }}
          </span>
        </div>

        <!-- Manager -->
        <div class="col-span-4 flex items-center gap-3">
          <img
            :src="getUserAvatarUrl(entry)"
            :alt="entry.username"
            class="w-10 h-10 rounded-full bg-slate-700 object-cover"
          />
          <div>
            <div class="font-medium text-white flex items-center gap-2">
              {{ entry.username }}
              <span
                v-if="entry.userId === authStore.user?.id"
                class="text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded"
              >
                Εσύ
              </span>
            </div>
          </div>
        </div>

        <!-- Picks Count -->
        <div class="hidden sm:block sm:col-span-1 text-right">
          <span class="text-white">{{ entry.picks.length }}</span>
        </div>

        <!-- Mean Ownership -->
        <div class="col-span-4 sm:col-span-3 text-right">
          <span class="text-slate-300">{{ entry.meanOwnership.toFixed(1) }}%</span>
        </div>

        <!-- Total Points -->
        <div class="col-span-2 text-right">
          <span class="text-xl font-bold text-primary-400">{{ entry.totalPoints }}</span>
        </div>

        <!-- Expand Icon -->
        <div class="col-span-1 flex justify-end">
          <div class="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400">
            <ChevronUp v-if="isExpanded(entry.userId)" class="w-5 h-5" />
            <ChevronDown v-else class="w-5 h-5" />
          </div>
        </div>
      </div>

      <!-- Expanded Picks Section -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="isExpanded(entry.userId)" class="px-4 pb-4">
          <!-- Picks Grid -->
          <div
            v-if="entry.picks.length > 0"
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-3"
          >

            <div
              v-for="pick in entry.picks"
              :key="pick.gameweek"
              class="rounded-xl overflow-hidden flex flex-col justify-between p-3 border border-slate-700/40 shadow-sm bg-slate-900/40"
            >
              <!-- GW badge -->
              <span class="self-start text-xs bg-slate-700/70 text-white px-2 py-1 rounded">
                GW{{ pick.gameweek }}
              </span>

              <!-- Shirt with points overlaid as the shirt number -->
              <div class="relative flex items-center justify-center h-16 my-1">
                <img
                  :src="pick.shirtUrl"
                  :alt="pick.team"
                  class="h-full w-auto"
                  loading="lazy"
                  @error="onShirtError"
                />
                <span class="absolute inset-0 flex items-center justify-center pt-2 text-white font-extrabold text-lg [text-shadow:_0_1px_2px_rgb(0_0_0_/_60%)]">
                  {{ pick.points }}
                </span>
              </div>

              <!-- Name + ownership -->
              <div class="text-center">
                <div class="text-white font-semibold text-sm leading-tight truncate">
                  {{ pick.playerName }}
                </div>
                <div class="text-xs text-slate-400">
                  {{ pick.ownership }}% owned
                </div>
              </div>
            </div>

          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
