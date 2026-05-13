import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Link2,
  Users,
  Calendar as CalendarIcon,
  Activity,
  ArrowUpRight,
  Settings2,
  Trash2,
  Check,
  X,
} from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getDashboardSummary, getAuditLogs, getBookingLinks, getCurrentTeam, getMeetings, updateTeam, deleteTeam } from "@/lib/api"
import { useAuthStore } from "@/store/auth-store"
import { useState } from "react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"

export function DashboardPage() {
  const { activeTeamId } = useAuthStore()

  const summaryQuery = useQuery({
    queryKey: ["dashboard-summary", activeTeamId],
    queryFn: getDashboardSummary,
  })
  const auditQuery = useQuery({
    queryKey: ["audit-logs", activeTeamId],
    queryFn: getAuditLogs,
  })
  const bookingLinksQuery = useQuery({
    queryKey: ["booking-links", activeTeamId],
    queryFn: getBookingLinks,
  })
  const meetingsQuery = useQuery({
    queryKey: ["meetings", activeTeamId],
    queryFn: getMeetings,
  })
  const teamQuery = useQuery({
    queryKey: ["current-team", activeTeamId],
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
  const summary = summaryQuery.data

  return (
    <div className="flex flex-col gap-8 pb-12">

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Meetings", value: summary?.upcomingMeetings ?? 0, icon: CalendarIcon, sub: "Next meeting in 2h", primary: true },
          { title: "Active Links", value: summary?.activeBookingLinks ?? 0, icon: Link2, sub: "All links active", color: "text-green-500" },
          { title: "Team Members", value: summary?.pendingInvites ? teamMembers.length + summary.pendingInvites : teamMembers.length, icon: Users, sub: `${summary?.pendingInvites ?? 0} pending invites`, color: "text-blue-500" },
          { title: "Recent Activity", value: summary?.recentActivity ?? 0, icon: Activity, sub: "Last 24 hours", color: "text-orange-500" }
        ].map((stat, i) => (
          <Card key={i} className={cn(
            "relative overflow-hidden transition-all hover:shadow-md border-none ring-1 ring-border/50",
            stat.primary ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground"
          )}>
            <CardHeader className="pb-2">
              <CardTitle className={cn("text-xs font-medium uppercase tracking-wider", stat.primary ? "text-primary-foreground/70" : "text-muted-foreground")}>
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
              <p className={cn("text-xs mt-1 font-medium", stat.primary ? "text-primary-foreground/60" : "text-muted-foreground/70")}>
                {stat.sub}
              </p>
            </CardContent>
            <stat.icon className={cn("absolute right-4 bottom-4 size-12 opacity-10", stat.primary ? "text-primary-foreground" : "text-foreground")} />
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 shadow-sm border-none ring-1 ring-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
            <div className="space-y-1">
              <CardTitle className="text-xl font-semibold">Upcoming Meetings</CardTitle>
              <CardDescription>
                Your scheduled sessions for the next few days.
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
               <Link to="/meetings" className="flex items-center">
                 View all <ArrowUpRight className="ml-1 size-3" />
               </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingMeetings.map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between group p-4 rounded-xl border border-transparent hover:border-border hover:bg-muted/30 transition-all">
                  <div className="flex items-center space-x-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-muted border border-border group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                      <Users className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground leading-none">{meeting.clientName}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(meeting.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(meeting.startsAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-medium px-3">
                    {meeting.status}
                  </Badge>
                </div>
              ))}
              {!upcomingMeetings.length && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                   <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
                      <CalendarIcon className="size-6 text-muted-foreground/30" />
                   </div>
                   <p className="text-sm font-medium text-muted-foreground">No upcoming meetings</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 shadow-sm border-none ring-1 ring-border/50">
          <CardHeader className="space-y-1 pb-7">
            <CardTitle className="text-xl font-semibold">Quick Links</CardTitle>
            <CardDescription>Your most active booking pages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {bookingLinks.map((link) => (
              <div key={link.id} className="flex items-center justify-between group p-3 rounded-lg hover:bg-muted/50 transition-all">
                <div className="space-y-1">
                  <p className="font-medium text-foreground group-hover:text-primary transition-colors">{link.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {link.durationMinutes} min • {link.active ? "Active" : "Paused"}
                  </p>
                </div>
                <Button asChild size="icon" variant="ghost" className="size-8 hover:bg-primary/10 hover:text-primary">
                  <a href={link.bookingUrl} target="_blank" rel="noreferrer">
                    <Link2 className="size-4" />
                  </a>
                </Button>
              </div>
            ))}
            {!bookingLinks.length && (
              <div className="py-8 text-center">
                 <p className="text-sm text-muted-foreground">No active booking links</p>
              </div>
            )}
            <Button asChild className="w-full mt-4" variant="outline">
              <Link to="/meetings">Manage Booking Links</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm border-none ring-1 ring-border/50">
          <CardHeader className="space-y-1 pb-7">
            <CardTitle className="text-xl font-semibold">Team Members</CardTitle>
            <CardDescription>Collaborators in your workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {teamMembers.slice(0, 4).map((member) => (
              <div key={member.id} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-muted/30 transition-all">
                <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  {member.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{member.fullName}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
            ))}
            <Button asChild className="w-full mt-2 text-muted-foreground hover:text-primary" variant="ghost" size="sm">
              <Link to="/team">Manage Team</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-sm border-none ring-1 ring-border/50">
          <CardHeader className="space-y-1 pb-7">
            <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
            <CardDescription>Latest changes and actions in your workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditEvents.map((log) => (
                <div key={log.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/30 transition-all group">
                  <div className="mt-1.5 size-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{log.actionType.replace(/_/g, ' ').toLowerCase()}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(log.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                </div>
              ))}
              {!auditEvents.length && (
                <div className="py-12 text-center">
                  <p className="text-sm text-muted-foreground italic">No recent activity logs.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>



      </div>
    </div>
  )
}
