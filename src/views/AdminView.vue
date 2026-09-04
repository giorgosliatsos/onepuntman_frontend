<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import AppLayout from '@/components/AppLayout.vue'
import { Download, Lock, RefreshCcw, Percent, CheckCircle, AlertCircle, Users, ChevronDown, KeyRound, AlertTriangle, X, UserX } from 'lucide-vue-next'

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

interface MissingPickUser {
  id: string
  username: string
  email: string
}

const fetchingPlayers = ref(false)
const fetchPlayersMessage = ref<ActionMessage>(null)

const lockingGameweek = ref(false)
const lockGameweekMessage = ref<ActionMessage>(null)
const gameweekInput = ref<string>('')
const showLockConfirm = ref(false)

const renewingScores = ref(false)
const renewScoresMessage = ref<ActionMessage>(null)

const renewingOwnership = ref(false)
const renewOwnershipMessage = ref<ActionMessage>(null)

const missingPickUsers = ref<MissingPickUser[]>([])
const missingPickUsersLoading = ref(false)
const missingPickUsersError = ref<string | null>(null)
const missingPickUsersLoaded = ref(false)

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
    usersError.value = err.response?.data?.message ?? 'Αποτυχία φόρτωσης χρηστών'
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
    usersError.value = err.response?.data?.message ?? 'Αποτυχία ενημέρωσης χρήστη'
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
    usersError.value = err.response?.data?.message ?? 'Αποτυχία δημιουργίας συνδέσμου επαναφοράς'
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

async function fetchMissingPickUsers() {
  missingPickUsersLoading.value = true
  missingPickUsersError.value = null

  try {
    const response = await api.get('/admin/users/missing-picks')
    missingPickUsers.value = response.data
    missingPickUsersLoaded.value = true
  }
  catch (err: any) {
    missingPickUsersError.value = err.response?.data?.message ?? 'Αποτυχία φόρτωσης χρηστών χωρίς επιλογή'
  }
  finally {
    missingPickUsersLoading.value = false
  }
}

async function fetchPlayers() {
  fetchPlayersMessage.value = null
  fetchingPlayers.value = true

  try {
    const response = await api.post('/admin/fetch-players')
    fetchPlayersMessage.value = {
      type: 'success',
      text: `Ανακτήθηκαν ${response.data.playersFetched} παίκτες`
    }
  }
  catch (err: any) {
    fetchPlayersMessage.value = {
      type: 'error',
      text: err.response?.data?.message ?? 'Αποτυχία ανάκτησης παικτών'
    }
  }
  finally {
    fetchingPlayers.value = false
  }
}

function openLockConfirm() {
  lockGameweekMessage.value = null

  if (!String(gameweekInput.value).trim()) {
    lockGameweekMessage.value = {
      type: 'error',
      text: 'Συμπλήρωσε αριθμό gameweek'
    }
    return
  }

  showLockConfirm.value = true
}

