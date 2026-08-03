<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import AppLayout from '@/components/AppLayout.vue'
import { Download, Lock, RefreshCcw, Percent, CheckCircle, AlertCircle, Users, ChevronDown, KeyRound } from 'lucide-vue-next'

type ActionMessage = { type: 'success' | 'error'; text: string } | null

interface AdminUser {
  id: string
  username: string
  email: string
  isAllowed: boolean
  isAdmin: boolean
  passwordResetRequested: boolean
  createdAt: string
}

const fetchingPlayers = ref(false)
const fetchPlayersMessage = ref<ActionMessage>(null)

const lockingGameweek = ref(false)
const lockGameweekMessage = ref<ActionMessage>(null)

const renewingScores = ref(false)
const renewScoresMessage = ref<ActionMessage>(null)

const renewingOwnership = ref(false)
const renewOwnershipMessage = ref<ActionMessage>(null)

const users = ref<AdminUser[]>([])
const usersLoading = ref(false)
const usersError = ref<string | null>(null)
const savingUserId = ref<string | null>(null)
const expandedUserIds = ref<Set<string>>(new Set())

const generatingLinkUserId = ref<string | null>(null)
const generatedLinks = ref<Record<string, string>>({})
const copiedUserId = ref<string | null>(null)

function toggleExpanded(userId: string) {
  if (expandedUserIds.value.has(userId))
    expandedUserIds.value.delete(userId)
  else
    expandedUserIds.value.add(userId)
}

onMounted(() => {
  fetchUsers()
})

async function fetchUsers() {
  usersLoading.value = true
  usersError.value = null

  try {
    const response = await api.get('/admin/users')
    users.value = response.data
  }
  catch (err: any) {
    usersError.value = err.response?.data?.message ?? 'Failed to load users'
  }
  finally {
    usersLoading.value = false
  }
}

async function toggleAllowed(user: AdminUser) {
  const nextValue = !user.isAllowed
  savingUserId.value = user.id

  try {
    await api.put(`/admin/users/${user.id}/allowed`, { isAllowed: nextValue })
    user.isAllowed = nextValue
  }
  catch (err: any) {
    usersError.value = err.response?.data?.message ?? 'Failed to update user'
  }
  finally {
    savingUserId.value = null
  }
}

async function generateResetLink(user: AdminUser) {
  generatingLinkUserId.value = user.id

  try {
    const response = await api.post(`/admin/users/${user.id}/generate-reset-link`)

    generatedLinks.value[user.id] =
      `${window.location.origin}/reset-password?token=${response.data.token}`
  }
  catch (err: any) {
    usersError.value = err.response?.data?.message ?? 'Failed to generate reset link'
  }
  finally {
    generatingLinkUserId.value = null
  }
}

async function copyLink(userId: string) {
  const link = generatedLinks.value[userId]

  if (!link)
    return

  try {
    await navigator.clipboard.writeText(link)
    copiedUserId.value = userId

    setTimeout(() => {
      if (copiedUserId.value === userId)
        copiedUserId.value = null
    }, 2000)
  }
  catch {
    // Clipboard API can be unavailable outside a secure context — the link
    // is still shown in the field for the admin to select and copy by hand.
  }
}

async function fetchPlayers() {
  fetchPlayersMessage.value = null
  fetchingPlayers.value = true

  try {
    const response = await api.post('/admin/fetch-players')
    fetchPlayersMessage.value = {
      type: 'success',
      text: `Fetched ${response.data.playersFetched} players`
    }
  }
  catch (err: any) {
    fetchPlayersMessage.value = {
      type: 'error',
      text: err.response?.data?.message ?? 'Failed to fetch players'
    }
  }
  finally {
    fetchingPlayers.value = false
  }
}

async function lockGameweek() {
  lockGameweekMessage.value = null
  lockingGameweek.value = true

  try {
    const response = await api.post('/admin/set-gameweek')
    lockGameweekMessage.value = {
      type: 'success',
      text: `Gameweek ${response.data.gameweekNumber} set — locked ownership for ${response.data.playersLocked} players`
    }
  }
  catch (err: any) {
    lockGameweekMessage.value = {
      type: 'error',
      text: err.response?.data?.message ?? 'Failed to set gameweek'
    }
  }
  finally {
    lockingGameweek.value = false
  }
}

