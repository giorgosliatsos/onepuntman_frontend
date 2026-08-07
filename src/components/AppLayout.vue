<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getUserAvatarUrl } from '@/utils/avatar'
import { LogOut, CalendarDays, Trophy, ShieldCheck, Menu, X } from 'lucide-vue-next'
import { ref } from 'vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const mobileMenuOpen = ref(false)

function handleLogout() {
  authStore.logout()
  router.push('/')
}

function navigateTo(path: string) {
  router.push(path)
  mobileMenuOpen.value = false
}
</script>

<template>
  <div class="min-h-screen bg-slate-900">
    <!-- Navigation -->
    <nav class="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14 sm:h-16">
          <!-- Logo -->
          <router-link to="/pick" class="flex items-center gap-2 sm:gap-3">
            <img
              src="/logo.png"
              alt="One Punt Man"
              class="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover object-[center_18%] ring-1 ring-slate-700/80 bg-slate-900"
            />
            <span class="text-base sm:text-lg font-bold text-white">One Punt Man</span>
          </router-link>

          <!-- Desktop Nav Links -->
          <div class="hidden sm:flex items-center gap-1">
            <router-link
              to="/pick"
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                route.path === '/pick' 
                  ? 'bg-primary-500/20 text-primary-400' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              ]"
            >
              <CalendarDays class="w-4 h-4" />
              <span>Επιλογή</span>
            </router-link>

            <router-link
              to="/standings"
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                route.path === '/standings'
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              ]"
            >
              <Trophy class="w-4 h-4" />
              <span>Κατάταξη</span>
            </router-link>

            <router-link
              v-if="authStore.user?.isAdmin"
              to="/admin"
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
                route.path === '/admin'
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              ]"
            >
              <ShieldCheck class="w-4 h-4" />
              <span>Admin</span>
            </router-link>
          </div>

          <!-- Desktop User Menu -->
          <div class="hidden sm:flex items-center gap-4">
            <router-link
              v-if="authStore.user"
              to="/profile"
              class="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                :src="getUserAvatarUrl(authStore.user)"
                :alt="authStore.user.username"
                class="w-8 h-8 rounded-full bg-slate-700 object-cover"
              />
              <span class="text-sm font-medium text-white hidden md:block">{{ authStore.user.username }}</span>
            </router-link>

            <button
              @click="handleLogout"
              class="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <LogOut class="w-4 h-4" />
              <span class="hidden md:block">Αποσύνδεση</span>
            </button>
          </div>

          <!-- Mobile Menu Button -->
          <button 
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="sm:hidden p-2 text-slate-400 hover:text-white"
          >
            <Menu v-if="!mobileMenuOpen" class="w-6 h-6" />
            <X v-else class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="mobileMenuOpen" class="sm:hidden bg-slate-800 border-b border-slate-700">
          <div class="px-4 py-3 space-y-2">
            <!-- User Info -->
            <button
              v-if="authStore.user"
              @click="navigateTo('/profile')"
              class="flex items-center gap-3 w-full py-2 border-b border-slate-700 mb-2 text-left"
            >
              <img
                :src="getUserAvatarUrl(authStore.user)"
                :alt="authStore.user.username"
                class="w-10 h-10 rounded-full bg-slate-700 object-cover"
              />
              <div>
                <div class="text-sm font-medium text-white">{{ authStore.user.username }}</div>
                <div class="text-xs text-slate-400">Προβολή προφίλ</div>
              </div>
            </button>

            <!-- Nav Links -->
            <button
              @click="navigateTo('/pick')"
              :class="[
                'flex items-center gap-3 w-full px-3 py-3 rounded-lg font-medium transition-colors',
                route.path === '/pick' 
                  ? 'bg-primary-500/20 text-primary-400' 
                  : 'text-slate-300 active:bg-slate-700/50'
              ]"
            >
              <CalendarDays class="w-5 h-5" />
              <span>Επιλογή Παίκτη</span>
            </button>

            <button
              @click="navigateTo('/standings')"
              :class="[
                'flex items-center gap-3 w-full px-3 py-3 rounded-lg font-medium transition-colors',
                route.path === '/standings'
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-slate-300 active:bg-slate-700/50'
              ]"
            >
              <Trophy class="w-5 h-5" />
              <span>Κατάταξη</span>
            </button>

            <button
              v-if="authStore.user?.isAdmin"
              @click="navigateTo('/admin')"
              :class="[
                'flex items-center gap-3 w-full px-3 py-3 rounded-lg font-medium transition-colors',
                route.path === '/admin'
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-slate-300 active:bg-slate-700/50'
              ]"
            >
              <ShieldCheck class="w-5 h-5" />
              <span>Admin</span>
            </button>

            <button
              @click="handleLogout"
              class="flex items-center gap-3 w-full px-3 py-3 rounded-lg font-medium text-red-400 active:bg-slate-700/50 transition-colors"
            >
              <LogOut class="w-5 h-5" />
              <span>Αποσύνδεση</span>
            </button>
          </div>
        </div>
      </Transition>
    </nav>

    <!-- Main Content -->
    <main class="px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <slot />
    </main>
  </div>
</template>
