export function getAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`
}

export function getUserAvatarUrl(user: { username: string; profileImageUrl?: string | null }): string {
  return user.profileImageUrl || getAvatarUrl(user.username)
}
