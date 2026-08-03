<script setup lang="ts">
import type { Player, Position } from '@/types'
import { POSITION_COLORS } from '@/types'
import { ChevronRight, TrendingUp, Users } from 'lucide-vue-next'

defineProps<{
  players: Player[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', player: Player): void
}>()

const FALLBACK_PHOTO = 'https://resources.premierleague.com/premierleague/photos/players/110x140/Photo-Missing.png'

function formatPrice(price: number): string {
  return `£${(price / 10).toFixed(1)}m`
}

function getPositionColor(position: Position): string {
  return POSITION_COLORS[position] ?? 'bg-slate-500'
}

function onPhotoError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = FALLBACK_PHOTO
}
</script>

<template>
  <div class="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
    <!-- Table Header -->
    <div class="hidden md:grid md:grid-cols-12 gap-4 px-4 py-3 bg-slate-800 border-b border-slate-700 text-sm font-medium text-slate-400">
      <div class="col-span-3">Player</div>
      <div class="col-span-2">Position / Team</div>
      <div class="col-span-1">Opponent</div>
      <div class="col-span-1 text-right">Price</div>
      <div class="col-span-1 text-right">Points</div>
      <div class="col-span-1 text-right">Form</div>
      <div class="col-span-2 text-right">Ownership</div>
      <div class="col-span-1"></div>
    </div>

    <!-- No Results -->
    <div v-if="players.length === 0" class="px-6 py-12 text-center">
      <Users class="w-12 h-12 text-slate-600 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-white mb-2">No players found</h3>
      <p class="text-slate-400">Try adjusting your filters</p>
    </div>

    <!-- Player Rows -->
    <div
      v-for="player in players"
      :key="player.id"
      @click="!disabled && emit('select', player)"
      :class="[
        'grid grid-cols-2 md:grid-cols-12 gap-4 px-4 py-4 border-b border-slate-700/50 items-center transition-colors',
        disabled
          ? 'opacity-60 cursor-not-allowed'
          : 'hover:bg-slate-700/30 cursor-pointer'
      ]"
    >
      <!-- Player Name & Info -->
      <div class="col-span-2 md:col-span-3 flex items-center gap-3">
        <div class="relative w-10 h-10 shrink-0">
          <img
            :src="player.photoUrl || FALLBACK_PHOTO"
            :alt="player.name"
            class="w-10 h-10 rounded-full object-cover bg-slate-700"
            loading="lazy"
            @error="onPhotoError"
          />
          <span
            :class="[
              'absolute -bottom-1 -right-1 w-4 h-4 rounded-full text-[9px] leading-none font-bold flex items-center justify-center text-white ring-2 ring-slate-800',
              getPositionColor(player.position)
            ]"
          >
            {{ player.position?.[0] }}
          </span>
        </div>
        <div>
          <div class="font-medium text-white">{{ player.name }}</div>
          <div class="text-sm text-slate-400 md:hidden">
            {{ player.teamShort }}
            <span v-if="player.opponentShort"> vs {{ player.opponentShort }} ({{ player.isHome ? 'H' : 'A' }})</span>
            · {{ formatPrice(player.nowCost) }}
          </div>
        </div>
      </div>

      <!-- Position & Team (Desktop) -->
      <div class="hidden md:block md:col-span-2">
        <div class="text-white">{{ player.team }}</div>
        <div class="text-sm text-slate-400">{{ player.teamShort }} · {{ player.position }}</div>
      </div>

      <!-- Opponent (Desktop) -->
      <div class="hidden md:block md:col-span-1">
        <span v-if="player.opponentShort" class="text-sm text-slate-300">
          {{ player.opponentShort }}
          <span class="text-slate-500">({{ player.isHome ? 'H' : 'A' }})</span>
        </span>
        <span v-else class="text-sm text-slate-600">—</span>
      </div>

      <!-- Price -->
      <div class="hidden md:block md:col-span-1 text-right">
        <span class="text-white font-medium">{{ formatPrice(player.nowCost) }}</span>
      </div>

      <!-- Points -->
      <div class="hidden md:flex md:col-span-1 items-center justify-end gap-1">
        <TrendingUp class="w-4 h-4 text-primary-400" />
        <span class="text-white font-medium">{{ player.totalPoints }}</span>
      </div>

      <!-- Form -->
      <div class="hidden md:block md:col-span-1 text-right">
        <span :class="[
          'font-medium',
          player.form >= 6 ? 'text-primary-400' :
          player.form >= 4 ? 'text-amber-400' : 'text-slate-400'
        ]">
          {{ player.form }}
        </span>
      </div>

      <!-- Ownership -->
      <div class="col-span-1 md:col-span-2 flex items-center justify-end gap-2">
        <div class="flex-1 hidden md:block">
          <div class="w-full bg-slate-700 rounded-full h-2">
            <div
              class="bg-primary-500 h-2 rounded-full"
              :style="{ width: `${Math.min(player.ownership*20, 100)}%` }"
            ></div>
          </div>
        </div>
        <span class="text-sm font-medium text-primary-400 whitespace-nowrap">
          {{ player.ownership }}%
        </span>
      </div>

      <!-- Select Button -->
      <div class="col-span-1 flex justify-end">
        <div
          :class="[
            'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
            disabled ? 'bg-slate-700 text-slate-500' : 'bg-primary-500/20 text-primary-400'
          ]"
        >
          <ChevronRight class="w-5 h-5" />
        </div>
      </div>

      <!-- Mobile Stats -->
      <div class="col-span-2 md:hidden flex items-center gap-4 text-sm text-slate-400">
        <span class="flex items-center gap-1">
          <TrendingUp class="w-4 h-4" />
          {{ player.totalPoints }} pts
        </span>
        <span>Form: {{ player.form }}</span>
      </div>
    </div>
  </div>
</template>
