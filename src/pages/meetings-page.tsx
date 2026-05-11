import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Calendar, XCircle } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cancelMeeting, getMeetings } from "@/lib/api"

export function MeetingsPage() {
  const queryClient = useQueryClient()
  const meetingsQuery = useQuery({
    queryKey: ["meetings"],
    queryFn: getMeetings,
  })
  const cancelMutation = useMutation({
    mutationFn: cancelMeeting,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["meetings"] })
      void queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] })
    },
  })
  const upcomingMeetings =
    meetingsQuery.data?.filter((meeting) => meeting.status === "SCHEDULED") ?? []
  const cancelledMeetings =
    meetingsQuery.data?.filter((meeting) => meeting.status === "CANCELLED") ?? []

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Meetings</h2>
        <p className="text-muted-foreground">
          View and manage your upcoming and past meetings.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming</CardTitle>
                <CardDescription>Scheduled meetings with clients.</CardDescription>
              </div>
              <Badge variant="secondary">{upcomingMeetings.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="flex items-start justify-between space-x-4 border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Calendar className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{meeting.clientName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(meeting.startsAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">{meeting.bookingLinkTitle}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => cancelMutation.mutate(meeting.id)}
                  disabled={cancelMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            ))}
            {!upcomingMeetings.length && (
              <p className="text-sm text-muted-foreground">No upcoming meetings.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Cancelled</CardTitle>
                <CardDescription>Recently cancelled meetings.</CardDescription>
              </div>
              <Badge variant="outline">{cancelledMeetings.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {cancelledMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="flex items-start space-x-4 border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <XCircle className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">{meeting.clientName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(meeting.startsAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">{meeting.bookingLinkTitle}</p>
                </div>
              </div>
            ))}
            {!cancelledMeetings.length && (
              <p className="text-sm text-muted-foreground">No cancelled meetings.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
