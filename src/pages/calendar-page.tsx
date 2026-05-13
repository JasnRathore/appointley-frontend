import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight, Grid2x2, Timer, Settings2, ShieldAlert, Rows3, Users, Clock, Calendar as CalendarIcon, XCircle, ExternalLink } from "lucide-react"
import { useMemo, useState } from "react"
import { format, parseISO } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  cancelMeeting,
  getAvailabilityRules,
  getBlockedDates,
  getMeetings,
} from "@/lib/api"
import {
  describeRange,
  durationInMinutes,
  formatWeekdayLabel,
  getDayMeetings,
  getHoursRange,
  getMonthGridDays,
  getWeekDays,
  isSameDay,
  isSameMonth,
  minutesSinceHourStart,
  shiftCalendarDate,
  sortMeetings,
  formatTimeLabel,
  type CalendarView,
} from "@/lib/calendar"
import type { Meeting, BlockedDate } from "@/lib/types"
import { AvailabilityRulesDialog } from "@/components/layout/availability-rules-dialog"
import { BlockedWindowsDialog } from "@/components/layout/blocked-windows-dialog"
import { RescheduleDialog } from "@/components/layout/reschedule-dialog"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const plannerStartHour = 6
const plannerEndHour = 22
const plannerHourHeight = 80 // Increased for better readability

import { useAuthStore } from "@/store/auth-store"

