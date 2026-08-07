<script setup lang="ts">
import { usePlayersStore } from '@/stores/players'
import type { Position } from '@/types'
import { Search, X, SlidersHorizontal } from 'lucide-vue-next'
import { ref } from 'vue'

const playersStore = usePlayersStore()
const showAdvanced = ref(false)

const positions: { id: Position; name: string; color: string }[] = [
  { id: 'GKP', name: 'GKP', color: 'bg-amber-500' },
  { id: 'DEF', name: 'DEF', color: 'bg-emerald-500' },
  { id: 'MID', name: 'MID', color: 'bg-sky-500' },
  { id: 'FWD', name: 'FWD', color: 'bg-rose-500' },
]

const sortOptions = [
  { value: 'ownership', label: 'Ownership' },
  { value: 'points', label: 'Σύνολο Πόντων' },
  { value: 'form', label: 'Φόρμα' },
  { value: 'price', label: 'Τιμή' },
  { value: 'name', label: 'Όνομα' },
]
</script>

<template>
  <div class="space-y-4">
    <!-- Main Search Bar -->
    <div class="flex items-center gap-4">
      <div class="flex-1 relative">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          v-model="playersStore.searchQuery"
          type="text"
          placeholder="Αναζήτηση παικτών..."
          class="w-full bg-slate-800 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <button
          v-if="playersStore.searchQuery"
          @click="playersStore.searchQuery = ''"
          class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
        >
          <X class="w-5 h-5" />
        </button>
      </div>
      
      <button
        @click="showAdvanced = !showAdvanced"
        :class="[
          'flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors',
          showAdvanced 
            ? 'bg-primary-500/20 border-primary-500/30 text-primary-400' 
            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
        ]"
      >
        <SlidersHorizontal class="w-5 h-5" />
        <span class="hidden sm:block">Φίλτρα</span>
      </button>
    </div>

    <!-- Advanced Filters -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="showAdvanced" class="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Team Filter -->
          <div>
            <label class="block text-sm font-medium text-slate-400 mb-2">Ομάδα</label>
            <select
              v-model="playersStore.selectedTeam"
              class="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option :value="null">Όλες οι Ομάδες</option>
              <option v-for="team in playersStore.teams" :key="team.id" :value="team.id">
                {{ team.name }}
              </option>
            </select>
          </div>

          <!-- Position Filter -->
          <div>
            <label class="block text-sm font-medium text-slate-400 mb-2">Θέση</label>
            <div class="flex gap-2">
              <button
                v-for="pos in positions"
                :key="pos.id"
                @click="playersStore.selectedPosition = playersStore.selectedPosition === pos.id ? null : pos.id"
                :class="[
                  'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  playersStore.selectedPosition === pos.id
                    ? `${pos.color} text-white`
                    : 'bg-slate-700 text-slate-400 hover:text-white'
                ]"
              >
                {{ pos.name }}
              </button>
            </div>
          </div>

          <!-- Sort By -->
          <div>
            <label class="block text-sm font-medium text-slate-400 mb-2">Ταξινόμηση Κατά</label>
            <div class="flex gap-2">
              <select
                v-model="playersStore.sortBy"
                class="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <button
                @click="playersStore.sortOrder = playersStore.sortOrder === 'asc' ? 'desc' : 'asc'"
                class="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white hover:bg-slate-600 transition-colors"
              >
                {{ playersStore.sortOrder === 'asc' ? '↑' : '↓' }}
              </button>
            </div>
          </div>

          <!-- Max Ownership -->
          <div>
            <label class="block text-sm font-medium text-slate-400 mb-2">
              Μέγιστο Ownership: {{ playersStore.maxOwnership }}%
            </label>
            <input
              v-model.number="playersStore.maxOwnership"
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              class="w-full accent-primary-500"
            />
          </div>
        </div>

        <!-- Clear Filters -->
        <div class="mt-4 flex justify-end">
          <button
            @click="playersStore.clearFilters"
            class="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Εκκαθάριση όλων των φίλτρων
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
