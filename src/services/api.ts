import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  }
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem("token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Concurrent requests that all 401 at once (e.g. a view firing several
// calls together) share one in-flight refresh instead of each racing to
// use the refresh token — it's single-use/rotated, so only the first would
// succeed anyway.
let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refreshToken")

  if (!refreshToken) {
    return null
  }

  try {
    // Plain axios, not the `api` instance — going through `api` would
    // re-enter this same response interceptor on failure.
    const response = await axios.post(
      `${api.defaults.baseURL}/auth/refresh`,
      { refreshToken }
    )

    localStorage.setItem("token", response.data.token)
    localStorage.setItem("refreshToken", response.data.refreshToken)

    return response.data.token as string
  } catch {
    return null
  }
}

function forceLogout() {
  localStorage.removeItem("token")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("user")

  // Full reload rather than a router push — guarantees every Pinia store
  // resets to its logged-out state, not just the auth one.
  window.location.href = "/"
}

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    const url: string = originalRequest?.url ?? ""
    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh")

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null
        })
      }

      const newToken = await refreshPromise

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      }

      forceLogout()
    }

    return Promise.reject(error)
  }
)

export default api