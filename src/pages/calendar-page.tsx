import { useQuery } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight, Grid2x2, Rows3, Timer, Settings2, ShieldAlert } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  getAvailabilityRules,
  getBlockedDates,
  getMeetings,
} from "@/lib/api"
import {
  describeRange,
  durationInMinutes,
  formatToolbarLabel,
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
  startOfDay,
  formatTimeLabel,
  type CalendarView,
} from "@/lib/calendar"
import type { AvailabilityRuleInput, BlockedDate, Meeting } from "@/lib/types"
import { AvailabilityRulesDialog } from "@/components/layout/availability-rules-dialog"
import { BlockedWindowsDialog } from "@/components/layout/blocked-windows-dialog"

const plannerStartHour = 6
const plannerEndHour = 22
const plannerHourHeight = 72

export function CalendarPage() {
  const [view, setView] = useState<CalendarView>("week")
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [rules, setRules] = useState<AvailabilityRuleInput[]>([])
  const [showRulesDialog, setShowRulesDialog] = useState(false)
  const [showBlockedDialog, setShowBlockedDialog] = useState(false)

  const rulesQuery = useQuery({
    queryKey: ["availability-rules"],
    queryFn: getAvailabilityRules,
  })
  const blockedDatesQuery = useQuery({
    queryKey: ["blocked-dates"],
    queryFn: getBlockedDates,
  })
  const meetingsQuery = useQuery({
    queryKey: ["meetings"],
    queryFn: getMeetings,
  })

  useEffect(() => {
    if (rulesQuery.data) {
      setRules(
        rulesQuery.data.map((rule) => ({
          dayOfWeek: rule.dayOfWeek,
          startTime: rule.startTime,
          endTime: rule.endTime,
          slotDurationMinutes: rule.slotDurationMinutes,
          active: rule.active,
        }))
      )
    }
  }, [rulesQuery.data])

  const scheduledMeetings = useMemo(
    () =>
      sortMeetings(
        (meetingsQuery.data ?? []).filter((meeting) => meeting.status === "SCHEDULED")
      ),
    [meetingsQuery.data]
  )
  const blockedDates = blockedDatesQuery.data ?? []
  const plannerDays =
    view === "day" ? [selectedDate] : view === "week" ? getWeekDays(selectedDate) : []
  const selectedDayMeetings = getDayMeetings(scheduledMeetings, selectedDate)
  const activeRules = rules.filter((rule) => rule.active)
  const hours = getHoursRange(plannerStartHour, plannerEndHour)

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col gap-4 overflow-hidden">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between px-4 pt-4">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold tracking-tight">
            {formatToolbarLabel(view, selectedDate)}
          </h2>
          <div className="flex items-center gap-1 rounded-md border p-1 bg-muted/20">
            <Button
              size="icon"
              variant="ghost"
              className="size-8"
              onClick={() => setSelectedDate(shiftCalendarDate(view, selectedDate, -1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button 
              variant="ghost" 
              className="h-8 px-3 text-xs font-medium"
              onClick={() => setSelectedDate(new Date())}
            >
              Today
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="size-8"
              onClick={() => setSelectedDate(shiftCalendarDate(view, selectedDate, 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-md border p-1 bg-muted/20 mr-4">
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
          <Button variant="outline" size="sm" onClick={() => setShowRulesDialog(true)}>
            <Settings2 className="mr-2 size-4" /> Availability
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowBlockedDialog(true)}>
            <ShieldAlert className="mr-2 size-4" /> Blocked
          </Button>
        </div>
      </div>

      <div className="grid flex-1 gap-4 overflow-hidden xl:grid-cols-[280px_1fr]">
        <aside className="hidden xl:flex flex-col gap-6 overflow-y-auto border-r px-4 py-2">
          <div className="rounded-lg border bg-card">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="p-3"
            />
          </div>

          <div className="space-y-4">
            <div className="px-2">
              <h3 className="text-sm font-semibold mb-3">Upcoming Today</h3>
              <div className="space-y-3">
                {selectedDayMeetings.slice(0, 3).map((meeting) => (
                  <div key={meeting.id} className="rounded-md border p-3 bg-muted/10">
                    <p className="text-xs font-semibold truncate">{meeting.clientName}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {describeRange(meeting.startsAt, meeting.endsAt)}
                    </p>
                  </div>
                ))}
                {selectedDayMeetings.length === 0 && (
                  <p className="text-xs text-muted-foreground italic px-1">No meetings today.</p>
                )}
              </div>
            </div>

            <div className="px-2">
              <h3 className="text-sm font-semibold mb-3">Availability</h3>
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {activeRules.length} weekly windows active.
                </p>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="h-auto p-0 text-xs"
                  onClick={() => setShowRulesDialog(true)}
                >
                  Edit availability rules
                </Button>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-hidden rounded-tl-xl border-l border-t bg-card shadow-sm">
          <div className="h-full overflow-y-auto">
            {view === "month" ? (
              <MonthPlanner
                blockedDates={blockedDates}
                meetings={scheduledMeetings}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            ) : (
              <TimePlanner
                blockedDates={blockedDates}
                days={plannerDays}
                hours={hours}
                meetings={scheduledMeetings}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            )}
          </div>
        </main>
      </div>

      <AvailabilityRulesDialog 
        open={showRulesDialog} 
        onOpenChange={setShowRulesDialog} 
        initialRules={rules}
      />
      <BlockedWindowsDialog 
        open={showBlockedDialog} 
        onOpenChange={setShowBlockedDialog} 
      />
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
  icon: any
  label: string
  onClick: () => void
}) {
  return (
    <Button
      size="sm"
      variant={active ? "secondary" : "ghost"}
      className="h-8 px-3 text-xs"
      onClick={onClick}
    >
      <Icon className="mr-2 size-3" />
      {label}
    </Button>
  )
}

function MonthPlanner({
  blockedDates,
  meetings,
  selectedDate,
  onSelectDate,
}: any) {
  const weeks = chunkIntoWeeks(getMonthGridDays(selectedDate))

  return (
    <div className="grid h-full grid-rows-[auto_1fr]">
      <div className="grid grid-cols-7 border-b bg-muted/10">
        {getWeekDays(selectedDate).map((day) => (
          <div
            key={day.toISOString()}
            className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center"
          >
            {formatWeekdayLabel(day).split(" ")[0]}
          </div>
        ))}
      </div>
      <div className="grid grid-rows-6">
        {weeks.map((week: any) => (
          <div key={week[0].toISOString()} className="grid grid-cols-7">
            {week.map((day: any) => {
              const dayMeetings = getDayMeetings(meetings, day)
              const isToday = isSameDay(day, new Date())
              const isSelected = isSameDay(day, selectedDate)
              const currentMonth = isSameMonth(day, selectedDate)

              return (
                <button
                  key={day.toISOString()}
                  className={`min-h-[120px] border-r border-b p-2 text-left transition-colors hover:bg-muted/5 ${!currentMonth ? "opacity-40" : ""}`}
                  onClick={() => onSelectDate(day)}
                >
                  <div className="flex justify-center mb-2">
                    <span
                      className={`flex size-7 items-center justify-center rounded-full text-xs font-semibold ${isSelected ? "bg-primary text-primary-foreground" : isToday ? "bg-primary/10 text-primary" : ""}`}
                    >
                      {day.getDate()}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {dayMeetings.slice(0, 2).map((meeting: any) => (
                      <div
                        key={meeting.id}
                        className="truncate rounded px-2 py-1 text-[10px] font-medium bg-primary/10 text-primary border-l-2 border-primary"
                      >
                        {meeting.clientName}
                      </div>
                    ))}
                    {dayMeetings.length > 2 && (
                      <p className="text-[10px] text-muted-foreground px-2">
                        +{dayMeetings.length - 2} more
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
  blockedDates,
  days,
  hours,
  meetings,
  selectedDate,
  onSelectDate,
}: any) {
  const columnTemplate = `60px repeat(${days.length}, 1fr)`
  const totalHeight = hours.length * plannerHourHeight

  return (
    <div className="h-full overflow-x-auto">
      <div className="min-w-[800px] h-full flex flex-col">
        <div
          className="grid border-b sticky top-0 bg-card z-20"
          style={{ gridTemplateColumns: columnTemplate }}
        >
          <div className="border-r" />
          {days.map((day: any) => (
            <div
              key={day.toISOString()}
              className="px-4 py-3 text-center border-r last:border-0"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {formatWeekdayLabel(day).split(" ")[0]}
              </p>
              <p className={`mt-1 text-lg font-semibold ${isSameDay(day, new Date()) ? "text-primary" : ""}`}>
                {day.getDate()}
              </p>
            </div>
          ))}
        </div>

        <div className="flex-1 relative">
          <div
            className="grid absolute inset-0"
            style={{
              gridTemplateColumns: columnTemplate,
              height: totalHeight,
            }}
          >
            <div className="border-r bg-muted/5">
              {hours.map((hour: any) => (
                <div
                  key={hour}
                  className="relative border-b"
                  style={{ height: plannerHourHeight }}
                >
                  <span className="-translate-y-1/2 absolute right-2 top-0 text-[10px] font-medium text-muted-foreground">
                    {formatHourLabel(hour)}
                  </span>
                </div>
              ))}
            </div>

            {days.map((day: any) => {
              const dayMeetings = getDayMeetings(meetings, day)
              const eventLayouts = getEventLayouts(dayMeetings)

              return (
                <div
                  key={day.toISOString()}
                  className="relative border-r last:border-0"
                >
                  {hours.map((hour: any) => (
                    <div
                      key={hour}
                      className="border-b border-dashed h-[72px]"
                    />
                  ))}

                  {eventLayouts.map((layout: any) => (
                    <div
                      key={layout.meeting.id}
                      className="absolute rounded-md border-l-4 border-primary bg-primary/10 px-2 py-1.5 text-left shadow-sm overflow-hidden"
                      style={{
                        top: layout.top,
                        left: `${layout.left}%`,
                        width: `${layout.width}%`,
                        height: layout.height,
                      }}
                    >
                      <p className="truncate text-[11px] font-bold text-primary">
                        {layout.meeting.clientName}
                      </p>
                      <p className="text-[9px] text-primary/80">
                        {formatTimeLabel(new Date(layout.meeting.startsAt))}
                      </p>
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
      height: Math.max(48, height),
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

function getBlockedLayouts(day: Date, blockedDates: BlockedDate[]) {
  const dayStart = startOfDay(day)
  const viewStart = new Date(dayStart)
  viewStart.setHours(plannerStartHour, 0, 0, 0)
  const viewEnd = new Date(dayStart)
  viewEnd.setHours(plannerEndHour, 0, 0, 0)

  return blockedDates
    .filter((blockedDate) => doesBlockedDateIntersectDay(blockedDate, day))
    .map((blockedDate) => {
      const startsAt = new Date(blockedDate.startsAt)
      const endsAt = new Date(blockedDate.endsAt)
      const clippedStart = startsAt > viewStart ? startsAt : viewStart
      const clippedEnd = endsAt < viewEnd ? endsAt : viewEnd
      const minutesFromTop =
        (clippedStart.getHours() - plannerStartHour) * 60 + clippedStart.getMinutes()
      const durationMinutes = Math.max(
        20,
        (clippedEnd.getTime() - clippedStart.getTime()) / 60000
      )

      return {
        id: blockedDate.id,
        top: (minutesFromTop / 60) * plannerHourHeight,
        height: (durationMinutes / 60) * plannerHourHeight,
        reason: blockedDate.reason,
      }
    })
}

function doesBlockedDateIntersectDay(blockedDate: BlockedDate, day: Date) {
  const dayStart = startOfDay(day)
  const nextDay = new Date(dayStart)
  nextDay.setDate(nextDay.getDate() + 1)
  const blockedStart = new Date(blockedDate.startsAt)
  const blockedEnd = new Date(blockedDate.endsAt)

  return blockedStart < nextDay && blockedEnd > dayStart
}

function formatHourLabel(hour: number) {
  const date = new Date()
  date.setHours(hour, 0, 0, 0)
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
  }).format(date)
}

function getCurrentTimeOffset(day: Date) {
  const now = new Date()
  if (!isSameDay(now, day)) {
    return null
  }

  const offset = minutesSinceHourStart(now, plannerStartHour)
  const maxOffset = (plannerEndHour - plannerStartHour) * 60
  if (offset < 0 || offset > maxOffset) {
    return null
  }

  return (offset / 60) * plannerHourHeight
}
