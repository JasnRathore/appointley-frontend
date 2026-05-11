import { useAuthStore } from "@/store/auth-store"

import type {
  ApiErrorBody,
  AuditLog,
  AuthResponse,
  AvailabilityRule,
  AvailabilityRuleInput,
  BlockedDate,
  BookingLink,
  DashboardSummary,
  Meeting,
  OAuthStatusResponse,
  PublicBookingLink,
  Settings,
  TeamDetails,
  TeamInvite,
  TeamMember,
  TeamSummary,
  TeamRole,
} from "@/lib/types"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"

export class ApiError extends Error {
  status: number
  fieldErrors?: Record<string, string>

  constructor(message: string, status: number, fieldErrors?: Record<string, string>) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

type RequestOptions = {
  method?: string
  body?: unknown
  auth?: boolean
  retry?: boolean
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true, retry = true } = options
  const state = useAuthStore.getState()
  const headers = new Headers()
  headers.set("Content-Type", "application/json")

  if (auth && state.accessToken) {
    headers.set("Authorization", `Bearer ${state.accessToken}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401 && auth && retry && state.refreshToken) {
    const refreshed = await refreshSession()
    if (refreshed) {
      return request<T>(path, { ...options, retry: false })
    }
  }

  if (!response.ok) {
    const errorBody = (await readJson(response)) as ApiErrorBody | null
    throw new ApiError(
      errorBody?.error ?? `Request failed with status ${response.status}`,
      response.status,
      errorBody?.fieldErrors
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await readJson(response)) as T
}

async function readJson(response: Response) {
  const text = await response.text()
  if (!text) {
    return null
  }

  return JSON.parse(text)
}

async function refreshSession() {
  const state = useAuthStore.getState()
  if (!state.refreshToken) {
    state.clearSession()
    return false
  }

  try {
    const payload = await request<AuthResponse>("/api/auth/refresh", {
      method: "POST",
      auth: false,
      retry: false,
      body: {
        refreshToken: state.refreshToken,
      },
    })
    state.setSession(
      payload.accessToken,
      payload.refreshToken,
      payload.user,
      payload.oauthEnabled
    )
    return true
  } catch {
    state.clearSession()
    return false
  }
}

export async function login(payload: { email: string; password: string }) {
  return request<AuthResponse>("/api/auth/login", {
    method: "POST",
    auth: false,
    body: payload,
  })
}

export async function register(payload: {
  fullName: string
  teamName: string
  email: string
  password: string
}) {
  return request<AuthResponse>("/api/auth/register", {
    method: "POST",
    auth: false,
    body: payload,
  })
}

export async function logout() {
  const state = useAuthStore.getState()
  const headers = new Headers()
  if (state.refreshToken) {
    headers.set("X-Refresh-Token", state.refreshToken)
  }
  await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers,
  })
  state.clearSession()
}

export function getOAuthStatus() {
  return request<OAuthStatusResponse>("/api/auth/oauth/status", {
    auth: false,
  })
}

export function getDashboardSummary() {
  return request<DashboardSummary>("/api/dashboard/summary")
}

export function getAuditLogs() {
  return request<AuditLog[]>("/api/audit-logs")
}

export function getCurrentTeam() {
  return request<TeamDetails>("/api/teams/current")
}

export function createTeam(payload: { name: string }) {
  return request<TeamSummary>("/api/teams", {
    method: "POST",
    body: payload,
  })
}

export function inviteTeamMember(payload: { email: string; role: TeamRole }) {
  return request<TeamInvite>("/api/teams/current/invites", {
    method: "POST",
    body: payload,
  })
}

export function acceptTeamInvite(token: string) {
  return request<TeamDetails>(`/api/teams/invites/${token}/accept`, {
    method: "POST",
  })
}

export function updateTeamMemberRole(memberId: string, payload: { role: TeamRole }) {
  return request<TeamMember>(`/api/teams/current/members/${memberId}/role`, {
    method: "PATCH",
    body: payload,
  })
}

export function removeTeamMember(memberId: string) {
  return request<void>(`/api/teams/current/members/${memberId}`, {
    method: "DELETE",
  })
}

export function getAvailabilityRules() {
  return request<AvailabilityRule[]>("/api/calendar/availability")
}

export function replaceAvailabilityRules(payload: AvailabilityRuleInput[]) {
  return request<AvailabilityRule[]>("/api/calendar/availability", {
    method: "PUT",
    body: payload,
  })
}

export function getBlockedDates() {
  return request<BlockedDate[]>("/api/calendar/blocked-dates")
}

export function addBlockedDate(payload: { startsAt: string; endsAt: string; reason?: string }) {
  return request<BlockedDate>("/api/calendar/blocked-dates", {
    method: "POST",
    body: payload,
  })
}

export function deleteBlockedDate(blockedDateId: string) {
  return request<void>(`/api/calendar/blocked-dates/${blockedDateId}`, {
    method: "DELETE",
  })
}

export function getBookingLinks() {
  return request<BookingLink[]>("/api/booking-links")
}

export function createBookingLink(payload: {
  title: string
  description?: string
  expirationDays?: number
  durationMinutes?: number
  timezone: string
}) {
  return request<BookingLink>("/api/booking-links", {
    method: "POST",
    body: payload,
  })
}

export function getMeetings() {
  return request<Meeting[]>("/api/meetings")
}

export function cancelMeeting(meetingId: string) {
  return request<Meeting>(`/api/meetings/${meetingId}/cancel`, {
    method: "POST",
  })
}

export function getSettings() {
  return request<Settings>("/api/settings")
}

export function updateSettings(payload: {
  fullName: string
  teamName: string
  senderName: string
}) {
  return request<Settings>("/api/settings", {
    method: "PUT",
    body: payload,
  })
}

export function getPublicBookingLink(token: string) {
  return request<PublicBookingLink>(`/api/public/booking-links/${token}`, {
    auth: false,
  })
}

export function bookPublicMeeting(
  token: string,
  payload: {
    clientName: string
    clientEmail: string
    startsAt: string
    notes?: string
  }
) {
  return request<Meeting>(`/api/public/booking-links/${token}/meetings`, {
    method: "POST",
    auth: false,
    body: payload,
  })
}
