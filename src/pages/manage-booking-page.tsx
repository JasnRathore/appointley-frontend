import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CalendarClock, CheckCircle2, Clock, Globe, XCircle, ExternalLink, ArrowLeft } from "lucide-react"
import * as React from "react"
import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { format, isSameDay, parseISO } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { getPublicMeeting, cancelPublicMeeting, reschedulePublicMeeting, getPublicBookingLink } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

export function ManageBookingPage() {
  const { meetingId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<"view" | "reschedule">("view")
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedSlot, setSelectedSlot] = useState("")

  const meetingQuery = useQuery({
    queryKey: ["public-meeting", meetingId],
    queryFn: () => getPublicMeeting(meetingId!),
    enabled: !!meetingId,
  })

  const bookingLinkQuery = useQuery({
    queryKey: ["public-booking-link", meetingQuery.data?.bookingLinkToken],
    queryFn: () => getPublicBookingLink(meetingQuery.data!.bookingLinkToken),
    enabled: !!meetingQuery.data?.bookingLinkToken,
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelPublicMeeting(meetingId!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["public-meeting", meetingId] })
    },
  })

  const rescheduleMutation = useMutation({
    mutationFn: (newStartsAt: string) => reschedulePublicMeeting(meetingId!, { newStartsAt }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["public-meeting", meetingId] })
      setMode("view")
      setSelectedDate(undefined)
      setSelectedSlot("")
    },
  })

  const slotsByDate = React.useMemo(() => {
    const slots = bookingLinkQuery.data?.slots ?? []
    const groups: Record<string, typeof slots> = {}
    
    slots.forEach(slot => {
      const date = format(parseISO(slot.startsAt), "yyyy-MM-dd")
      if (!groups[date]) groups[date] = []
      groups[date].push(slot)
    })
    
    return groups
  }, [bookingLinkQuery.data?.slots])

  const availableDates = React.useMemo(() => {
    return Object.keys(slotsByDate).map(dateStr => parseISO(dateStr))
  }, [slotsByDate])

  const displaySlots = React.useMemo(() => {
    if (!selectedDate) return []
    const dateStr = format(selectedDate, "yyyy-MM-dd")
    return slotsByDate[dateStr] ?? []
  }, [selectedDate, slotsByDate])

  if (meetingQuery.isLoading) {
    return <div className="flex h-svh items-center justify-center">Loading...</div>
  }

  const meeting = meetingQuery.data
  if (!meeting) return <div className="flex h-svh items-center justify-center">Meeting not found.</div>

  if (mode === "reschedule") {
    return (
      <div className="min-h-svh bg-background px-4 py-20">
        <div className="mx-auto max-w-[800px]">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black mb-4">Reschedule Appointment</h1>
            <p className="text-muted-foreground text-lg">Pick a new time for your session with {meeting.bookingLinkTitle}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 border-none ring-1 ring-border/50 shadow-xl">
               <div className="text-center mb-6">
                 <Label className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">Step 1</Label>
                 <h2 className="text-xl font-bold">Select Date</h2>
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
                   className="rounded-xl"
                 />
               </div>
            </Card>

            <Card className="p-6 border-none ring-1 ring-border/50 shadow-xl bg-muted/5">
               <div className="text-center mb-6">
                 <Label className="text-xs font-bold uppercase tracking-widest text-primary mb-2 block">Step 2</Label>
                 <h2 className="text-xl font-bold">Select Time</h2>
               </div>
               <div className="space-y-3 h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                 {displaySlots.map((slot) => (
                   <Button
                     key={slot.startsAt}
                     variant={selectedSlot === slot.startsAt ? "default" : "outline"}
                     className={cn(
                       "w-full h-14 text-lg font-bold rounded-xl justify-between px-6",
                       selectedSlot === slot.startsAt && "ring-4 ring-primary/20 scale-[1.02]"
                     )}
                     onClick={() => setSelectedSlot(slot.startsAt)}
                   >
                     {format(parseISO(slot.startsAt), "h:mm a")}
                     {selectedSlot === slot.startsAt && <CheckCircle2 className="size-5" />}
                   </Button>
                 ))}
                 {!selectedDate && (
                   <p className="text-center text-muted-foreground py-20 italic">Select a date first</p>
                 )}
                 {selectedDate && displaySlots.length === 0 && (
                   <p className="text-center text-muted-foreground py-20 italic">No times available</p>
                 )}
               </div>
            </Card>
          </div>

          <div className="mt-12 flex items-center justify-between gap-6">
             <Button variant="ghost" size="lg" onClick={() => setMode("view")} className="font-bold">
               <ArrowLeft className="mr-2 size-4" /> Back
             </Button>
             <Button 
               size="lg" 
               className="h-14 px-12 text-lg font-black rounded-xl shadow-2xl shadow-primary/20"
               disabled={!selectedSlot || rescheduleMutation.isPending}
               onClick={() => rescheduleMutation.mutate(selectedSlot)}
             >
               {rescheduleMutation.isPending ? "Rescheduling..." : "Confirm New Time"}
             </Button>
          </div>
        </div>
      </div>
    )
  }

  const isCancelled = meeting.status === "CANCELLED"

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl"
      >
        <Card className="shadow-2xl border-none ring-1 ring-border/50 overflow-hidden">
          <CardHeader className={cn("text-center p-10", isCancelled ? "bg-destructive/5" : "bg-primary/5")}>
            <div className={cn(
              "mx-auto mb-6 flex size-20 items-center justify-center rounded-full",
              isCancelled ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary shadow-inner"
            )}>
              {isCancelled ? <XCircle className="size-10" /> : <CheckCircle2 className="size-10" />}
            </div>
            <CardTitle className="text-4xl font-black tracking-tight">
              {isCancelled ? "Meeting Cancelled" : "You're all set!"}
            </CardTitle>
            <CardDescription className="text-lg mt-2 font-medium">
              {isCancelled ? "This appointment has been removed from the schedule." : "Your appointment is confirmed."}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-10">
            {!isCancelled && (
              <div className="rounded-3xl bg-muted/30 p-8 mb-10 border border-border/50 shadow-inner">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-background shadow-sm border border-border/50">
                      <CalendarClock className="size-6 text-primary" />
                    </div>
                    <div>
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Date</Label>
                      <span className="font-bold text-2xl">{format(parseISO(meeting.startsAt), "MMMM d, yyyy")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-background shadow-sm border border-border/50">
                      <Clock className="size-6 text-primary" />
                    </div>
                    <div>
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Time</Label>
                      <span className="font-bold text-2xl">{format(parseISO(meeting.startsAt), "h:mm a")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-background shadow-sm border border-border/50">
                      <Globe className="size-6 text-primary" />
                    </div>
                    <div>
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Timezone</Label>
                      <span className="font-bold text-lg opacity-80">{meeting.timezone}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
               {isCancelled ? (
                 <Button className="w-full h-14 text-lg font-bold rounded-2xl" onClick={() => navigate(`/book/${meeting.bookingLinkToken}`)}>
                    Book a New Meeting
                 </Button>
               ) : (
                 <div className="grid grid-cols-2 gap-4">
                   <Button variant="outline" className="h-14 text-lg font-bold rounded-2xl gap-2" onClick={() => setMode("reschedule")}>
                      <ExternalLink className="size-5" /> Reschedule
                   </Button>
                   <Button 
                    variant="outline" 
                    className="h-14 text-lg font-bold rounded-2xl gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={cancelMutation.isPending}
                    onClick={() => cancelMutation.mutate()}
                   >
                      <XCircle className="size-5" /> {cancelMutation.isPending ? "Canceling..." : "Cancel"}
                   </Button>
                 </div>
               )}
               <p className="text-center text-sm text-muted-foreground pt-4">
                 Need help? Contact <span className="font-bold text-foreground">{meeting.clientEmail}</span>
               </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
