export type AuthProvider = "LOCAL" | "GOOGLE"
export type TeamRole = "OWNER" | "ADMIN" | "MANAGER" | "MEMBER" | "VIEWER"
export type MeetingStatus = "SCHEDULED" | "CANCELLED"
export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY"

export type AuthUser = {
  id: string
  fullName: string
  email: string
  authProvider: AuthProvider
  avatarUrl?: string
}

export type AuthResponse = {
  accessToken: string
  refreshToken: string
  user: AuthUser
  oauthEnabled: boolean
}

export type OAuthStatusResponse = {
  googleConfigured: boolean
  loginUrl: string | null
}

export type DashboardSummary = {
  upcomingMeetings: number
  recentActivity: number
  pendingInvites: number
  activeBookingLinks: number
  availabilityRules: number
}

export type AuditLog = {
  id: string
  actorId: string | null
  actionType: string
  entityType: string
  entityId: string
  metadata: string
  ipAddress: string | null
  createdAt: string
}

export type TeamSummary = {
  id: string
  name: string
  ownerId: string
  senderName: string
  memberCount: number
}

export type TeamMember = {
  id: string
  userId: string
  fullName: string
  email: string
  role: TeamRole
  joinedAt: string
}

export type TeamInvite = {
  id: string
  token: string
  email: string
  role: TeamRole
  expiresAt: string
  accepted: boolean
  revoked: boolean
}

export type TeamDetails = {
  team: TeamSummary
  members: TeamMember[]
  pendingInvites: TeamInvite[]
}

export type AvailabilityRule = {
  id: string
  dayOfWeek: DayOfWeek
  startTime: string
  endTime: string
  slotDurationMinutes: number
  active: boolean
}

export type AvailabilityRuleInput = Omit<AvailabilityRule, "id">

export type BlockedDate = {
  id: string
  startsAt: string
  endsAt: string
  reason: string | null
}

export type BookingLink = {
  id: string
  token: string
  title: string
  description: string | null
  expirationDate: string
  active: boolean
  durationMinutes: number
  timezone: string
  bookingUrl: string
  recipientEmail: string | null
  oneTimeUse: boolean
}

export type PublicSlot = {
  startsAt: string
  endsAt: string
}

export type PublicBookingLink = {
  title: string
  description: string | null
  timezone: string
  durationMinutes: number
  expiresAt: string
  slots: PublicSlot[]
  recipientEmail: string | null
}

export type Meeting = {
  id: string
  bookingLinkTitle: string
  bookingLinkToken: string
  clientName: string
  clientEmail: string
  startsAt: string
  endsAt: string
  status: MeetingStatus
  timezone: string
  notes: string | null
}

export type Settings = {
  fullName: string
  email: string
  teamName: string
  senderName: string
  oauthEnabled: boolean
  emailOnBooking: boolean
  inAppOnBooking: boolean
  weeklyDigest: boolean
  marketingEmails: boolean
}

export type Notification = {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  actionUrl: string | null
  createdAt: string
}

export type ApiErrorBody = {
  status?: number
  error?: string
  fieldErrors?: Record<string, string>
}
