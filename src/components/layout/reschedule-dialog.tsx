import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format, isSameDay, parseISO } from "date-fns"
import { CalendarClock, CheckCircle2, ChevronRight, Clock, Globe, ArrowLeft } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { getPublicBookingLink, rescheduleMeeting } from "@/lib/api"
import type { Meeting } from "@/lib/types"
import { cn } from "@/lib/utils"

export function RescheduleDialog({
  open,
  onOpenChange,
  meeting,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  meeting: Meeting | null
}) {
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined)
  const [selectedSlot, setSelectedSlot] = React.useState("")

  const bookingQuery = useQuery({
    queryKey: ["public-booking-link", meeting?.bookingLinkToken],
    queryFn: () => getPublicBookingLink(meeting!.bookingLinkToken),
    enabled: !!meeting,
  })

  const mutation = useMutation({
    mutationFn: (newStartsAt: string) => rescheduleMeeting(meeting!.id, { newStartsAt }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["meetings"] })
      void queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] })
      onOpenChange(false)
      setSelectedDate(undefined)
      setSelectedSlot("")
    },
  })

  const slotsByDate = React.useMemo(() => {
    const slots = bookingQuery.data?.slots ?? []
    const groups: Record<string, typeof slots> = {}
    
    slots.forEach(slot => {
      const date = format(parseISO(slot.startsAt), "yyyy-MM-dd")
      if (!groups[date]) groups[date] = []
      groups[date].push(slot)
    })
    
    return groups
  }, [bookingQuery.data?.slots])

  const availableDates = React.useMemo(() => {
    return Object.keys(slotsByDate).map(dateStr => parseISO(dateStr))
  }, [slotsByDate])

  const displaySlots = React.useMemo(() => {
    if (!selectedDate) return []
    const dateStr = format(selectedDate, "yyyy-MM-dd")
    return slotsByDate[dateStr] ?? []
  }, [selectedDate, slotsByDate])

  if (!meeting) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-none ring-1 ring-border/50 shadow-2xl">
        <DialogHeader className="p-8 pb-4 bg-muted/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarClock className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Reschedule Meeting</DialogTitle>
              <DialogDescription>
                Pick a new date and time for your meeting with <span className="font-bold text-foreground">{meeting.clientName}</span>.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid md:grid-cols-2 divide-x">
          <div className="p-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">1</div>
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select New Date</Label>
            </div>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date)
                  setSelectedSlot("")
                }}
                disabled={(date) => {
                  const isPast = date < new Date(new Date().setHours(0,0,0,0))
                  const isAvailable = availableDates.some(avail => isSameDay(avail, date))
                  return isPast || !isAvailable
                }}
                className="rounded-xl border border-border/50 bg-card/80 shadow-sm"
              />
            </div>
          </div>

          <div className="p-8 bg-muted/5">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">2</div>
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Select New Time</Label>
            </div>
            
            <div className="space-y-2 h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {displaySlots.map((slot) => (
                <Button
                  key={slot.startsAt}
                  variant={selectedSlot === slot.startsAt ? "default" : "outline"}
                  className={cn(
                    "w-full h-12 justify-between px-4 transition-all text-sm",
                    selectedSlot === slot.startsAt && "ring-2 ring-primary/20 scale-[1.02]"
                  )}
                  onClick={() => setSelectedSlot(slot.startsAt)}
                >
                  <span className="font-semibold tracking-tight">
                    {format(parseISO(slot.startsAt), "h:mm a")}
                  </span>
                  {selectedSlot === slot.startsAt && <CheckCircle2 className="size-4" />}
                </Button>
              ))}
              {!selectedDate && (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-30">
                  <p className="text-sm font-medium">Please select a date</p>
                </div>
              )}
              {selectedDate && displaySlots.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-30">
                  <p className="text-sm font-medium">No slots available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="p-8 pt-4 bg-muted/20 border-t items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Globe className="size-3" />
            <span>{bookingQuery.data?.timezone ?? "Organizer Timezone"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="font-semibold">
              Cancel
            </Button>
            <Button 
              onClick={() => mutation.mutate(selectedSlot)} 
              disabled={mutation.isPending || !selectedSlot}
              className="px-8 font-bold shadow-lg shadow-primary/20 h-11"
            >
              {mutation.isPending ? "Rescheduling..." : "Confirm New Time"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Label({ className, children }: { className?: string, children: React.ReactNode }) {
  return <span className={cn("block", className)}>{children}</span>
}
