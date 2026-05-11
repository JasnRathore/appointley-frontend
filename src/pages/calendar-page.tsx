import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight, Grid2x2, Rows3, Timer } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import {
  addBlockedDate,
  deleteBlockedDate,
  getAvailabilityRules,
  getBlockedDates,
  getMeetings,
  replaceAvailabilityRules,
} from "@/lib/api"
import {
  describeRange,
  durationInMinutes,
  formatRuleDayLabel,
  formatTimeLabel,
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
  type CalendarView,
} from "@/lib/calendar"
import type { AvailabilityRuleInput, BlockedDate, DayOfWeek, Meeting } from "@/lib/types"

const weekdayOptions: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]

const plannerStartHour = 6
const plannerEndHour = 22
const plannerHourHeight = 72

export function CalendarPage() {
  const queryClient = useQueryClient()
  const [view, setView] = useState<CalendarView>("week")
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [rules, setRules] = useState<AvailabilityRuleInput[]>([])
  const [blockedStart, setBlockedStart] = useState("")
  const [blockedEnd, setBlockedEnd] = useState("")
  const [blockedReason, setBlockedReason] = useState("")

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

  const saveRulesMutation = useMutation({
    mutationFn: replaceAvailabilityRules,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["availability-rules"] })
      void queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] })
    },
  })
  const addBlockedMutation = useMutation({
    mutationFn: addBlockedDate,
    onSuccess: () => {
      setBlockedStart("")
      setBlockedEnd("")
      setBlockedReason("")
      void queryClient.invalidateQueries({ queryKey: ["blocked-dates"] })
    },
  })
  const deleteBlockedMutation = useMutation({
    mutationFn: deleteBlockedDate,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["blocked-dates"] })
    },
  })

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
  const selectedDayBlockedDates = blockedDates.filter((blockedDate) =>
    doesBlockedDateIntersectDay(blockedDate, selectedDate)
  )
  const activeRules = rules.filter((rule) => rule.active)
  const hours = getHoursRange(plannerStartHour, plannerEndHour)

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardDescription>Navigator</CardDescription>
                  <CardTitle>Jump to date</CardTitle>
                </div>
                <Button size="sm" variant="outline" onClick={() => setSelectedDate(new Date())}>
                  Today
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-1">
              <Calendar
                className="-mx-3"
                mode="single"
                month={selectedDate}
                selected={selectedDate}
                onMonthChange={setSelectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date)
                  }
                }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardDescription>Selected day</CardDescription>
                  <CardTitle>{formatToolbarLabel("day", selectedDate)}</CardTitle>
                </div>
                <Badge variant="secondary">{selectedDayMeetings.length} meetings</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedDayMeetings.slice(0, 5).map((meeting) => (
                <div
                  key={meeting.id}
                  className="rounded-3xl border border-border/60 bg-background/80 p-4"
                >
                  <p className="text-sm font-semibold">{meeting.clientName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {describeRange(meeting.startsAt, meeting.endsAt)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {meeting.bookingLinkTitle}
                  </p>
                </div>
              ))}
              {!selectedDayMeetings.length ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  No meetings on the selected day.
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardDescription>Availability</CardDescription>
                  <CardTitle>Coverage summary</CardTitle>
                </div>
                <Badge variant="outline">{activeRules.length} active</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeRules.slice(0, 6).map((rule, index) => (
                <div
                  key={`${rule.dayOfWeek}-${index}`}
                  className="rounded-3xl border border-border/60 bg-background/80 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">
                      {formatRuleDayLabel(rule.dayOfWeek)}
                    </p>
                    <Badge variant="secondary">{rule.slotDurationMinutes} min slots</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {rule.startTime} to {rule.endTime}
                  </p>
                </div>
              ))}
              {!activeRules.length ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  No active rules yet. Add weekly windows below to power slot
                  generation.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/60 pb-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <CardDescription>Planner</CardDescription>
                <CardTitle>{formatToolbarLabel(view, selectedDate)}</CardTitle>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon-sm"
                    variant="outline"
                    onClick={() =>
                      setSelectedDate(shiftCalendarDate(view, selectedDate, -1))
                    }
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setSelectedDate(new Date())}>
                    Today
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    onClick={() => setSelectedDate(shiftCalendarDate(view, selectedDate, 1))}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/70 p-1">
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
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
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
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardDescription>Scheduling engine</CardDescription>
                <CardTitle>Availability rules</CardTitle>
              </div>
              <Badge variant="secondary">{rules.length} configured</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {rules.map((rule, index) => (
              <div
                key={`${rule.dayOfWeek}-${index}`}
                className="grid gap-3 rounded-4xl border border-border/60 bg-background/80 p-4 md:grid-cols-[1fr_1fr_1fr_1fr_auto_auto]"
              >
                <select
                  className="h-11 rounded-3xl border border-border bg-background px-4 text-sm"
                  value={rule.dayOfWeek}
                  onChange={(event) =>
                    setRules((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, dayOfWeek: event.target.value as DayOfWeek }
                          : item
                      )
                    )
                  }
                >
                  {weekdayOptions.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <Input
                  type="time"
                  value={rule.startTime}
                  onChange={(event) =>
                    setRules((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, startTime: event.target.value }
                          : item
                      )
                    )
                  }
                />
                <Input
                  type="time"
                  value={rule.endTime}
                  onChange={(event) =>
                    setRules((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, endTime: event.target.value } : item
                      )
                    )
                  }
                />
                <Input
                  min={15}
                  step={15}
                  type="number"
                  value={rule.slotDurationMinutes}
                  onChange={(event) =>
                    setRules((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index
                          ? {
                              ...item,
                              slotDurationMinutes: Number(event.target.value),
                            }
                          : item
                      )
                    )
                  }
                />
                <Button
                  variant={rule.active ? "default" : "outline"}
                  onClick={() =>
                    setRules((current) =>
                      current.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, active: !item.active } : item
                      )
                    )
                  }
                  type="button"
                >
                  {rule.active ? "Active" : "Paused"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setRules((current) =>
                      current.filter((_, itemIndex) => itemIndex !== index)
                    )
                  }
                  type="button"
                >
                  Remove
                </Button>
              </div>
            ))}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() =>
                  setRules((current) => [
                    ...current,
                    {
                      dayOfWeek: "MONDAY",
                      startTime: "09:00",
                      endTime: "17:00",
                      slotDurationMinutes: 30,
                      active: true,
                    },
                  ])
                }
                type="button"
              >
                Add rule
              </Button>
              <Button onClick={() => saveRulesMutation.mutate(rules)} type="button">
                {saveRulesMutation.isPending ? "Saving..." : "Save rules"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardDescription>Exceptions</CardDescription>
                <CardTitle>Blocked windows</CardTitle>
              </div>
              <Badge variant="outline">{selectedDayBlockedDates.length} on day</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Input
                type="datetime-local"
                value={blockedStart}
                onChange={(event) => setBlockedStart(event.target.value)}
              />
              <Input
                type="datetime-local"
                value={blockedEnd}
                onChange={(event) => setBlockedEnd(event.target.value)}
              />
              <Input
                placeholder="Reason"
                value={blockedReason}
                onChange={(event) => setBlockedReason(event.target.value)}
              />
              <Button
                disabled={!blockedStart || !blockedEnd}
                onClick={() =>
                  addBlockedMutation.mutate({
                    startsAt: new Date(blockedStart).toISOString(),
                    endsAt: new Date(blockedEnd).toISOString(),
                    reason: blockedReason,
                  })
                }
                type="button"
              >
                {addBlockedMutation.isPending ? "Adding..." : "Add blocked window"}
              </Button>
            </div>

            <div className="space-y-3">
              {blockedDates.map((blockedDate) => (
                <div
                  key={blockedDate.id}
                  className="rounded-3xl border border-border/60 bg-background/80 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">
                        {new Date(blockedDate.startsAt).toLocaleString()}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        to {new Date(blockedDate.endsAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteBlockedMutation.mutate(blockedDate.id)}
                      type="button"
                    >
                      Delete
                    </Button>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {blockedDate.reason || "No reason provided"}
                  </p>
                </div>
              ))}
              {!blockedDates.length ? (
                <p className="text-sm leading-6 text-muted-foreground">
                  No blocked windows configured.
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

type PlannerViewButtonProps = {
  active: boolean
  icon: typeof Timer
  label: string
  onClick: () => void
}

function PlannerViewButton({
  active,
  icon: Icon,
  label,
  onClick,
}: PlannerViewButtonProps) {
  return (
    <Button
      size="sm"
      variant={active ? "default" : "ghost"}
      onClick={onClick}
      type="button"
    >
      <Icon className="size-4" />
      {label}
    </Button>
  )
}

type MonthPlannerProps = {
  blockedDates: BlockedDate[]
  meetings: Meeting[]
  selectedDate: Date
  onSelectDate: (date: Date) => void
}

function MonthPlanner({
  blockedDates,
  meetings,
  selectedDate,
  onSelectDate,
}: MonthPlannerProps) {
  const weeks = chunkIntoWeeks(getMonthGridDays(selectedDate))

  return (
    <div className="grid min-h-[720px] grid-rows-[auto_1fr]">
      <div className="grid grid-cols-7 border-b border-border/60 bg-muted/40">
        {getWeekDays(selectedDate).map((day) => (
          <div
            key={day.toISOString()}
            className="px-4 py-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground"
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
              const blockedCount = blockedDates.filter((blockedDate) =>
                doesBlockedDateIntersectDay(blockedDate, day)
              ).length

              return (
                <button
                  key={day.toISOString()}
                  className="min-h-32 border-r border-b border-border/60 px-3 py-3 text-left transition-colors hover:bg-muted/35"
                  onClick={() => onSelectDate(day)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={[
                        "inline-flex size-9 items-center justify-center rounded-2xl text-sm font-semibold",
                        isSameDay(day, selectedDate)
                          ? "bg-primary text-primary-foreground"
                          : isSameDay(day, new Date())
                            ? "bg-primary/10 text-primary"
                            : "",
                      ].join(" ")}
                    >
                      {day.getDate()}
                    </span>
                    {!isSameMonth(day, selectedDate) ? (
                      <Badge variant="outline">Adj</Badge>
                    ) : null}
                  </div>
                  <div className="mt-3 space-y-2">
                    {dayMeetings.slice(0, 3).map((meeting) => (
                      <div
                        key={meeting.id}
                        className="rounded-2xl bg-primary/10 px-2.5 py-2 text-xs font-medium text-primary"
                      >
                        <div>{formatTimeLabel(new Date(meeting.startsAt))}</div>
                        <div className="truncate">{meeting.clientName}</div>
                      </div>
                    ))}
                    {dayMeetings.length > 3 ? (
                      <p className="text-xs font-medium text-muted-foreground">
                        +{dayMeetings.length - 3} more
                      </p>
                    ) : null}
                    {blockedCount > 0 ? (
                      <p className="text-xs text-muted-foreground">
                        {blockedCount} blocked window{blockedCount > 1 ? "s" : ""}
                      </p>
                    ) : null}
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

type TimePlannerProps = {
  blockedDates: BlockedDate[]
  days: Date[]
  hours: number[]
  meetings: Meeting[]
  selectedDate: Date
  onSelectDate: (date: Date) => void
}

function TimePlanner({
  blockedDates,
  days,
  hours,
  meetings,
  selectedDate,
  onSelectDate,
}: TimePlannerProps) {
  const columnTemplate = `72px repeat(${days.length}, minmax(220px, 1fr))`
  const totalHeight = hours.length * plannerHourHeight

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[820px]">
        <div
          className="grid border-b border-border/60 bg-muted/35"
          style={{ gridTemplateColumns: columnTemplate }}
        >
          <div className="border-r border-border/60 px-3 py-3" />
          {days.map((day) => {
            const dayMeetings = getDayMeetings(meetings, day)

            return (
              <button
                key={day.toISOString()}
                className="border-r border-border/60 px-4 py-3 text-left transition-colors hover:bg-muted/30"
                onClick={() => onSelectDate(day)}
                type="button"
              >
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {formatWeekdayLabel(day)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {dayMeetings.length} meeting{dayMeetings.length === 1 ? "" : "s"}
                </p>
                {isSameDay(day, selectedDate) ? (
                  <Badge className="mt-3" variant="default">
                    Focus
                  </Badge>
                ) : null}
              </button>
            )
          })}
        </div>

        <div
          className="grid"
          style={{
            gridTemplateColumns: columnTemplate,
            height: totalHeight,
          }}
        >
          <div className="relative border-r border-border/60 bg-background/80">
            {hours.map((hour) => (
              <div
                key={hour}
                className="relative border-b border-dashed border-border/60"
                style={{ height: plannerHourHeight }}
              >
                <span className="-translate-y-1/2 absolute left-3 top-0 text-xs font-medium text-muted-foreground">
                  {formatHourLabel(hour)}
                </span>
              </div>
            ))}
          </div>

          {days.map((day) => {
            const dayMeetings = getDayMeetings(meetings, day)
            const blockedLayouts = getBlockedLayouts(day, blockedDates)
            const eventLayouts = getEventLayouts(dayMeetings)
            const nowOffset = getCurrentTimeOffset(day)

            return (
              <div
                key={day.toISOString()}
                className="relative border-r border-border/60 bg-background/70"
              >
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="border-b border-dashed border-border/60"
                    style={{ height: plannerHourHeight }}
                  />
                ))}

                {blockedLayouts.map((blockedLayout) => (
                  <div
                    key={blockedLayout.id}
                    className="absolute inset-x-2 rounded-3xl border border-amber-500/30 bg-amber-500/10"
                    style={{
                      top: blockedLayout.top,
                      height: blockedLayout.height,
                    }}
                  >
                    <div className="px-3 py-2 text-xs font-medium text-amber-800">
                      {blockedLayout.reason || "Blocked"}
                    </div>
                  </div>
                ))}

                {eventLayouts.map((layout) => (
                  <div
                    key={layout.meeting.id}
                    className="absolute rounded-3xl border border-primary/20 bg-primary/12 px-3 py-2 text-left shadow-sm"
                    style={{
                      top: layout.top,
                      left: `calc(${layout.left}% + 4px)`,
                      width: `calc(${layout.width}% - 8px)`,
                      height: layout.height,
                    }}
                  >
                    <p className="truncate text-sm font-semibold text-primary">
                      {layout.meeting.clientName}
                    </p>
                    <p className="mt-1 text-xs text-primary/80">
                      {formatTimeLabel(new Date(layout.meeting.startsAt))} -{" "}
                      {formatTimeLabel(new Date(layout.meeting.endsAt))}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {layout.meeting.bookingLinkTitle}
                    </p>
                  </div>
                ))}

                {nowOffset !== null ? (
                  <div
                    className="absolute inset-x-0 z-10 flex items-center"
                    style={{ top: nowOffset }}
                  >
                    <div className="ml-1 size-2 rounded-full bg-destructive" />
                    <div className="h-px flex-1 bg-destructive" />
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function chunkIntoWeeks(days: Date[]) {
  const weeks: Date[][] = []

  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7))
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
