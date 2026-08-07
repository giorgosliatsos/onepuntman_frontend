<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/AppLayout.vue'
import { Lock, Facebook, Instagram, Mail } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(true)

onMounted(async () => {
  try {
    await authStore.fetchProfile()
  } catch {
    // fall back to whatever's cached locally
  } finally {
    loading.value = false
  }

  if (authStore.user?.isAllowed) {
    router.push('/pick')
  }
})
</script>

<template>
  <AppLayout>
    <div class="max-w-lg mx-auto">
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
      </div>

      <div v-else class="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 text-center">
        <div class="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
          <Lock class="w-8 h-8 text-amber-400" />
        </div>
        <h1 class="text-2xl font-bold text-white mb-2">Δεν Έχεις Ακόμη Πρόσβαση</h1>
        <p class="text-slate-400 mb-8">
          Το One Punt Man λειτουργεί προς το παρόν μόνο με πρόσκληση. Ο λογαριασμός σου έχει δημιουργηθεί, αλλά ένας διαχειριστής
          πρέπει να ενεργοποιήσει την πρόσβασή σου πριν μπορέσεις να ξεκινήσεις τα picks σου.
          Επικοινωνήστε μαζί μας και θα σας βοηθήσουμε:
        </p>

        <div class="space-y-3">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-center gap-2 w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-xl transition"
          >
            <Facebook class="w-4 h-4" />
            Στείλε μας μήνυμα στο Facebook
          </a>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-center gap-2 w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-xl transition"
          >
            <Instagram class="w-4 h-4" />
            Στείλε μας μήνυμα στο Instagram
          </a>

          <a
            href="mailto:hello@onepuntman.com"
            class="flex items-center justify-center gap-2 w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-xl transition"
          >
            <Mail class="w-4 h-4" />
            Στείλτε μας email
          </a>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
