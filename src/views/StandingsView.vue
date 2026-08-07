<script setup lang="ts">
import { onMounted } from 'vue'
import { useStandingsStore } from '@/stores/standings'
import { useAuthStore } from '@/stores/auth'
import { getUserAvatarUrl } from '@/utils/avatar'
import AppLayout from '@/components/AppLayout.vue'
import StandingsTable from '@/components/StandingsTable.vue'
import { Trophy, Medal, Award, AlertCircle } from 'lucide-vue-next'

const standingsStore = useStandingsStore()
const authStore = useAuthStore()

onMounted(async () => {
  authStore.initAuth()
  await standingsStore.fetchStandings()
})
</script>

<template>
  <AppLayout>
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Βαθμολογία</h1>
        <p class="text-slate-400">
          Δες ποιος ειναι ο Puntοκράτωρ!
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="standingsStore.loading" class="flex items-center justify-center py-20">
        <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="standingsStore.error" class="bg-red-500/20 border border-red-500/30 rounded-xl p-6 text-center">
        <AlertCircle class="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 class="text-xl font-semibold text-white mb-2">Αποτυχία φόρτωσης κατάταξης</h3>
        <p class="text-slate-400 mb-4">{{ standingsStore.error }}</p>
        <button
          @click="standingsStore.fetchStandings"
          class="bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-2 rounded-lg transition-colors"
        >
          Δοκίμασε Ξανά
        </button>
      </div>

      <template v-else>
        <!-- User Stats Card -->
        <div v-if="standingsStore.currentUserStanding" class="bg-gradient-to-r from-primary-500/20 to-emerald-500/20 border border-primary-500/30 rounded-2xl p-6 mb-8">
          <div class="flex items-center justify-between flex-wrap gap-6">
            <div class="flex items-center gap-4">
              <img
                :src="getUserAvatarUrl(standingsStore.currentUserStanding)"
                :alt="standingsStore.currentUserStanding.username"
                class="w-16 h-16 rounded-full bg-slate-700 object-cover"
              />
              <div>
                <h2 class="text-xl font-bold text-white">{{ standingsStore.currentUserStanding.username }}</h2>
                <p class="text-slate-400">Η τρέχουσα θέση σας</p>
              </div>
            </div>

            <div class="flex items-center gap-8">
              <div class="text-center">
                <div class="flex items-center gap-2 justify-center">
                  <Trophy class="w-5 h-5 text-amber-400" />
                  <span class="text-3xl font-bold text-white">{{ standingsStore.currentUserRank || '-' }}</span>
                </div>
                <span class="text-slate-400 text-sm">Θέση</span>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-primary-400">{{ standingsStore.currentUserStanding.totalPoints }}</div>
                <span class="text-slate-400 text-sm">Σύνολο Πόντων</span>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-white">{{ standingsStore.currentUserStanding.picks.length }}</div>
                <span class="text-slate-400 text-sm">Picks που Έγιναν</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Top 3 Podium (optional visual) -->
        <div v-if="standingsStore.standings.length >= 3" class="hidden md:flex items-end justify-center gap-4 mb-8">
          <!-- 2nd Place -->
          <div class="flex flex-col items-center">
            <img
              :src="getUserAvatarUrl(standingsStore.standings[1])"
              :alt="standingsStore.standings[1].username"
              class="w-12 h-12 rounded-full bg-slate-700 mb-2 object-cover"
            />
            <div class="bg-slate-700/50 rounded-t-lg p-4 w-24 text-center">
              <Medal class="w-6 h-6 text-slate-300 mx-auto mb-1" />
              <div class="text-sm font-medium text-white truncate">{{ standingsStore.standings[1].username }}</div>
              <div class="text-xs text-slate-400">{{ standingsStore.standings[1].totalPoints }} πόντοι</div>
            </div>
            <div class="bg-slate-600 h-16 w-24 rounded-b-lg"></div>
          </div>

          <!-- 1st Place -->
          <div class="flex flex-col items-center">
            <img
              :src="getUserAvatarUrl(standingsStore.standings[0])"
              :alt="standingsStore.standings[0].username"
              class="w-14 h-14 rounded-full bg-slate-700 mb-2 ring-4 ring-amber-400 object-cover"
            />
            <div class="bg-gradient-to-b from-amber-500/30 to-amber-600/20 rounded-t-lg p-4 w-28 text-center">
              <Trophy class="w-8 h-8 text-amber-400 mx-auto mb-1" />
              <div class="text-sm font-semibold text-white truncate">{{ standingsStore.standings[0].username }}</div>
              <div class="text-xs text-amber-300">{{ standingsStore.standings[0].totalPoints }} πόντοι</div>
            </div>
            <div class="bg-amber-500/40 h-24 w-28 rounded-b-lg"></div>
          </div>

          <!-- 3rd Place -->
          <div class="flex flex-col items-center">
            <img
              :src="getUserAvatarUrl(standingsStore.standings[2])"
              :alt="standingsStore.standings[2].username"
              class="w-12 h-12 rounded-full bg-slate-700 mb-2 object-cover"
            />
            <div class="bg-slate-700/50 rounded-t-lg p-4 w-24 text-center">
              <Award class="w-6 h-6 text-amber-600 mx-auto mb-1" />
              <div class="text-sm font-medium text-white truncate">{{ standingsStore.standings[2].username }}</div>
              <div class="text-xs text-slate-400">{{ standingsStore.standings[2].totalPoints }} πόντοι</div>
            </div>
            <div class="bg-slate-600 h-12 w-24 rounded-b-lg"></div>
          </div>
        </div>

        <!-- Full Standings Table -->
        <StandingsTable :standings="standingsStore.standings" />
      </template>
    </div>
  </AppLayout>
</template>
