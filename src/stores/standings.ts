import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import type { StandingsResponse, UserStanding, GameweekPick, Player } from '@/types'
import { useAuthStore } from './auth'

export const useStandingsStore = defineStore('standings', () => {
  const standings = ref<UserStanding[]>([])
  const gameweeks = ref<number[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // The caller's own pick for the current gameweek — revealed to them
  // regardless of deadline, unlike `standings`, which hides it from
  // everyone (the picker included) until the deadline passes.
  const myCurrentPick = ref<GameweekPick | null>(null)

  const authStore = useAuthStore()

  async function fetchStandings() {
    loading.value = true
    error.value = null

    try {
      const response = await api.get<StandingsResponse>('/standings')

      standings.value = response.data.standings
      gameweeks.value = response.data.gameweeks
    }
    catch (err: any) {
      console.error(err)
      error.value = err.response?.data?.message ?? 'Αποτυχία φόρτωσης βαθμολογίας'
    }
    finally {
      loading.value = false
    }
  }

  async function fetchMyCurrentPick() {
    try {
      const response = await api.get('/picks/mine')
      myCurrentPick.value = response.data
    }
    catch (err) {
      console.error(err)
      myCurrentPick.value = null
    }
  }

  const currentUserStanding = computed(() => {
    if (!authStore.user) return null
    return standings.value.find(s => s.userId === authStore.user?.id) ?? null
  })

  const currentUserRank = computed(() => {
    if (!authStore.user) return null
    const index = standings.value.findIndex(s => s.userId === authStore.user?.id)
    return index >= 0 ? index + 1 : null
  })

  async function makePick(player: Player, gameweek: number) {
    await api.post('/picks', {
      fplPlayerId: player.id,
      gameweek
    })

    await fetchMyCurrentPick()
  }

  return {
    standings,
    gameweeks,
    loading,
    error,
    myCurrentPick,
    currentUserStanding,
    currentUserRank,
    fetchStandings,
    fetchMyCurrentPick,
    makePick
  }
})