async function renewScores() {
  renewScoresMessage.value = null
  renewingScores.value = true

  try {
    const response = await api.post('/admin/renew-scores')
    renewScoresMessage.value = {
      type: 'success',
      text: `Renewed scores for ${response.data.playersUpdated} players`
    }
  }
  catch (err: any) {
    renewScoresMessage.value = {
      type: 'error',
      text: err.response?.data?.message ?? 'Failed to renew scores'
    }
  }
  finally {
    renewingScores.value = false
  }
}

async function renewOwnership() {
  renewOwnershipMessage.value = null
  renewingOwnership.value = true

  try {
    const response = await api.post('/admin/renew-ownership')
    renewOwnershipMessage.value = {
      type: 'success',
      text: `Renewed ownership for ${response.data.playersUpdated} players`
    }
  }
  catch (err: any) {
    renewOwnershipMessage.value = {
      type: 'error',
      text: err.response?.data?.message ?? 'Failed to renew ownership'
    }
  }
  finally {
    renewingOwnership.value = false
  }
}
</script>

<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Admin</h1>
        <p class="text-slate-400">Manage gameweek data and user access</p>
      </div>

      <div class="space-y-6">
        <!-- Fetch Players -->
        <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center">
              <Download class="w-5 h-5 text-sky-400" />
            </div>
            <h2 class="text-lg font-semibold text-white">Fetch Players</h2>
          </div>
          <p class="text-sm text-slate-400 mb-4">
            Refreshes player names, teams, photos, prices, points, and opponents from FPL.
            Safe to run any time — never touches locked ownership.
          </p>
          <button
            @click="fetchPlayers"
            :disabled="fetchingPlayers"
            class="bg-sky-500 hover:bg-sky-600 text-white font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {{ fetchingPlayers ? 'Fetching...' : 'Fetch Players' }}
          </button>

          <div
            v-if="fetchPlayersMessage"
            :class="[
              'mt-4 flex items-center gap-2 text-sm rounded-lg px-3 py-2',
              fetchPlayersMessage.type === 'success'
                ? 'bg-primary-500/20 text-primary-400'
                : 'bg-red-500/20 text-red-400'
            ]"
          >
            <CheckCircle v-if="fetchPlayersMessage.type === 'success'" class="w-4 h-4 flex-shrink-0" />
            <AlertCircle v-else class="w-4 h-4 flex-shrink-0" />
            <span>{{ fetchPlayersMessage.text }}</span>
          </div>
        </div>

        <!-- Set New Gameweek -->
        <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Lock class="w-5 h-5 text-amber-400" />
            </div>
            <h2 class="text-lg font-semibold text-white">Set New Gameweek</h2>
          </div>
          <p class="text-sm text-slate-400 mb-4">
            Marks the current FPL gameweek as active and <strong class="text-slate-300">locks in every player's
            ownership %</strong> right now. This locked snapshot is what decides who's under 5% and pickable —
            live ownership changes on FPL afterward won't affect it until this runs again.
          </p>
          <button
            @click="lockGameweek"
            :disabled="lockingGameweek"
            class="bg-amber-500 hover:bg-amber-600 text-white font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {{ lockingGameweek ? 'Locking...' : 'Set New Gameweek' }}
          </button>

          <div
            v-if="lockGameweekMessage"
            :class="[
              'mt-4 flex items-center gap-2 text-sm rounded-lg px-3 py-2',
              lockGameweekMessage.type === 'success'
                ? 'bg-primary-500/20 text-primary-400'
                : 'bg-red-500/20 text-red-400'
            ]"
          >
            <CheckCircle v-if="lockGameweekMessage.type === 'success'" class="w-4 h-4 flex-shrink-0" />
            <AlertCircle v-else class="w-4 h-4 flex-shrink-0" />
            <span>{{ lockGameweekMessage.text }}</span>
          </div>
        </div>

        <!-- Renew Scores -->
        <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
              <RefreshCcw class="w-5 h-5 text-primary-400" />
            </div>
            <h2 class="text-lg font-semibold text-white">Renew Scores</h2>
          </div>
          <p class="text-sm text-slate-400 mb-4">
            Updates points for the current locked gameweek as matches are played.
            Does not touch ownership — run this as often as you like during the gameweek.
          </p>
          <button
            @click="renewScores"
            :disabled="renewingScores"
            class="bg-primary-500 hover:bg-primary-600 text-white font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {{ renewingScores ? 'Renewing...' : 'Renew Scores' }}
          </button>

          <div
            v-if="renewScoresMessage"
            :class="[
              'mt-4 flex items-center gap-2 text-sm rounded-lg px-3 py-2',
              renewScoresMessage.type === 'success'
                ? 'bg-primary-500/20 text-primary-400'
                : 'bg-red-500/20 text-red-400'
            ]"
          >
            <CheckCircle v-if="renewScoresMessage.type === 'success'" class="w-4 h-4 flex-shrink-0" />
            <AlertCircle v-else class="w-4 h-4 flex-shrink-0" />
            <span>{{ renewScoresMessage.text }}</span>
          </div>
        </div>

        <!-- Renew Ownership -->
        <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-full bg-fuchsia-500/20 flex items-center justify-center">
              <Percent class="w-5 h-5 text-fuchsia-400" />
            </div>
            <h2 class="text-lg font-semibold text-white">Renew Ownership</h2>
          </div>
          <p class="text-sm text-slate-400 mb-4">
            Re-locks ownership % for the current gameweek against live FPL data, without
            changing which gameweek is active. Use this if ownership needs correcting
            mid-gameweek — otherwise it stays locked until "Set New Gameweek" runs again.
          </p>
          <button
            @click="renewOwnership"
            :disabled="renewingOwnership"
            class="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {{ renewingOwnership ? 'Renewing...' : 'Renew Ownership' }}
          </button>

          <div
            v-if="renewOwnershipMessage"
            :class="[
              'mt-4 flex items-center gap-2 text-sm rounded-lg px-3 py-2',
              renewOwnershipMessage.type === 'success'
                ? 'bg-primary-500/20 text-primary-400'
                : 'bg-red-500/20 text-red-400'
            ]"
          >
            <CheckCircle v-if="renewOwnershipMessage.type === 'success'" class="w-4 h-4 flex-shrink-0" />
            <AlertCircle v-else class="w-4 h-4 flex-shrink-0" />
            <span>{{ renewOwnershipMessage.text }}</span>
          </div>
        </div>

        <!-- Users -->
        <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Users class="w-5 h-5 text-emerald-400" />
            </div>
            <h2 class="text-lg font-semibold text-white">Users</h2>
          </div>

          <div v-if="usersLoading" class="flex items-center justify-center py-10">
            <div class="animate-spin w-6 h-6 border-4 border-primary-500 border-t-transparent rounded-full"></div>
          </div>

          <div v-else>
            <!-- Desktop / wide screens: full table -->
            <div class="hidden md:block overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-left text-slate-400 border-b border-slate-700">
                    <th class="pb-2 pr-4 font-medium">Username</th>
                    <th class="pb-2 pr-4 font-medium">Email</th>
                    <th class="pb-2 pr-4 font-medium">Role</th>
                    <th class="pb-2 pr-4 font-medium">Joined</th>
                    <th class="pb-2 pr-4 font-medium">Password Reset</th>
                    <th class="pb-2 font-medium text-right">Allowed</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="user in users"
                    :key="user.id"
                    class="border-b border-slate-700/50 last:border-b-0"
                  >
                    <td class="py-3 pr-4 text-white font-medium">{{ user.username }}</td>
                    <td class="py-3 pr-4 text-slate-400">{{ user.email }}</td>
                    <td class="py-3 pr-4">
                      <span
                        v-if="user.isAdmin"
                        class="text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded"
                      >
                        Admin
                      </span>
                      <span v-else class="text-slate-500">—</span>
                    </td>
                    <td class="py-3 pr-4 text-slate-400">
                      {{ new Date(user.createdAt).toLocaleDateString() }}
                    </td>
                    <td class="py-3 pr-4">
                      <div class="flex flex-col items-start gap-1">
                        <span
                          v-if="user.passwordResetRequested"
                          class="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded"
                        >
                          Requested
                        </span>
                        <button
                          @click="generateResetLink(user)"
                          :disabled="generatingLinkUserId === user.id"
                          class="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 disabled:opacity-50"
                        >
                          <KeyRound class="w-3 h-3" />
                          {{ generatingLinkUserId === user.id ? 'Generating...' : 'Generate link' }}
                        </button>
                        <div v-if="generatedLinks[user.id]" class="flex items-center gap-1">
                          <input
                            :value="generatedLinks[user.id]"
                            readonly
                            class="text-xs bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 w-44"
                            @focus="($event.target as HTMLInputElement).select()"
                          />
                          <button
                            @click="copyLink(user.id)"
                            class="text-xs text-primary-400 hover:text-primary-300 flex-shrink-0"
                          >
                            {{ copiedUserId === user.id ? 'Copied!' : 'Copy' }}
                          </button>
                        </div>
                      </div>
                    </td>
                    <td class="py-3 text-right">
                      <button
                        @click="toggleAllowed(user)"
                        :disabled="savingUserId === user.id"
                        :class="[
                          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50',
                          user.isAllowed ? 'bg-primary-500' : 'bg-slate-600'
                        ]"
                      >
                        <span
                          :class="[
                            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                            user.isAllowed ? 'translate-x-6' : 'translate-x-1'
                          ]"
                        />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Mobile: collapsible cards -->
            <div class="md:hidden space-y-2">
              <div
                v-for="user in users"
                :key="user.id"
                class="border border-slate-700/50 rounded-lg overflow-hidden"
              >
                <button
                  type="button"
                  @click="toggleExpanded(user.id)"
                  class="w-full flex items-center justify-between gap-3 px-3 py-3 text-left"
                >
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <p class="text-white font-medium truncate">{{ user.username }}</p>
                      <span
                        v-if="user.isAdmin"
                        class="text-xs bg-primary-500/20 text-primary-400 px-2 py-0.5 rounded flex-shrink-0"
                      >
                        Admin
                      </span>
                      <span
                        v-if="user.passwordResetRequested"
                        class="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded flex-shrink-0"
                      >
                        Reset requested
                      </span>
                    </div>
                    <p class="text-xs text-slate-400 truncate mt-0.5">{{ user.email }}</p>
                  </div>

                  <div class="flex items-center gap-3 flex-shrink-0">
                    <button
                      type="button"
                      @click.stop="toggleAllowed(user)"
                      :disabled="savingUserId === user.id"
                      :class="[
                        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50',
                        user.isAllowed ? 'bg-primary-500' : 'bg-slate-600'
                      ]"
                    >
                      <span
                        :class="[
                          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                          user.isAllowed ? 'translate-x-6' : 'translate-x-1'
                        ]"
                      />
                    </button>
                    <ChevronDown
                      :class="[
                        'w-4 h-4 text-slate-400 transition-transform',
                        expandedUserIds.has(user.id) ? 'rotate-180' : ''
                      ]"
                    />
                  </div>
                </button>

                <div
                  v-if="expandedUserIds.has(user.id)"
                  class="px-3 pb-3 pt-2 border-t border-slate-700/50 space-y-3 text-sm"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-slate-400">Joined</span>
                    <span class="text-slate-300">{{ new Date(user.createdAt).toLocaleDateString() }}</span>
                  </div>

                  <div class="flex items-center justify-between">
                    <span class="text-slate-400">Password reset</span>
                    <button
                      @click="generateResetLink(user)"
                      :disabled="generatingLinkUserId === user.id"
                      class="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 disabled:opacity-50"
                    >
                      <KeyRound class="w-3 h-3" />
                      {{ generatingLinkUserId === user.id ? 'Generating...' : 'Generate link' }}
                    </button>
                  </div>

                  <div v-if="generatedLinks[user.id]" class="flex items-center gap-1">
                    <input
                      :value="generatedLinks[user.id]"
                      readonly
                      class="flex-1 min-w-0 text-xs bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300"
                      @focus="($event.target as HTMLInputElement).select()"
                    />
                    <button
                      @click="copyLink(user.id)"
                      class="text-xs text-primary-400 hover:text-primary-300 flex-shrink-0"
                    >
                      {{ copiedUserId === user.id ? 'Copied!' : 'Copy' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="users.length === 0" class="text-center text-slate-400 py-8">
              No users yet
            </div>
          </div>

          <div
            v-if="usersError"
            class="mt-4 flex items-center gap-2 text-sm rounded-lg px-3 py-2 bg-red-500/20 text-red-400"
          >
            <AlertCircle class="w-4 h-4 flex-shrink-0" />
            <span>{{ usersError }}</span>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
