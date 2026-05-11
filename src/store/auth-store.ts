import { create } from "zustand"

import type { AuthUser } from "@/lib/types"

const AUTH_STORAGE_KEY = "appointley-auth"

type AuthSnapshot = {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  activeTeamId: string | null
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
  setActiveTeamId: (teamId: string | null) => void
  clearSession: () => void
}

function readStoredAuth(): AuthSnapshot {
  if (typeof window === "undefined") {
    return {
      accessToken: null,
      refreshToken: null,
      user: null,
      activeTeamId: null,
    }
  }

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) {
    return {
      accessToken: null,
      refreshToken: null,
      user: null,
      activeTeamId: null,
    }
  }

  try {
    const parsed = JSON.parse(raw) as AuthSnapshot
    return {
      accessToken: parsed.accessToken ?? null,
      refreshToken: parsed.refreshToken ?? null,
      user: parsed.user ?? null,
      activeTeamId: parsed.activeTeamId ?? null,
    }
  } catch {
    return {
      accessToken: null,
      refreshToken: null,
      user: null,
      activeTeamId: null,
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
  activeTeamId: null,
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
    const state = useAuthStore.getState()
    const snapshot = { accessToken, refreshToken, user, activeTeamId: state.activeTeamId }
    persistAuth(snapshot)
    set({
      ...snapshot,
      oauthEnabled,
      hydrated: true,
    })
  },
  setActiveTeamId: (activeTeamId) => {
    const state = useAuthStore.getState()
    const snapshot = {
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      user: state.user,
      activeTeamId,
    }
    persistAuth(snapshot)
    set({ activeTeamId })
  },
  clearSession: () => {
    persistAuth({
      accessToken: null,
      refreshToken: null,
      user: null,
      activeTeamId: null,
    })
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      activeTeamId: null,
      oauthEnabled: false,
      hydrated: true,
    })
  },
}))