export function CalendarPage() {
  const { activeTeamId } = useAuthStore()
  const queryClient = useQueryClient()
  const [view, setView] = useState<CalendarView>("week")
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [showRulesDialog, setShowRulesDialog] = useState(false)
  const [showBlockedDialog, setShowBlockedDialog] = useState(false)
  
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showReschedule, setShowReschedule] = useState(false)

  const cancelMutation = useMutation({
    mutationFn: cancelMeeting,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["meetings", activeTeamId] })
      void queryClient.invalidateQueries({ queryKey: ["dashboard-summary", activeTeamId] })
      setShowDetails(false)
      setActiveMeeting(null)
    },
  })

  const rulesQuery = useQuery({
    queryKey: ["availability-rules", activeTeamId],
    queryFn: getAvailabilityRules,
  })
  const blockedDatesQuery = useQuery({
    queryKey: ["blocked-dates", activeTeamId],
    queryFn: getBlockedDates,
  })
  const meetingsQuery = useQuery({
    queryKey: ["meetings", activeTeamId],
    queryFn: getMeetings,
  })


  const scheduledMeetings = useMemo(
    () =>
      sortMeetings(
        (meetingsQuery.data ?? []).filter((meeting) => meeting.status === "SCHEDULED")
      ),
    [meetingsQuery.data]
  )
  
  const blockedDates = blockedDatesQuery.data ?? []
  const plannerDays = useMemo(() => 
    view === "day" ? [selectedDate] : view === "week" ? getWeekDays(selectedDate) : [],
    [view, selectedDate]
  )
  const selectedDayMeetings = getDayMeetings(scheduledMeetings, selectedDate)
  const hours = getHoursRange(plannerStartHour, plannerEndHour)

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col gap-6 overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between px-6 pt-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1 rounded-2xl border p-1 bg-muted/30 shadow-sm ml-2">
            <Button
              size="icon"
              variant="ghost"
              className="size-9 rounded-xl hover:bg-background hover:shadow-sm transition-all"
              onClick={() => setSelectedDate(shiftCalendarDate(view, selectedDate, -1))}
            >
              <ChevronLeft className="size-5" />
            </Button>
            <Button 
              variant="ghost" 
              className="h-9 px-4 text-xs font-bold uppercase tracking-widest hover:bg-background hover:shadow-sm transition-all"
              onClick={() => setSelectedDate(new Date())}
            >
              Today
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-9 rounded-xl hover:bg-background hover:shadow-sm transition-all"
              onClick={() => setSelectedDate(shiftCalendarDate(view, selectedDate, 1))}
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-2xl border p-1 bg-muted/30 shadow-sm mr-2">
            <PlannerViewButton
              active={view === "day"}
              icon={Timer}
              label="Day"
              onClick={() => setView("day")}
            />
            <PlannerViewButton
              active={view === "week"}
              icon={Rows3}
              label="Week"
              onClick={() => setView("week")}
            />
            <PlannerViewButton
              active={view === "month"}
              icon={Grid2x2}
              label="Month"
              onClick={() => setView("month")}
            />
          </div>
          
          <div className="h-8 w-px bg-border mx-2 hidden lg:block" />
          
          <Button variant="outline" size="sm" onClick={() => setShowRulesDialog(true)} className="rounded-xl font-semibold border-none ring-1 ring-border/50 hover:ring-primary/50 transition-all">
            <Settings2 className="mr-2 size-4 text-primary" /> Availability
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowBlockedDialog(true)} className="rounded-xl font-semibold border-none ring-1 ring-border/50 hover:ring-destructive/50 transition-all">
            <ShieldAlert className="mr-2 size-4 text-destructive" /> Blocked
          </Button>
        </div>
      </div>

      <div className="grid flex-1 gap-8 overflow-hidden lg:grid-cols-[300px_1fr] px-6 pb-4">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col gap-8 overflow-y-auto pr-4 border-r border-border/50">
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden p-1">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="w-full"
            />
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Upcoming Today</h3>
                <Badge variant="outline" className="text-[10px] rounded-full border-primary/20 text-primary">{selectedDayMeetings.length}</Badge>
              </div>
              <div className="space-y-3">
                {selectedDayMeetings.slice(0, 4).map((meeting) => (
                  <div key={meeting.id} className="group relative rounded-2xl border border-transparent hover:border-border hover:bg-muted/30 p-4 transition-all cursor-default">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                         {meeting.clientName.charAt(0)}
                       </div>
                       <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{meeting.clientName}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                      <Clock className="size-3" />
                      {describeRange(meeting.startsAt, meeting.endsAt)}
                    </div>
                  </div>
                ))}
                {selectedDayMeetings.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
                    <CalendarIcon className="size-8 mb-2" />
                    <p className="text-xs font-medium italic">No meetings scheduled.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-primary/5 border border-primary/10 p-6">
               <h3 className="text-sm font-bold mb-2">Want to change your hours?</h3>
               <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                 Your weekly availability determines when clients can book sessions with you.
               </p>
               <Button 
                variant="link" 
                size="sm" 
                className="h-auto p-0 text-xs font-bold text-primary hover:no-underline"
                onClick={() => setShowRulesDialog(true)}
              >
                Update Weekly Schedule →
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Calendar View */}
        <main className="flex-1 overflow-hidden rounded-2xl border border-border/50 bg-card/50 shadow-2xl backdrop-blur-sm">
          <div className="h-full overflow-y-auto custom-scrollbar">
            {view === "month" ? (
              <MonthPlanner
                blockedDates={blockedDates}
                meetings={scheduledMeetings}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onSelectMeeting={(m: Meeting) => {
                  setActiveMeeting(m)
                  setShowDetails(true)
                }}
              />
            ) : (
              <TimePlanner
                blockedDates={blockedDates}
                days={plannerDays}
                hours={hours}
                meetings={scheduledMeetings}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onSelectMeeting={(m: Meeting) => {
                  setActiveMeeting(m)
                  setShowDetails(true)
                }}
              />
            )}
          </div>
        </main>
      </div>

      {showRulesDialog && (
        <AvailabilityRulesDialog 
          open={showRulesDialog} 
          onOpenChange={setShowRulesDialog} 
          initialRules={rulesQuery.data ?? []}
        />
      )}
      <BlockedWindowsDialog 
        open={showBlockedDialog} 
        onOpenChange={setShowBlockedDialog} 
      />

      <RescheduleDialog 
        open={showReschedule} 
        onOpenChange={setShowReschedule} 
        meeting={activeMeeting} 
      />

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none ring-1 ring-border/50 shadow-2xl">
          <DialogHeader className="p-6 pb-2 bg-muted/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CalendarIcon className="size-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">Meeting Details</DialogTitle>
                <DialogDescription>
                  View or manage your appointment.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Client</Label>
                <p className="text-lg font-bold">{activeMeeting?.clientName}</p>
                <p className="text-sm text-muted-foreground">{activeMeeting?.clientEmail}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Date</Label>
                  <p className="text-sm font-semibold">{activeMeeting ? format(parseISO(activeMeeting.startsAt), "MMM d, yyyy") : ""}</p>
                </div>
                <div>
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Time</Label>
                  <p className="text-sm font-semibold">{activeMeeting ? formatTimeLabel(new Date(activeMeeting.startsAt)) : ""}</p>
                </div>
              </div>

              {activeMeeting?.notes && (
                <div>
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Notes</Label>
                  <p className="text-sm bg-muted/30 p-3 rounded-lg border border-border/50">{activeMeeting.notes}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button 
                variant="outline" 
                className="rounded-xl font-bold gap-2" 
                onClick={() => {
                  setShowDetails(false)
                  setShowReschedule(true)
                }}
              >
                <ExternalLink className="size-4" /> Reschedule
              </Button>
              <Button 
                variant="outline" 
                className="rounded-xl font-bold gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => cancelMutation.mutate(activeMeeting!.id)}
                disabled={cancelMutation.isPending}
              >
                <XCircle className="size-4" /> {cancelMutation.isPending ? "Canceling..." : "Cancel Meeting"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PlannerViewButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean
  icon: React.ElementType
  label: string
  onClick: () => void
}) {
  return (
    <Button
      size="sm"
      variant={active ? "secondary" : "ghost"}
      className={cn(
        "h-9 px-4 text-xs font-bold uppercase tracking-widest transition-all",
        active ? "bg-background shadow-sm text-foreground rounded-xl" : "text-muted-foreground hover:bg-background/50 rounded-xl"
      )}
      onClick={onClick}
    >
      <Icon className="mr-2 size-3" />
      {label}
    </Button>
  )
}

function MonthPlanner({
  meetings,
  selectedDate,
  onSelectDate,
  onSelectMeeting,
}: {
  meetings: Meeting[]
  selectedDate: Date
  onSelectDate: (date: Date) => void
  onSelectMeeting: (meeting: Meeting) => void
  blockedDates?: BlockedDate[]
}) {
  const weeks = chunkIntoWeeks(getMonthGridDays(selectedDate))

  return (
    <div className="grid h-full grid-rows-[auto_1fr]">
      <div className="grid grid-cols-7 border-b bg-muted/10">
        {getWeekDays(selectedDate).map((day) => (
          <div
            key={day.toISOString()}
            className="px-4 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 text-center"
          >
            {formatWeekdayLabel(day).split(" ")[0]}
          </div>
        ))}
      </div>
      <div className="grid grid-rows-6">
        {weeks.map((week) => (
          <div key={week[0].toISOString()} className="grid grid-cols-7">
            {week.map((day) => {
              const dayMeetings = getDayMeetings(meetings, day)
              const isToday = isSameDay(day, new Date())
              const isSelected = isSameDay(day, selectedDate)
              const currentMonth = isSameMonth(day, selectedDate)

              return (
                <button
                  key={day.toISOString()}
                  className={cn(
                    "min-h-[140px] border-r border-b p-3 text-left transition-all hover:bg-muted/10 last:border-r-0 group",
                    !currentMonth && "bg-muted/5 opacity-30"
                  )}
                  onClick={() => onSelectDate(day)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={cn(
                        "flex size-8 items-center justify-center rounded-xl text-sm font-bold transition-all",
                        isSelected ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : 
                        isToday ? "bg-primary/10 text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      {day.getDate()}
                    </span>
                    {dayMeetings.length > 0 && <div className="size-1.5 rounded-full bg-primary/40" />}
                  </div>
                  <div className="space-y-1.5">
                    {dayMeetings.slice(0, 3).map((meeting) => (
                      <div
                        key={meeting.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectMeeting(meeting)
                        }}
                        className="truncate rounded-lg px-2.5 py-1.5 text-[10px] font-bold bg-primary/5 text-primary border-l-2 border-primary shadow-sm hover:bg-primary/10 transition-colors cursor-pointer"
                      >
                        {meeting.clientName}
                      </div>
                    ))}
                    {dayMeetings.length > 3 && (
                      <p className="text-[10px] font-bold text-muted-foreground px-2 pt-1">
                        +{dayMeetings.length - 3} more
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function TimePlanner({
  days,
  hours,
  meetings,
  onSelectMeeting,
}: {
  days: Date[]
  hours: number[]
  meetings: Meeting[]
  onSelectMeeting: (meeting: Meeting) => void
  blockedDates?: BlockedDate[]
  selectedDate?: Date
  onSelectDate?: (date: Date) => void
}) {
  const columnTemplate = `72px repeat(${days.length}, 1fr)`
  const totalHeight = hours.length * plannerHourHeight

  return (
    <div className="h-full overflow-x-auto">
      <div className="min-w-[1000px] h-full flex flex-col">
        {/* Planner Header */}
        <div
          className="grid border-b sticky top-0 bg-card/90 backdrop-blur-md z-20 shadow-sm"
          style={{ gridTemplateColumns: columnTemplate }}
        >
          <div className="border-r border-border/50" />
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className="px-4 py-5 text-center border-r border-border/50 last:border-r-0"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-1.5">
                {formatWeekdayLabel(day).split(" ")[0]}
              </p>
              <div className="flex justify-center">
                <span className={cn(
                  "size-10 flex items-center justify-center rounded-xl text-xl font-bold transition-all",
                  isSameDay(day, new Date()) ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "text-foreground"
                )}>
                  {day.getDate()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Planner Body */}
        <div className="flex-1 relative">
          <div
            className="grid absolute inset-0"
            style={{
              gridTemplateColumns: columnTemplate,
              height: totalHeight,
            }}
          >
            {/* Hour Labels Column */}
            <div className="border-r border-border/50 bg-muted/5">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="relative border-b border-border/50"
                  style={{ height: plannerHourHeight }}
                >
                  <span className="-translate-y-1/2 absolute right-4 top-0 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                    {formatHourLabel(hour)}
                  </span>
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {days.map((day) => {
              const dayMeetings = getDayMeetings(meetings, day)
              const eventLayouts = getEventLayouts(dayMeetings)

              return (
                <div
                  key={day.toISOString()}
                  className="relative border-r border-border/50 last:border-r-0 hover:bg-muted/5 transition-colors"
                >
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="border-b border-border/50 border-dashed h-[80px]"
                    />
                  ))}

                  {eventLayouts.map((layout) => (
                    <div
                      key={layout.meeting.id}
                      onClick={() => onSelectMeeting(layout.meeting)}
                      className="absolute rounded-xl border-l-4 border-primary bg-primary/10 px-3 py-2 text-left shadow-lg backdrop-blur-sm overflow-hidden group hover:scale-[1.02] transition-all cursor-pointer z-10"
                      style={{
                        top: layout.top,
                        left: `${layout.left}%`,
                        width: `${layout.width - 1}%`,
                        height: layout.height - 4,
                        margin: '2px'
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="truncate text-xs font-black text-primary uppercase tracking-tight">
                          {layout.meeting.clientName}
                        </p>
                        <Users className="size-3 text-primary/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary/70">
                        <Clock className="size-2.5" />
                        {formatTimeLabel(new Date(layout.meeting.startsAt))}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function chunkIntoWeeks(days: Date[]) {
  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }
  return weeks
}

function getEventLayouts(meetings: Meeting[]) {
  const layouts: Array<{
    meeting: Meeting
    column: number
    totalColumns: number
    top: number
    height: number
  }> = []
  const active: Array<{ column: number; end: number }> = []
  let currentGroupIndexes: number[] = []
  let groupMaxColumns = 1

  const finalizeGroup = () => {
    currentGroupIndexes.forEach((index) => {
      layouts[index].totalColumns = groupMaxColumns
    })
    currentGroupIndexes = []
    groupMaxColumns = 1
  }

  sortMeetings(meetings).forEach((meeting) => {
    const meetingStart = new Date(meeting.startsAt).getTime()

    for (let index = active.length - 1; index >= 0; index -= 1) {
      if (active[index].end <= meetingStart) {
        active.splice(index, 1)
      }
    }

    if (!active.length && currentGroupIndexes.length) {
      finalizeGroup()
    }

    const usedColumns = new Set(active.map((item) => item.column))
    let column = 0
    while (usedColumns.has(column)) {
      column += 1
    }

    const top =
      (minutesSinceHourStart(new Date(meeting.startsAt), plannerStartHour) / 60) *
      plannerHourHeight
    const height =
      (durationInMinutes(meeting.startsAt, meeting.endsAt) / 60) * plannerHourHeight

    layouts.push({
      meeting,
      column,
      totalColumns: 1,
      top,
      height: Math.max(50, height),
    })

    currentGroupIndexes.push(layouts.length - 1)
    active.push({
      column,
      end: new Date(meeting.endsAt).getTime(),
    })
    groupMaxColumns = Math.max(groupMaxColumns, active.length)
  })

  if (currentGroupIndexes.length) {
    finalizeGroup()
  }

  return layouts.map((layout) => ({
    ...layout,
    left: (layout.column / layout.totalColumns) * 100,
    width: 100 / layout.totalColumns,
  }))
}

function formatHourLabel(hour: number) {
  const date = new Date()
  date.setHours(hour, 0, 0, 0)
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    hour12: true
  }).format(date)
}