async function lockGameweek() {
  showLockConfirm.value = false
  lockGameweekMessage.value = null
  lockingGameweek.value = true

  try {
    const gameweek = String(gameweekInput.value).trim()
    const response = await api.post('/admin/set-gameweek', null, { params: { gameweek } })
    lockGameweekMessage.value = {
      type: 'success',
      text: `Ορίστηκε η gameweek ${response.data.gameweekNumber} — κλειδώθηκε το ownership για ${response.data.playersLocked} παίκτες`
    }
  }
  catch (err: any) {
    lockGameweekMessage.value = {
      type: 'error',
      text: err.response?.data?.message ?? 'Αποτυχία ορισμού gameweek'
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
      text: `Ανανεώθηκαν οι πόντοι για ${response.data.playersUpdated} παίκτες`
    }
  }
  catch (err: any) {
    renewScoresMessage.value = {
      type: 'error',
      text: err.response?.data?.message ?? 'Αποτυχία ανανέωσης πόντων'
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
      text: `Ανανεώθηκε το ownership για ${response.data.playersUpdated} παίκτες`
    }
  }
  catch (err: any) {
    renewOwnershipMessage.value = {
      type: 'error',
      text: err.response?.data?.message ?? 'Αποτυχία ανανέωσης του ownership'
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
        <p class="text-slate-400">Διαχείριση δεδομένων gameweek και πρόσβασης χρηστών</p>
      </div>

      <div class="space-y-6">
        <!-- Fetch Players -->
        <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center">
              <Download class="w-5 h-5 text-sky-400" />
            </div>
            <h2 class="text-lg font-semibold text-white">Ανάκτηση Παικτών</h2>
          </div>
          <p class="text-sm text-slate-400 mb-4">
            Ανανεώνει ονόματα παικτών, ομάδες, φωτογραφίες, τιμές, πόντους και αντιπάλους από το FPL.
            Ασφαλές να εκτελείται οποιαδήποτε στιγμή — δεν επηρεάζει ποτέ το κλειδωμένο ownership.
          </p>
          <button
            @click="fetchPlayers"
            :disabled="fetchingPlayers"
            class="bg-sky-500 hover:bg-sky-600 text-white font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {{ fetchingPlayers ? 'Ανάκτηση...' : 'Ανάκτηση Παικτών' }}
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
            <h2 class="text-lg font-semibold text-white">Ορισμός Νέας Gameweek</h2>
          </div>
          <p class="text-sm text-slate-400 mb-4">
            Ορίζει την τρέχουσα Gameweek του FPL ως ενεργή και <strong class="text-slate-300">κλειδώνει το
            ownership % κάθε παίκτη</strong> αυτή τη στιγμή. Αυτό το κλειδωμένο στιγμιότυπο καθορίζει ποιοι είναι κάτω
            από 5% και επιλέξιμοι — αλλαγές στο live ownership στο FPL αργότερα δεν θα το επηρεάσουν μέχρι να τρέξει ξανά.
          </p>
          <div class="flex items-center gap-3">
            <input
              v-model="gameweekInput"
              type="number"
              min="1"
              placeholder="π.χ. 5"
              class="w-28 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              @click="openLockConfirm"
              :disabled="lockingGameweek"
              class="bg-amber-500 hover:bg-amber-600 text-white font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {{ lockingGameweek ? 'Κλείδωμα...' : 'Ορισμός Νέας Gameweek' }}
            </button>
          </div>
          <p class="text-xs text-slate-500 mt-2">
            Συμπλήρωσε τον αριθμό της gameweek που θέλεις να ορίσεις ως ενεργή και να κλειδώσεις.
          </p>

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
            <h2 class="text-lg font-semibold text-white">Ανανέωση Πόντων</h2>
          </div>
          <p class="text-sm text-slate-400 mb-4">
            Ενημερώνει τους πόντους για την τρέχουσα κλειδωμένη gameweek καθώς παίζονται οι αγώνες.
            Δεν επηρεάζει το ownership — εκτελέστε το όσο συχνά θέλετε κατά τη διάρκεια της Gameweek.
          </p>
          <button
            @click="renewScores"
            :disabled="renewingScores"
            class="bg-primary-500 hover:bg-primary-600 text-white font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {{ renewingScores ? 'Ανανέωση...' : 'Ανανέωση Πόντων' }}
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
            <h2 class="text-lg font-semibold text-white">Ανανέωση Ownership</h2>
          </div>
          <p class="text-sm text-slate-400 mb-4">
            Ξανακλειδώνει το ownership % για την τρέχουσα Gameweek βάσει live δεδομένων του FPL, χωρίς
            να αλλάζει ποια gameweek είναι ενεργή. Χρησιμοποιήστε το αν χρειάζεται διόρθωση του ownership
            εν μέσω Gameweek — διαφορετικά παραμένει κλειδωμένη μέχρι να τρέξει ξανά το "Ορισμός Νέας Gameweek".
          </p>
          <button
            @click="renewOwnership"
            :disabled="renewingOwnership"
            class="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {{ renewingOwnership ? 'Ανανέωση...' : 'Ανανέωση Ownership' }}
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

        <!-- Missing Picks -->
        <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
              <UserX class="w-5 h-5 text-rose-400" />
            </div>
            <h2 class="text-lg font-semibold text-white">Χρήστες Χωρίς Επιλογή</h2>
          </div>
          <p class="text-sm text-slate-400 mb-4">
            Δείχνει ποιοι επιτρεπόμενοι χρήστες δεν έχουν κάνει ακόμη differential pick για την τρέχουσα
            κλειδωμένη Gameweek.
          </p>
          <button
            @click="fetchMissingPickUsers"
            :disabled="missingPickUsersLoading"
            class="bg-rose-500 hover:bg-rose-600 text-white font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {{ missingPickUsersLoading ? 'Έλεγχος...' : 'Έλεγχος Χρηστών Χωρίς Επιλογή' }}
          </button>

          <div
            v-if="missingPickUsersError"
            class="mt-4 flex items-center gap-2 text-sm rounded-lg px-3 py-2 bg-red-500/20 text-red-400"
          >
            <AlertCircle class="w-4 h-4 flex-shrink-0" />
            <span>{{ missingPickUsersError }}</span>
          </div>

          <div v-else-if="missingPickUsersLoaded" class="mt-4">
            <div v-if="missingPickUsers.length === 0" class="flex items-center gap-2 text-sm rounded-lg px-3 py-2 bg-primary-500/20 text-primary-400">
              <CheckCircle class="w-4 h-4 flex-shrink-0" />
              <span>Όλοι οι επιτρεπόμενοι χρήστες έχουν κάνει την επιλογή τους</span>
            </div>
            <ul v-else class="divide-y divide-slate-700/50 border border-slate-700/50 rounded-lg overflow-hidden">
              <li
                v-for="user in missingPickUsers"
                :key="user.id"
                class="flex items-center justify-between gap-3 px-3 py-2.5"
              >
                <div class="min-w-0">
                  <p class="text-white font-medium truncate">{{ user.username }}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Users -->
        <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Users class="w-5 h-5 text-emerald-400" />
            </div>
            <h2 class="text-lg font-semibold text-white">Χρήστες</h2>
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
                    <th class="pb-2 pr-4 font-medium">Όνομα χρήστη</th>
                    <th class="pb-2 pr-4 font-medium">Email</th>
                    <th class="pb-2 pr-4 font-medium">Ρόλος</th>
                    <th class="pb-2 pr-4 font-medium">Εγγραφή</th>
                    <th class="pb-2 pr-4 font-medium">Επαναφορά Κωδικού</th>
                    <th class="pb-2 font-medium text-right">Επιτρέπεται</th>
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
                        Διαχειριστής
                      </span>
                      <span v-else class="text-slate-500">—</span>
                    </td>
                    <td class="py-3 pr-4 text-slate-400">
                      {{ new Date(user.createdAt).toLocaleDateString() }}
                    </td>
                    <td class="py-3 pr-4">
                      <div class="flex flex-col items-start gap-1">
                        <button
                          @click="generateResetLink(user)"
                          :disabled="generatingLinkUserId === user.id"
                          class="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 disabled:opacity-50"
                        >
                          <KeyRound class="w-3 h-3" />
                          {{ generatingLinkUserId === user.id ? 'Δημιουργία...' : 'Δημιουργία συνδέσμου' }}
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
                            {{ copiedUserId === user.id ? 'Αντιγράφηκε!' : 'Αντιγραφή' }}
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
                        Διαχειριστής
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
                    <span class="text-slate-400">Εγγραφή</span>
                    <span class="text-slate-300">{{ new Date(user.createdAt).toLocaleDateString() }}</span>
                  </div>

                  <div class="flex items-center justify-between">
                    <span class="text-slate-400">Επαναφορά κωδικού</span>
                    <button
                      @click="generateResetLink(user)"
                      :disabled="generatingLinkUserId === user.id"
                      class="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 disabled:opacity-50"
                    >
                      <KeyRound class="w-3 h-3" />
                      {{ generatingLinkUserId === user.id ? 'Δημιουργία...' : 'Δημιουργία συνδέσμου' }}
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
                      {{ copiedUserId === user.id ? 'Αντιγράφηκε!' : 'Αντιγραφή' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="users.length === 0" class="text-center text-slate-400 py-8">
              Δεν υπάρχουν χρήστες ακόμη
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

    <!-- Lock Gameweek Confirmation -->
    <Teleport to="body">
      <div v-if="showLockConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          class="absolute inset-0 bg-black/70 backdrop-blur-sm"
          @click="showLockConfirm = false"
        ></div>

        <div class="relative bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl max-w-md w-full overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700">
            <h3 class="text-lg font-semibold text-white">Επιβεβαίωση Κλειδώματος</h3>
            <button
              @click="showLockConfirm = false"
              class="text-slate-400 hover:text-white transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="p-6">
            <div class="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6">
              <div class="flex items-start gap-3">
                <AlertTriangle class="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p class="text-amber-200 text-sm">
                  Θα οριστεί η <strong>Gameweek {{ gameweekInput }}</strong> ως ενεργή και θα κλειδωθεί
                  το ownership % κάθε παίκτη αυτή τη στιγμή. Αυτή η ενέργεια δεν αναιρείται.
                </p>
              </div>
            </div>

            <div class="flex gap-3">
              <button
                @click="showLockConfirm = false"
                class="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-xl transition-colors"
              >
                Ακύρωση
              </button>
              <button
                @click="lockGameweek"
                class="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 px-4 rounded-xl transition-colors"
              >
                Κλείδωμα Gameweek
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>
