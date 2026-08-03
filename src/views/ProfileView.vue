<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getUserAvatarUrl } from '@/utils/avatar'
import AppLayout from '@/components/AppLayout.vue'
import { CheckCircle, AlertCircle, Camera, Lock, Unlock, Bell } from 'lucide-vue-next'

const authStore = useAuthStore()

const usernameInput = ref('')
const usernameSaving = ref(false)
const usernameMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordSaving = ref(false)
const passwordMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)

const imageUploading = ref(false)
const imageMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const notificationsSaving = ref(false)
const notificationsMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)

onMounted(async () => {
  authStore.initAuth()

  try {
    await authStore.fetchProfile()
  } catch {
    // fall back to whatever's already cached locally
  }

  usernameInput.value = authStore.user?.username ?? ''
})

async function saveUsername() {
  usernameMessage.value = null
  usernameSaving.value = true

  try {
    await authStore.updateUsername(usernameInput.value)
    usernameMessage.value = { type: 'success', text: 'Username updated' }
  }
  catch (err: any) {
    usernameMessage.value = {
      type: 'error',
      text: err.response?.data?.message ?? 'Failed to update username'
    }
  }
  finally {
    usernameSaving.value = false
  }
}

async function savePassword() {
  passwordMessage.value = null

  if (newPassword.value !== confirmPassword.value) {
    passwordMessage.value = { type: 'error', text: 'New passwords do not match' }
    return
  }

  passwordSaving.value = true

  try {
    await authStore.changePassword(currentPassword.value, newPassword.value)
    passwordMessage.value = { type: 'success', text: 'Password updated' }
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  }
  catch (err: any) {
    passwordMessage.value = {
      type: 'error',
      text: err.response?.data?.message ?? 'Failed to update password'
    }
  }
  finally {
    passwordSaving.value = false
  }
}

async function toggleNotifications() {
  if (!authStore.user) return

  const nextValue = !authStore.user.notificationsEnabled
  notificationsMessage.value = null
  notificationsSaving.value = true

  try {
    await authStore.updateNotifications(nextValue)
    notificationsMessage.value = {
      type: 'success',
      text: nextValue ? 'Gameweek email notifications turned on' : 'Gameweek email notifications turned off'
    }
  }
  catch (err: any) {
    notificationsMessage.value = {
      type: 'error',
      text: err.response?.data?.message ?? 'Failed to update notification settings'
    }
  }
  finally {
    notificationsSaving.value = false
  }
}

function triggerFileSelect() {
  fileInput.value?.click()
}

