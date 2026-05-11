import { useQuery } from "@tanstack/react-query"
import {
  CalendarDays,
  Link2,
  Plus,
  Users,
} from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  getAuditLogs,
  getBookingLinks,
  getCurrentTeam,
  getMeetings,
} from "@/lib/api"
import { CreateLinkDialog } from "@/components/layout/create-link-dialog"

export function DashboardPage() {
  const [showCreateLink, setShowCreateLink] = useState(false)

  const auditQuery = useQuery({
    queryKey: ["audit-logs"],
    queryFn: getAuditLogs,
  })
  const bookingLinksQuery = useQuery({
    queryKey: ["booking-links"],
    queryFn: getBookingLinks,
  })
  const meetingsQuery = useQuery({
    queryKey: ["meetings"],
    queryFn: getMeetings,
  })
  const teamQuery = useQuery({
    queryKey: ["current-team"],
    queryFn: getCurrentTeam,
  })

  const upcomingMeetings =
    meetingsQuery.data
      ?.filter((meeting) => meeting.status === "SCHEDULED")
      .sort(
        (left, right) =>
          new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime()
      )
      .slice(0, 4) ?? []
  const auditEvents = auditQuery.data?.slice(0, 5) ?? []
  const bookingLinks = bookingLinksQuery.data?.slice(0, 4) ?? []
  const teamMembers = teamQuery.data?.members ?? []

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground">
            Manage your booking links, team, and upcoming meetings.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link to="/calendar">View Calendar</Link>
          </Button>
          <Button onClick={() => setShowCreateLink(true)}>
            <Plus className="mr-2 size-4" /> New Booking Link
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Upcoming Meetings</CardTitle>
            <CardDescription>
              You have {upcomingMeetings.length} meetings scheduled for the coming days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between space-x-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                      <Users className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{meeting.clientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(meeting.startsAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">{meeting.status}</Badge>
                </div>
              ))}
              {!upcomingMeetings.length && (
                <p className="text-sm text-muted-foreground">No upcoming meetings.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Active Links</CardTitle>
            <CardDescription>Your recently created booking links.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {bookingLinks.map((link) => (
              <div key={link.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{link.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {link.durationMinutes} min • {link.active ? "Active" : "Expired"}
                  </p>
                </div>
                <Button asChild size="icon" variant="ghost">
                  <a href={link.bookingUrl} target="_blank" rel="noreferrer">
                    <Link2 className="size-4" />
                  </a>
                </Button>
              </div>
            ))}
            {!bookingLinks.length && (
              <p className="text-sm text-muted-foreground">No active links.</p>
            )}
            <Button asChild className="w-full" variant="outline">
              <Link to="/meetings">Manage all links</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Team Snapshot</CardTitle>
            <CardDescription>Active members in your workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamMembers.slice(0, 4).map((member) => (
              <div key={member.id} className="flex items-center space-x-4">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {member.fullName.charAt(0)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">{member.fullName}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
            ))}
            <Button asChild className="w-full" variant="outline">
              <Link to="/team">Manage Team</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Audit logs and workspace events.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {auditEvents.map((log) => (
              <div key={log.id} className="space-y-1 border-b pb-3 last:border-0 last:pb-0">
                <p className="text-sm font-medium">{log.actionType}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
            {!auditEvents.length && (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateLinkDialog open={showCreateLink} onOpenChange={setShowCreateLink} />
    </div>
  )
}

