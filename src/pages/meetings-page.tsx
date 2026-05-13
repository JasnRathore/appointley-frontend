import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Search, Clock } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cancelMeeting, getMeetings } from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RescheduleDialog } from "@/components/layout/reschedule-dialog"
import type { Meeting } from "@/lib/types"

import { useAuthStore } from "@/store/auth-store"

export function MeetingsPage() {
  const { activeTeamId } = useAuthStore()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [rescheduleMeeting, setRescheduleMeeting] = useState<Meeting | null>(null)
  const [showReschedule, setShowReschedule] = useState(false)
  
  const meetingsQuery = useQuery({
    queryKey: ["meetings", activeTeamId],
    queryFn: getMeetings,
  })

  const cancelMutation = useMutation({
    mutationFn: cancelMeeting,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["meetings"] })
      void queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] })
    },
  })

  const meetings = meetingsQuery.data ?? []
  
  const filteredMeetings = meetings.filter(m => 
    m.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.bookingLinkTitle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const upcomingMeetings = filteredMeetings.filter((meeting) => meeting.status === "SCHEDULED")
  const cancelledMeetings = filteredMeetings.filter((meeting) => meeting.status === "CANCELLED")

  return (
    <div className="flex flex-col pb-8">

      <Tabs defaultValue="upcoming" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="history">Past</TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search meetings..."
              className="pl-9 h-9 w-full sm:w-[250px] lg:w-[300px] bg-card border-border/60 shadow-sm focus-visible:ring-primary focus-visible:border-primary transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="rounded-xl border border-border/50 bg-card/50 shadow-sm backdrop-blur-sm divide-y divide-border/50 overflow-hidden">
            {upcomingMeetings.map((meeting) => (
              <div key={meeting.id} className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-muted/30 transition-all duration-200 ease-in-out">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-10 flex-1">
                  
                  {/* Date & Time Column */}
                  <div className="min-w-[120px] flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="size-1.5 rounded-full bg-primary/70 animate-pulse" />
                      <p className="text-sm font-semibold tracking-tight text-foreground">
                        {new Date(meeting.startsAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                      </p>
                    </div>
                    <p className="text-[11px] font-medium text-muted-foreground/80 uppercase tracking-wider pl-3.5">
                      {new Date(meeting.startsAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  {/* Details Column */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold tracking-tight truncate group-hover:text-primary transition-colors">{meeting.clientName}</p>
                      <Badge variant="secondary" className="bg-primary/5 text-primary hover:bg-primary/10 border-transparent text-[9px] uppercase tracking-wider px-1.5 h-4">
                        via {meeting.bookingLinkTitle}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground/70 mt-1">
                       <div className="flex items-center gap-1.5">
                         <Clock className="size-3 opacity-70" />
                         {Math.round((new Date(meeting.endsAt).getTime() - new Date(meeting.startsAt).getTime()) / 60000)} min
                       </div>
                       <span className="opacity-50">•</span>
                       <span className="truncate">{meeting.clientEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Column */}
                <div className="flex items-center justify-end gap-2 mt-4 sm:mt-0 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100 sm:opacity-100 lg:opacity-0">
                  <Button variant="ghost" size="sm" className="h-8 px-3 text-xs rounded-lg hover:bg-background shadow-sm ring-1 ring-border/50" onClick={() => {
                     setRescheduleMeeting(meeting)
                     setShowReschedule(true)
                   }}>
                    Reschedule
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-3 text-xs rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10 ring-1 ring-destructive/20 shadow-sm" onClick={() => cancelMutation.mutate(meeting.id)} disabled={cancelMutation.isPending}>
                    Cancel
                  </Button>
                </div>
              </div>
            ))}
            {!upcomingMeetings.length && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                 <p className="text-sm font-medium">No upcoming meetings</p>
                 <p className="text-xs text-muted-foreground mt-1">When clients book, they'll appear here.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="rounded-xl border border-border/50 bg-card/30 shadow-sm backdrop-blur-sm divide-y divide-border/50 overflow-hidden">
            {cancelledMeetings.map((meeting) => (
              <div key={meeting.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 opacity-60 hover:opacity-100 transition-opacity duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-10 flex-1">
                  
                  {/* Date & Time Column */}
                  <div className="min-w-[120px] flex flex-col gap-1">
                    <p className="text-sm font-semibold tracking-tight text-muted-foreground line-through decoration-muted-foreground/50">
                      {new Date(meeting.startsAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                    </p>
                    <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                      {new Date(meeting.startsAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                  </div>

                  {/* Details Column */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold tracking-tight text-muted-foreground truncate">{meeting.clientName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground/50 mt-1">
                       <span className="truncate">{meeting.clientEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Status Column */}
                <div className="flex items-center justify-end mt-2 sm:mt-0">
                  <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider h-5 text-muted-foreground border-muted-foreground/20 bg-muted/20">
                    Cancelled
                  </Badge>
                </div>
              </div>
            ))}
            {!cancelledMeetings.length && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                 <p className="text-xs text-muted-foreground italic">No past meeting history.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      <RescheduleDialog 
        open={showReschedule} 
        onOpenChange={setShowReschedule} 
        meeting={rescheduleMeeting} 
      />
    </div>
  )
}