async function onFileSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  imageMessage.value = null
  imageUploading.value = true

  try {
    await authStore.uploadProfileImage(file)
    imageMessage.value = { type: 'success', text: 'Profile picture updated' }
  }
  catch (err: any) {
    imageMessage.value = {
      type: 'error',
      text: err.response?.data?.message ?? 'Failed to upload image'
    }
  }
  finally {
    imageUploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-white mb-2">Profile Settings</h1>
        <p class="text-slate-400">Manage your account details and profile picture</p>
      </div>

      <div v-if="authStore.user" class="space-y-6">
        <!-- Access Status -->
        <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-white mb-4">Game Access</h2>

          <div class="flex items-center gap-3">
            <div
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center',
                authStore.user.isAllowed ? 'bg-primary-500/20' : 'bg-amber-500/20'
              ]"
            >
              <Unlock v-if="authStore.user.isAllowed" class="w-5 h-5 text-primary-400" />
              <Lock v-else class="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div class="text-white font-medium">
                <span v-if="authStore.user.isAllowed">Active</span>
                <span v-else>Not yet enabled</span>
              </div>
              <p class="text-sm text-slate-400">
                <span v-if="authStore.user.isAllowed">You have full access to the game</span>
                <span v-else>An admin needs to switch on your access — reach out on Facebook, Instagram, or email</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Notifications -->
        <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-white mb-4">Notifications</h2>

          <div class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                <Bell class="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <div class="text-white font-medium">Gameweek Emails</div>
                <p class="text-sm text-slate-400">
                  Get an email when a new gameweek goes live, so you don't miss making your pick
                </p>
              </div>
            </div>

            <button
              @click="toggleNotifications"
              :disabled="notificationsSaving"
              :class="[
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 flex-shrink-0',
                authStore.user.notificationsEnabled ? 'bg-primary-500' : 'bg-slate-600'
              ]"
            >
              <span
                :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  authStore.user.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                ]"
              />
            </button>
          </div>

          <div
            v-if="notificationsMessage"
            :class="[
              'mt-4 flex items-center gap-2 text-sm rounded-lg px-3 py-2',
              notificationsMessage.type === 'success'
                ? 'bg-primary-500/20 text-primary-400'
                : 'bg-red-500/20 text-red-400'
            ]"
          >
            <CheckCircle v-if="notificationsMessage.type === 'success'" class="w-4 h-4 flex-shrink-0" />
            <AlertCircle v-else class="w-4 h-4 flex-shrink-0" />
            <span>{{ notificationsMessage.text }}</span>
          </div>
        </div>

        <!-- Profile Picture -->
        <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-white mb-4">Profile Picture</h2>

          <div class="flex items-center gap-6">
            <div class="relative">
              <img
                :src="getUserAvatarUrl(authStore.user)"
                :alt="authStore.user.username"
                class="w-20 h-20 rounded-full bg-slate-700 object-cover"
              />
              <div
                v-if="imageUploading"
                class="absolute inset-0 rounded-full bg-slate-900/70 flex items-center justify-center"
              >
                <div class="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full"></div>
              </div>
            </div>

            <div>
              <button
                @click="triggerFileSelect"
                :disabled="imageUploading"
                class="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <Camera class="w-4 h-4" />
                Change Picture
              </button>
              <p class="text-xs text-slate-500 mt-2">JPEG, PNG, WEBP or GIF. Max 5MB.</p>

              <input
                ref="fileInput"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                class="hidden"
                @change="onFileSelected"
              />
            </div>
          </div>

          <div
            v-if="imageMessage"
            :class="[
              'mt-4 flex items-center gap-2 text-sm rounded-lg px-3 py-2',
              imageMessage.type === 'success'
                ? 'bg-primary-500/20 text-primary-400'
                : 'bg-red-500/20 text-red-400'
            ]"
          >
            <CheckCircle v-if="imageMessage.type === 'success'" class="w-4 h-4 flex-shrink-0" />
            <AlertCircle v-else class="w-4 h-4 flex-shrink-0" />
            <span>{{ imageMessage.text }}</span>
          </div>
        </div>

        <!-- Username -->
        <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-white mb-4">Username</h2>

          <div class="flex flex-col sm:flex-row gap-3">
            <input
              v-model="usernameInput"
              type="text"
              placeholder="Username"
              class="flex-1 bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              @click="saveUsername"
              :disabled="usernameSaving || !usernameInput.trim()"
              class="bg-primary-500 hover:bg-primary-600 text-white font-medium px-6 py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {{ usernameSaving ? 'Saving...' : 'Save' }}
            </button>
          </div>

          <div
            v-if="usernameMessage"
            :class="[
              'mt-4 flex items-center gap-2 text-sm rounded-lg px-3 py-2',
              usernameMessage.type === 'success'
                ? 'bg-primary-500/20 text-primary-400'
                : 'bg-red-500/20 text-red-400'
            ]"
          >
            <CheckCircle v-if="usernameMessage.type === 'success'" class="w-4 h-4 flex-shrink-0" />
            <AlertCircle v-else class="w-4 h-4 flex-shrink-0" />
            <span>{{ usernameMessage.text }}</span>
          </div>
        </div>

        <!-- Change Password -->
        <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h2 class="text-lg font-semibold text-white mb-4">Change Password</h2>

          <div class="space-y-3">
            <input
              v-model="currentPassword"
              type="password"
              placeholder="Current password"
              class="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              v-model="newPassword"
              type="password"
              placeholder="New password"
              class="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              class="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />

            <button
              @click="savePassword"
              :disabled="passwordSaving || !currentPassword || !newPassword"
              class="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {{ passwordSaving ? 'Saving...' : 'Update Password' }}
            </button>
          </div>

          <div
            v-if="passwordMessage"
            :class="[
              'mt-4 flex items-center gap-2 text-sm rounded-lg px-3 py-2',
              passwordMessage.type === 'success'
                ? 'bg-primary-500/20 text-primary-400'
                : 'bg-red-500/20 text-red-400'
            ]"
          >
            <CheckCircle v-if="passwordMessage.type === 'success'" class="w-4 h-4 flex-shrink-0" />
            <AlertCircle v-else class="w-4 h-4 flex-shrink-0" />
            <span>{{ passwordMessage.text }}</span>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
