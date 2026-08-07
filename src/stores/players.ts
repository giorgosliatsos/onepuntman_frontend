import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import api from '@/services/api'
import type { Player, Position, CurrentGameweek } from '@/types'

export type SortBy = 'ownership' | 'points' | 'form' | 'price' | 'name'
export type SortOrder = 'asc' | 'desc'

export interface TeamOption {
  id: string
  name: string
}

export const usePlayersStore = defineStore('players', () => {

  const players = ref<Player[]>([])
  const teams = ref<TeamOption[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const currentGameweek = ref<CurrentGameweek | null>(null)

  async function fetchCurrentGameweek(){

    try {

      const response = await api.get('/gameweeks/current')

      currentGameweek.value = {
        number: response.data.number,
        deadline: response.data.deadline,
        isDeadlinePassed: response.data.isDeadlinePassed
      }

    }
    catch(err){

      console.error(err)
      currentGameweek.value = null

    }

  }


  const searchQuery = ref('')
  const selectedTeam = ref<string | null>(null)
  const selectedPosition = ref<Position | null>(null)
  const sortBy = ref<SortBy>('ownership')
  const sortOrder = ref<SortOrder>('desc')
  const maxOwnership = ref(5)

  let searchDebounce: ReturnType<typeof setTimeout> | undefined


  async function fetchPlayers(){

    loading.value = true
    error.value = null

    try {

      const response = await api.get(
        '/players/available',
        {
          params:{
            gameweek: currentGameweek.value?.number,
            search: searchQuery.value || undefined,
            team: selectedTeam.value || undefined,
            position: selectedPosition.value || undefined,
            maxOwnership: maxOwnership.value,
            sortBy: sortBy.value,
            sortOrder: sortOrder.value
          }
        }
      )


      players.value = response.data.map((p:any)=>({

        id: p.id,

        name: p.name,

        team: p.team,

        teamShort: p.teamShort,

        position: p.position,

        photoUrl: p.photoUrl,

        ownership: p.ownership,

        nowCost: p.nowCost,

        totalPoints: p.totalPoints,

        form: p.form,

        opponentShort: p.opponentShort,

        isHome: p.isHome

      }))


    }
    catch(err:any){

      console.error(err)

      error.value =
        err.response?.data?.message ??
        "Αποτυχία φόρτωσης παικτών"

    }
    finally{

      loading.value=false

    }

  }


  async function fetchTeams(){

    try {

      const response = await api.get('/players/teams')

      teams.value = response.data

    }
    catch(err){

      console.error(err)

    }

  }


  function clearFilters(){

    clearTimeout(searchDebounce)

    searchQuery.value = ''
    selectedTeam.value = null
    selectedPosition.value = null
    sortBy.value = 'ownership'
    sortOrder.value = 'asc'
    maxOwnership.value = 5

    fetchPlayers()

  }


  watch(searchQuery, () => {
    clearTimeout(searchDebounce)
    searchDebounce = setTimeout(fetchPlayers, 300)
  })

  watch([selectedTeam, selectedPosition, sortBy, sortOrder, maxOwnership], () => {
    clearTimeout(searchDebounce)
    fetchPlayers()
  })


  const filteredPlayers = computed(()=>{

    return players.value

  })


  return {
    players,
    teams,
    loading,
    error,
    currentGameweek,
    searchQuery,
    selectedTeam,
    selectedPosition,
    sortBy,
    sortOrder,
    maxOwnership,
    filteredPlayers,
    fetchPlayers,
    fetchTeams,
    fetchCurrentGameweek,
    clearFilters
  }

})
