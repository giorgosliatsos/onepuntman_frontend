<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { CircleCheckBig, Trophy, MonitorX, AlertCircle, CheckCircle } from 'lucide-vue-next'

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
      ?? 'Κάτι πήγε στραβά. Παρακαλώ δοκίμασε ξανά.'
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
      ?? 'Κάτι πήγε στραβά. Παρακαλώ δοκίμασε ξανά.'
  }
  finally {
    forgotSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
    <!-- Header -->
    <header class="relative z-10 px-4 sm:px-6 py-4">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center gap-2 sm:gap-3">
          <img
            src="/logo.png"
            alt="One Punt Man"
            class="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover object-[center_18%] ring-1 ring-slate-700/80 bg-slate-900"
          />
          <span class="text-lg sm:text-xl font-bold text-white">One Punt Man</span>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 relative overflow-hidden">
      <!-- Background Accent: jersey photo, faded into the page -->
      <div class="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <img
          src="/doshirt.png"
          alt=""
          class="absolute right-0 top-0 h-full w-auto max-w-none object-cover opacity-45"
        />
        <div
          class="absolute inset-0"
          style="background: radial-gradient(ellipse 80% 90% at 95% 30%, transparent 0%, rgba(15,23,42,0.45) 55%, rgba(15,23,42,0.95) 85%);"
        ></div>
        <div class="absolute inset-0 bg-gradient-to-b from-slate-900 via-transparent to-slate-900"></div>
      </div>

      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div class="flex flex-col lg:flex-row lg:items-start gap-10 lg:gap-10">
          <!-- Left Column: Hero / Features / Stats (~70-75%) -->
          <div class="flex-1 min-w-0">
            <div class="mb-8 sm:mb-12">
              <h1 class="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                Παίξε
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400">
                  εναλλακτικά
                </span>
              </h1>
              <p class="text-base sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
                Ανταγωνίσου τους θαμώνες του FPL Basement για τον τίτλο του Puntοκράτωρα!
              </p>
            </div>

            <!-- Features Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
              <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-700/50">
                <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary-500/20 flex items-center justify-center mb-3 sm:mb-4">
                  <CircleCheckBig class="w-5 h-5 sm:w-6 sm:h-6 text-primary-400" />
                </div>
                <h3 class="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">Μία Επιλογή Την Εβδομάδα</h3>
                <!-- <p class="text-sm sm:text-base text-slate-400">
                  Επίλεξε έναν παίκτη με ownership κάτω από 5% κάθε αγωνιστικό γύρο
                </p> -->
              </div>

              <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-700/50">
                <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-3 sm:mb-4">
                  <MonitorX class="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                </div>
                <h3 class="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">Μακριά από το template</h3>
                <!-- <p class="text-sm sm:text-base text-slate-400">
                  Μία εβδομαδιαία επιλογή
                </p> -->
              </div>

              <div class="bg-slate-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-700/50">
                <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-sky-500/20 flex items-center justify-center mb-3 sm:mb-4">
                  <Trophy class="w-5 h-5 sm:w-6 sm:h-6 text-sky-400" />
                </div>
                <h3 class="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">Ποιός θα κυριαρχήσει στο τέλος της σεζόν;</h3>
                <!-- <p class="text-sm sm:text-base text-slate-400">
                  μακριά από το template
                </p> -->
              </div>
            </div>

            <!-- Stats Preview -->
            <!-- <div class="flex items-center gap-4 sm:gap-8 text-center">
              <div>
                <div class="text-xl sm:text-3xl font-bold text-white">500+</div>
                <div class="text-slate-400 text-xs sm:text-sm">Παίκτες</div>
              </div>
              <div class="w-px h-8 sm:h-12 bg-slate-700"></div>
              <div>
                <div class="text-xl sm:text-3xl font-bold text-white">38</div>
                <div class="text-slate-400 text-xs sm:text-sm">Αγωνιστικοί Γύροι</div>
              </div>
              <div class="w-px h-8 sm:h-12 bg-slate-700"></div>
              <div>
                <div class="text-xl sm:text-3xl font-bold text-primary-400">&lt;5%</div>
                <div class="text-slate-400 text-xs sm:text-sm">Μέγιστο Ownership</div>
              </div>
            </div> -->
          </div>

          <!-- Right Column: Auth Card (~25-30%) -->
          <div class="w-full lg:w-[400px] xl:w-[420px] lg:flex-shrink-0 lg:sticky lg:top-8">
            <div class="bg-slate-800/35 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-slate-700/50 shadow-2xl shadow-black/30">
              <div v-if="!isLoggingIn">
                <!-- Forgot Password Form -->
                <template v-if="showForgotPassword">

                  <h2 class="text-2xl font-bold text-white text-center mb-6">
                    Επαναφορά Κωδικού Πρόσβασης
                  </h2>

                  <p class="text-slate-400 text-sm text-center mb-6">
                    Εισάγετε το email σας και θα σας στείλουμε έναν σύνδεσμο για επαναφορά του κωδικού σας.
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
                    {{ forgotSubmitting ? 'Αποστολή...' : 'Αποστολή Συνδέσμου' }}
                  </button>

                  <button
                    @click="showForgotPassword = false"
                    class="w-full text-slate-400 hover:text-white text-sm text-center transition"
                  >
                    Επιστροφή στη σύνδεση
                  </button>

                </template>

                <!-- Login / Sign Up Form -->
                <template v-else>

                <h2 class="text-2xl font-bold text-white text-center mb-6">
                  Γίνε μέλος του One Punt Man
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
                    Σύνδεση
                  </button>


                  <button
                    @click="isRegistering=true"
                    class="flex-1 py-2 rounded-lg font-semibold transition"
                    :class="isRegistering
                      ? 'bg-primary-500 text-white'
                      : 'text-slate-400 hover:text-white'"
                  >
                    Εγγραφή
                  </button>

                </div>

                <!-- Username only on signup -->
                <div v-if="isRegistering" class="mb-4">

                  <input
                    v-model="username"
                    type="text"
                    placeholder="Όνομα χρήστη"
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
                    placeholder="Κωδικός πρόσβασης"
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
                    Ξεχάσατε τον κωδικό σας;
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
                    {{ isRegistering ? 'Δημιουργία Λογαριασμού' : 'Σύνδεση' }}
                  </span>

                  <span v-else>
                    Φόρτωση...
                  </span>

                </button>

                <p class="text-slate-400 text-xs text-center mt-4">
                  Γίνε μέλος των FPL managers του Basement και βρες τα differentials
                </p>

                </template>

              </div>
              <div v-else class="text-center text-slate-300 py-4">Σύνδεση σε εξέλιξη...</div>

              <p class="text-slate-400 text-xs sm:text-sm text-center mt-4 sm:mt-6">
                Το One Punt Man λειτουργεί προς το παρόν μόνο με πρόσκληση — εγγραφείτε και θα ενεργοποιήσουμε την πρόσβασή σας
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <!-- <footer class="relative z-10 px-4 sm:px-6 py-4 border-t border-slate-800">
      <div class="max-w-7xl mx-auto text-center text-slate-500 text-xs sm:text-sm">
        Τα δεδομένα παρέχονται από το Fantasy Premier League API
      </div>
    </footer> -->
  </div>
</template>
