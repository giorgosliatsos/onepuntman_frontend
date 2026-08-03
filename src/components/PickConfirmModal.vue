<script setup lang="ts">
import type { Player, Position } from '@/types'
import { POSITION_COLORS } from '@/types'
import { X, AlertTriangle, TrendingUp, Users, Banknote } from 'lucide-vue-next'

defineProps<{
  player: Player
  gameweek: number
}>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
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
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-black/70 backdrop-blur-sm"
        @click="emit('cancel')"
      ></div>

      <!-- Modal -->
      <div class="relative bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl max-w-md w-full overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h3 class="text-lg font-semibold text-white">Confirm Your Pick</h3>
          <button
            @click="emit('cancel')"
            class="text-slate-400 hover:text-white transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Content -->
        <div class="p-6">
          <!-- Player Card -->
          <div class="bg-slate-700/50 rounded-xl p-4 mb-6">
            <div class="flex items-center gap-4">
              <div class="relative w-14 h-14 shrink-0">
                <img
                  :src="player.photoUrl || FALLBACK_PHOTO"
                  :alt="player.name"
                  class="w-14 h-14 rounded-xl object-cover bg-slate-700"
                  @error="onPhotoError"
                />
                <span
                  :class="[
                    'absolute -bottom-1 -right-1 w-5 h-5 rounded-full text-[10px] leading-none font-bold flex items-center justify-center text-white ring-2 ring-slate-800',
                    getPositionColor(player.position)
                  ]"
                >
                  {{ player.position?.[0] }}
                </span>
              </div>
              <div class="flex-1">
                <div class="text-xl font-bold text-white">{{ player.name }}</div>
                <div class="text-slate-400">
                  {{ player.team }}
                  <span v-if="player.opponentShort"> · vs {{ player.opponentShort }} ({{ player.isHome ? 'H' : 'A' }})</span>
                </div>
              </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-3 gap-4 mt-4">
              <div class="text-center">
                <div class="flex items-center justify-center gap-1 text-primary-400">
                  <TrendingUp class="w-4 h-4" />
                  <span class="font-bold">{{ player.totalPoints }}</span>
                </div>
                <div class="text-xs text-slate-400">Points</div>
              </div>
              <div class="text-center">
                <div class="flex items-center justify-center gap-1 text-amber-400">
                  <Banknote class="w-4 h-4" />
                  <span class="font-bold">{{ formatPrice(player.nowCost) }}</span>
                </div>
                <div class="text-xs text-slate-400">Price</div>
              </div>
              <div class="text-center">
                <div class="flex items-center justify-center gap-1 text-sky-400">
                  <Users class="w-4 h-4" />
                  <span class="font-bold">{{ player.ownership }}%</span>
                </div>
                <div class="text-xs text-slate-400">Owned</div>
              </div>
            </div>
          </div>

          <!-- Warning -->
          <div class="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
            <div class="flex items-start gap-3">
              <AlertTriangle class="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p class="text-amber-200 text-sm">
                  This will be your pick for <strong>Gameweek {{ gameweek }}</strong>. 
                  You cannot change your pick after confirmation.
                </p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <button
              @click="emit('cancel')"
              class="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              @click="emit('confirm')"
              class="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-xl transition-colors"
            >
              Confirm Pick
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
