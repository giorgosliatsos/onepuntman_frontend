<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { KeyRound, AlertCircle, CheckCircle } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const token = (route.query.token as string) ?? ''
const newPassword = ref('')
const confirmPassword = ref('')
const submitting = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

async function handleSubmit() {
  errorMessage.value = null

  if (!token) {
    errorMessage.value = 'Αυτός ο σύνδεσμος επαναφοράς δεν έχει token — ζήτησε από έναν διαχειριστή έναν νέο.'
    return
  }

  if (newPassword.value.length < 6) {
    errorMessage.value = 'Ο νέος κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Οι κωδικοί δεν ταιριάζουν'
    return
  }

  submitting.value = true

  try {
    successMessage.value = await authStore.resetPassword(token, newPassword.value)

    setTimeout(() => router.push('/'), 2000)
  }
  catch (error: any) {
    errorMessage.value = error.response?.data?.message
      ?? 'Κάτι πήγε στραβά. Παρακαλώ δοκίμασε ξανά.'
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
    <header class="px-4 sm:px-6 py-4">
      <div class="max-w-6xl mx-auto flex items-center gap-2 sm:gap-3">
        <img
          src="/logo.png"
          alt="One Punt Man"
          class="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover object-[center_18%] ring-1 ring-slate-700/80 bg-slate-900"
        />
        <span class="text-lg sm:text-xl font-bold text-white">One Punt Man</span>
      </div>
    </header>

    <main class="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div class="bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-slate-700/50 max-w-md w-full">
        <div class="w-14 h-14 rounded-2xl bg-primary-500/20 flex items-center justify-center mx-auto mb-6">
          <KeyRound class="w-7 h-7 text-primary-400" />
        </div>

        <h2 class="text-2xl font-bold text-white text-center mb-6">
          Ορισμός Νέου Κωδικού Πρόσβασης
        </h2>

        <template v-if="!successMessage">
          <div class="mb-4">
            <input
              v-model="newPassword"
              type="password"
              placeholder="Νέος κωδικός πρόσβασης"
              class="
                w-full
                bg-slate-900
                border
                border-slate-700
                text-white
                placeholder-slate-500
                rounded-xl
                px-4
                py-3
                focus:outline-none
                focus:ring-2
                focus:ring-primary-500
              "
            />
          </div>

          <div class="mb-6">
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="Επιβεβαίωση νέου κωδικού πρόσβασης"
              class="
                w-full
                bg-slate-900
                border
                border-slate-700
                text-white
                placeholder-slate-500
                rounded-xl
                px-4
                py-3
                focus:outline-none
                focus:ring-2
                focus:ring-primary-500
              "
              @keyup.enter="handleSubmit"
            />
          </div>

          <div
            v-if="errorMessage"
            class="mb-4 flex items-center gap-2 text-sm rounded-lg px-3 py-2 bg-red-500/20 text-red-400"
          >
            <AlertCircle class="w-4 h-4 flex-shrink-0" />
            <span>{{ errorMessage }}</span>
          </div>

          <button
            @click="handleSubmit"
            :disabled="submitting"
            class="
              w-full
              bg-gradient-to-r
              from-primary-500
              to-emerald-500
              hover:opacity-90
              text-white
              font-bold
              py-3
              rounded-xl
              transition
              disabled:opacity-50
            "
          >
            {{ submitting ? 'Επαναφορά...' : 'Επαναφορά Κωδικού' }}
          </button>
        </template>

        <div
          v-else
          class="flex items-center gap-2 text-sm rounded-lg px-3 py-3 bg-primary-500/20 text-primary-400"
        >
          <CheckCircle class="w-4 h-4 flex-shrink-0" />
          <span>{{ successMessage }} Ανακατεύθυνση στη σύνδεση...</span>
        </div>
      </div>
    </main>
  </div>
</template>
