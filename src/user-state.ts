const KEY = 'retro_gaming_user'

export interface UserState {
  userId: string
  name: string
  email: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export function getUser(): UserState | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as UserState) : null
  } catch {
    return null
  }
}

export function setUser(user: UserState): void {
  localStorage.setItem(KEY, JSON.stringify(user))
}

export function clearUser(): void {
  localStorage.removeItem(KEY)
}
