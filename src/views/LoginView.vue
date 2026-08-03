<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Target, Users, Zap, AlertCircle, CheckCircle } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const username = ref('')
const email = ref("")
const password = ref("")
const isLoggingIn = ref(false)
const isRegistering = ref(false)
const authError = ref<string | null>(null)

const showForgotPassword = ref(false)
const forgotEmail = ref('')
const forgotSubmitting = ref(false)
const forgotMessage = ref<string | null>(null)

async function handleSubmit() {
  authError.value = null

  try {
    if (isRegistering.value) {
      await authStore.register(
        username.value,
        email.value,
        password.value
      )
    } else {
      await authStore.login(
        email.value,
        password.value
      )
    }

    router.push('/pick')

  } catch(error: any) {
    authError.value = error.response?.data?.message
      ?? 'Something went wrong. Please try again.'
  }
}

function openForgotPassword() {
  authError.value = null
  forgotMessage.value = null
  forgotEmail.value = email.value
  showForgotPassword.value = true
}

async function handleForgotSubmit() {
  forgotSubmitting.value = true
  forgotMessage.value = null

  try {
    forgotMessage.value = await authStore.requestPasswordReset(forgotEmail.value)
  }
  catch (error: any) {
    forgotMessage.value = error.response?.data?.message
      ?? 'Something went wrong. Please try again.'
  }
  finally {
    forgotSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
    <!-- Header -->
    <header class="px-4 sm:px-6 py-4">
      <div class="max-w-6xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-2 sm:gap-3">
          <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <Target class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <span class="text-lg sm:text-xl font-bold text-white">One Punt Man</span>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <div class="max-w-4xl w-full">
        <div class="text-center mb-8 sm:mb-12">
          <h1 class="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Pick the
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400">
              Differentials
            </span>
          </h1>
          <p class="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed px-2">
            Compete with other FPL managers by picking one low-ownership player each gameweek. 
            Score big with hidden gems that others overlook.
          </p>
        </div>

        <!-- Features Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-700/50">
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary-500/20 flex items-center justify-center mb-3 sm:mb-4">
              <Target class="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
            </div>
            <h3 class="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">One Pick Per Week</h3>
            <p class="text-sm sm:text-base text-slate-400">
              Select one player with under 5% ownership each gameweek
            </p>
          </div>

          <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-700/50">
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-3 sm:mb-4">
              <Zap class="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            </div>
            <h3 class="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">High Risk, High Reward</h3>
            <p class="text-sm sm:text-base text-slate-400">
              Find those differentials before they explode in price
            </p>
          </div>

          <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-700/50">
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-sky-500/20 flex items-center justify-center mb-3 sm:mb-4">
              <Users class="w-5 h-5 sm:w-6 sm:h-6 text-sky-400" />
            </div>
            <h3 class="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">Compete Globally</h3>
            <p class="text-sm sm:text-base text-slate-400">
              See how your picks stack up against other managers
            </p>
          </div>
        </div>

        <!-- Login Section -->
        <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-slate-700/50 max-w-md mx-auto">
          <h2 class="text-xl sm:text-2xl font-bold text-white text-center mb-4 sm:mb-6">Get Started</h2>
          
            <div v-if="!isLoggingIn"><!-- Auth Section -->
              <div class="bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-slate-700/50 max-w-md mx-auto">

                <!-- Forgot Password Form -->
                <template v-if="showForgotPassword">

                  <h2 class="text-2xl font-bold text-white text-center mb-6">
                    Reset Your Password
                  </h2>

                  <p class="text-slate-400 text-sm text-center mb-6">
                    Enter your email and we'll send you a link to reset your password.
                  </p>

                  <div class="mb-6">
                    <input
                      v-model="forgotEmail"
                      type="email"
                      placeholder="Email"
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

                  <div
                    v-if="forgotMessage"
                    class="mb-4 flex items-center gap-2 text-sm rounded-lg px-3 py-2 bg-primary-500/20 text-primary-400"
                  >
                    <CheckCircle class="w-4 h-4 flex-shrink-0" />
                    <span>{{ forgotMessage }}</span>
                  </div>

                  <button
                    @click="handleForgotSubmit"
                    :disabled="forgotSubmitting"
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
                      mb-4
                    "
                  >
                    {{ forgotSubmitting ? 'Sending...' : 'Send Reset Link' }}
                  </button>

                  <button
                    @click="showForgotPassword = false"
                    class="w-full text-slate-400 hover:text-white text-sm text-center transition"
                  >
                    Back to login
                  </button>

                </template>

                <!-- Login / Sign Up Form -->
                <template v-else>

                <h2 class="text-2xl font-bold text-white text-center mb-6">
                  Join One Punt Man
                </h2>


                <!-- Tabs -->
                <div class="flex bg-slate-900 rounded-xl p-1 mb-6">

                  <button
                    @click="isRegistering=false"
                    class="flex-1 py-2 rounded-lg font-semibold transition"
                    :class="!isRegistering
                      ? 'bg-primary-500 text-white'
                      : 'text-slate-400 hover:text-white'"
                  >
                    Login
                  </button>


                  <button
                    @click="isRegistering=true"
                    class="flex-1 py-2 rounded-lg font-semibold transition"
                    :class="isRegistering
                      ? 'bg-primary-500 text-white'
                      : 'text-slate-400 hover:text-white'"
                  >
                    Sign Up
                  </button>

                </div>



                <!-- Username only on signup -->
                <div v-if="isRegistering" class="mb-4">

                  <input
                    v-model="username"
                    type="text"
                    placeholder="Username"
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



                <div class="mb-4">

                  <input
                    v-model="email"
                    type="email"
                    placeholder="Email"
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



                <div class="mb-2">

                  <input
                    v-model="password"
                    type="password"
                    placeholder="Password"
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

                <div v-if="!isRegistering" class="text-right mb-4">
                  <button
                    @click="openForgotPassword"
                    class="text-slate-400 hover:text-primary-400 text-xs transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <div v-else class="mb-4"></div>

                <div
                  v-if="authError"
                  class="mb-4 flex items-center gap-2 text-sm rounded-lg px-3 py-2 bg-red-500/20 text-red-400"
                >
                  <AlertCircle class="w-4 h-4 flex-shrink-0" />
                  <span>{{ authError }}</span>
                </div>

                <!-- Submit -->
                <button
                  @click="handleSubmit"
                  :disabled="authStore.loading"
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

                  <span v-if="!authStore.loading">
                    {{ isRegistering ? 'Create Account' : 'Login' }}
                  </span>

                  <span v-else>
                    Loading...
                  </span>

                </button>



                <p class="text-slate-400 text-xs text-center mt-4">
                  Join thousands of FPL managers hunting differentials
                </p>

                </template>

              </div>
            </div>
            <span v-else>Logging in...</span>

          <p class="text-slate-400 text-xs sm:text-sm text-center mt-3 sm:mt-4">
            One Punt Man is currently invite-only — sign up and we'll switch on your access
          </p>
        </div>

        <!-- Stats Preview -->
        <div class="flex items-center justify-center gap-4 sm:gap-8 mt-8 sm:mt-12 text-center">
          <div>
            <div class="text-xl sm:text-3xl font-bold text-white">500+</div>
            <div class="text-slate-400 text-xs sm:text-sm">Players</div>
          </div>
          <div class="w-px h-8 sm:h-12 bg-slate-700"></div>
          <div>
            <div class="text-xl sm:text-3xl font-bold text-white">38</div>
            <div class="text-slate-400 text-xs sm:text-sm">Gameweeks</div>
          </div>
          <div class="w-px h-8 sm:h-12 bg-slate-700"></div>
          <div>
            <div class="text-xl sm:text-3xl font-bold text-primary-400">&lt;5%</div>
            <div class="text-slate-400 text-xs sm:text-sm">Max Own</div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="px-4 sm:px-6 py-4 border-t border-slate-800">
      <div class="max-w-6xl mx-auto text-center text-slate-500 text-xs sm:text-sm">
        Data provided by Fantasy Premier League API
      </div>
    </footer>
  </div>
</template>
