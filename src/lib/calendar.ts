import type { Meeting } from "@/lib/types"

export type CalendarView = "month" | "week" | "day"

export function addDays(date: Date, amount: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + amount)
  return nextDate
}

export function addMonths(date: Date, amount: number) {
  const nextDate = new Date(date)
  nextDate.setMonth(nextDate.getMonth() + amount)
  return nextDate
}

export function startOfDay(date: Date) {
  const nextDate = new Date(date)
  nextDate.setHours(0, 0, 0, 0)
  return nextDate
}

export function startOfWeek(date: Date) {
  const nextDate = startOfDay(date)
  const day = nextDate.getDay()
  const diff = day === 0 ? -6 : 1 - day
  return addDays(nextDate, diff)
}

export function endOfWeek(date: Date) {
  return addDays(startOfWeek(date), 6)
}

export function getWeekDays(date: Date) {
  const start = startOfWeek(date)
  return Array.from({ length: 7 }, (_, index) => addDays(start, index))
}

export function getMonthGridDays(date: Date) {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
  const gridStart = startOfWeek(firstDayOfMonth)
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index))
}

export function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  )
}

export function isSameMonth(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth()
}

export function formatToolbarLabel(view: CalendarView, date: Date) {
  if (view === "month") {
    return new Intl.DateTimeFormat(undefined, {
      month: "long",
      year: "numeric",
    }).format(date)
  }

  if (view === "day") {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  const start = startOfWeek(date)
  const end = endOfWeek(date)
  const startLabel = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(start)
  const endLabel = new Intl.DateTimeFormat(undefined, {
    month: start.getMonth() === end.getMonth() ? undefined : "short",
    day: "numeric",
    year: start.getFullYear() === end.getFullYear() ? undefined : "numeric",
  }).format(end)
  return `${startLabel} - ${endLabel}`
}

export function formatWeekdayLabel(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    day: "numeric",
  }).format(date)
}

export function formatMonthCellLabel(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
  }).format(date)
}

export function formatTimeLabel(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

export function formatRuleDayLabel(dayOfWeek: string) {
  return `${dayOfWeek.slice(0, 1)}${dayOfWeek.slice(1).toLowerCase()}`
}

export function shiftCalendarDate(view: CalendarView, date: Date, direction: number) {
  if (view === "month") {
    return addMonths(date, direction)
  }

  if (view === "week") {
    return addDays(date, direction * 7)
  }

  return addDays(date, direction)
}

export function getHoursRange(startHour = 6, endHour = 22) {
  return Array.from({ length: endHour - startHour }, (_, index) => startHour + index)
}

export function getMeetingDate(meeting: Meeting) {
  return new Date(meeting.startsAt)
}

export function sortMeetings(meetings: Meeting[]) {
  return [...meetings].sort(
    (left, right) =>
      new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime()
  )
}

export function getDayMeetings(meetings: Meeting[], date: Date) {
  return sortMeetings(
    meetings.filter((meeting) => isSameDay(new Date(meeting.startsAt), date))
  )
}

export function minutesSinceHourStart(date: Date, startHour: number) {
  return (date.getHours() - startHour) * 60 + date.getMinutes()
}

export function durationInMinutes(startsAt: string, endsAt: string) {
  return Math.max(
    15,
    Math.round((new Date(endsAt).getTime() - new Date(startsAt).getTime()) / 60000)
  )
}

export function describeRange(startsAt: string, endsAt: string) {
  return `${formatTimeLabel(new Date(startsAt))} - ${formatTimeLabel(new Date(endsAt))}`
}
