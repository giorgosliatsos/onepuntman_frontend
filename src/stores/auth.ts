import { defineStore } from "pinia"
import { ref, computed } from "vue"
import api from "@/services/api"

interface User {
  id: string
  username: string
  profileImageUrl: string | null
  isAllowed: boolean
  isAdmin: boolean
  notificationsEnabled: boolean
}


export const useAuthStore = defineStore("auth", () => {

  const user = ref<User | null>(
    JSON.parse(localStorage.getItem("user") || "null")
  )
  const token = ref<string | null>(
    localStorage.getItem("token")
  )
  const refreshToken = ref<string | null>(
    localStorage.getItem("refreshToken")
  )

  const loading = ref(false)

  const isAuthenticated = computed(
    () => !!token.value
  )


  function persistUser() {
    localStorage.setItem(
      "user",
      JSON.stringify(user.value)
    )
  }


  function applyAuthResponse(data: any) {
    user.value = {
      id: data.id,
      username: data.username,
      profileImageUrl: data.profileImageUrl ?? null,
      isAllowed: data.isAllowed ?? false,
      isAdmin: data.isAdmin ?? false,
      notificationsEnabled: data.notificationsEnabled ?? true
    }

    persistUser()
  }


  async function login(
    email:string,
    password:string
  ){

    loading.value = true

    try {

      const response = await api.post(
        "/auth/login",
        {
          email,
          password
        }
      )


      token.value = response.data.token
      refreshToken.value = response.data.refreshToken

      applyAuthResponse(response.data)

      localStorage.setItem(
        "token",
        response.data.token
      )
      localStorage.setItem(
        "refreshToken",
        response.data.refreshToken
      )


      return true

    }
    finally {
      loading.value=false
    }
  }


  async function register(
    username:string,
    email:string,
    password:string
  ){

    const response = await api.post(
      "/auth/register",
      {
        username,
        email,
        password
      }
    )


    token.value = response.data.token
    refreshToken.value = response.data.refreshToken

    applyAuthResponse(response.data)

    localStorage.setItem(
      "token",
      response.data.token
    )
    localStorage.setItem(
      "refreshToken",
      response.data.refreshToken
    )


    return true
  }



  function logout(){

    // Best-effort — revoke the refresh token server-side so it can't be
    // replayed later, but don't let a failed request block clearing local
    // state.
    if (refreshToken.value) {
      api.post("/auth/logout", { refreshToken: refreshToken.value }).catch(() => {})
    }

    token.value=null
    refreshToken.value=null
    user.value=null

    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
  }



  function initAuth(){

    const savedUser =
      localStorage.getItem("user")

    if(savedUser){
      user.value=JSON.parse(savedUser)
    }
  }


  async function fetchProfile(){

    const response = await api.get("/profile")

    if (user.value) {
      user.value.username = response.data.username
      user.value.profileImageUrl = response.data.profileImageUrl ?? null
      user.value.isAllowed = response.data.isAllowed ?? false
      user.value.isAdmin = response.data.isAdmin ?? false
      user.value.notificationsEnabled = response.data.notificationsEnabled ?? true
    } else {
      user.value = {
        id: response.data.id,
        username: response.data.username,
        profileImageUrl: response.data.profileImageUrl ?? null,
        isAllowed: response.data.isAllowed ?? false,
        isAdmin: response.data.isAdmin ?? false,
        notificationsEnabled: response.data.notificationsEnabled ?? true
      }
    }

    persistUser()
  }


  async function updateUsername(username: string){

    const response = await api.put("/profile", { username })

    if (user.value) {
      user.value.username = response.data.username
      persistUser()
    }
  }


  async function changePassword(currentPassword: string, newPassword: string){

    await api.put("/profile/password", {
      currentPassword,
      newPassword
    })
  }


  async function requestPasswordReset(email: string){

    const response = await api.post("/auth/request-password-reset", { email })

    return response.data.message as string
  }


  async function resetPassword(token: string, newPassword: string){

    const response = await api.post("/auth/reset-password", {
      token,
      newPassword
    })

    return response.data.message as string
  }


  async function updateNotifications(enabled: boolean){

    const response = await api.put("/profile/notifications", {
      notificationsEnabled: enabled
    })

    if (user.value) {
      user.value.notificationsEnabled = response.data.notificationsEnabled ?? enabled
      persistUser()
    }
  }


  async function uploadProfileImage(file: File){

    const formData = new FormData()
    formData.append("file", file)

    const response = await api.post(
      "/profile/image",
      formData,
      {
        headers: { "Content-Type": undefined }
      }
    )

    if (user.value) {
      user.value.profileImageUrl = response.data.profileImageUrl ?? null
      persistUser()
    }
  }


  return {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    initAuth,
    fetchProfile,
    updateUsername,
    changePassword,
    uploadProfileImage,
    requestPasswordReset,
    resetPassword,
    updateNotifications
  }

})
