import { create } from "zustand"

import type { AuthUser } from "@/lib/types"

const AUTH_STORAGE_KEY = "appointley-auth"

type AuthSnapshot = {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
}

type AuthState = AuthSnapshot & {
  hydrated: boolean
  oauthEnabled: boolean
  hydrate: () => void
  setSession: (
    accessToken: string,
    refreshToken: string,
    user: AuthUser,
    oauthEnabled?: boolean
  ) => void
  clearSession: () => void
}

function readStoredAuth(): AuthSnapshot {
  if (typeof window === "undefined") {
    return {
      accessToken: null,
      refreshToken: null,
      user: null,
    }
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) {
    return {
      accessToken: null,
      refreshToken: null,
      user: null,
    }
  }

  try {
    const parsed = JSON.parse(raw) as AuthSnapshot
    return {
      accessToken: parsed.accessToken ?? null,
      refreshToken: parsed.refreshToken ?? null,
      user: parsed.user ?? null,
    }
  } catch {
    return {
      accessToken: null,
      refreshToken: null,
      user: null,
    }
  }
}

function persistAuth(snapshot: AuthSnapshot) {
  if (typeof window === "undefined") {
    return
  }

  if (!snapshot.accessToken || !snapshot.refreshToken || !snapshot.user) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(snapshot))
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  hydrated: false,
  oauthEnabled: false,
  hydrate: () => {
    const snapshot = readStoredAuth()
    set({
      ...snapshot,
      hydrated: true,
    })
  },
  setSession: (accessToken, refreshToken, user, oauthEnabled = false) => {
    const snapshot = { accessToken, refreshToken, user }
    persistAuth(snapshot)
    set({
      ...snapshot,
      oauthEnabled,
      hydrated: true,
    })
  },
  clearSession: () => {
    persistAuth({
      accessToken: null,
      refreshToken: null,
      user: null,
    })
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      oauthEnabled: false,
      hydrated: true,
    })
  },
}))
