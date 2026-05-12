import { useMutation, useQuery } from "@tanstack/react-query"
import { CalendarClock, CheckCircle2, ChevronRight, Clock, Globe, ArrowLeft, User, Mail, MessageSquare, ExternalLink } from "lucide-react"
import * as React from "react"
import { useMemo, useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { bookPublicMeeting, getPublicBookingLink } from "@/lib/api"
import { cn } from "@/lib/utils"

export function BookingPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const safeToken = useMemo(() => token ?? "unknown-link", [token])
  
  const [step, setStep] = useState(1) // 1: Date, 2: Time, 3: Details
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedSlot, setSelectedSlot] = useState("")
  const [clientName, setClientName] = useState("")
  const [clientEmail, setClientEmail] = useState("")
  const [notes, setNotes] = useState("")

  const bookingQuery = useQuery({
    queryKey: ["public-booking-link", safeToken],
    queryFn: () => getPublicBookingLink(safeToken),
    enabled: Boolean(token),
  })

  const bookingMutation = useMutation({
    mutationFn: () =>
      bookPublicMeeting(safeToken, {
        clientName,
        clientEmail,
        startsAt: selectedSlot,
        notes,
      }),
  })

  const slotsByDate = useMemo(() => {
    const slots = bookingQuery.data?.slots ?? []
    const groups: Record<string, typeof slots> = {}
    
    slots.forEach(slot => {
      const date = format(parseISO(slot.startsAt), "yyyy-MM-dd")
      if (!groups[date]) groups[date] = []
      groups[date].push(slot)
    })
    
    return groups
  }, [bookingQuery.data?.slots])

  const availableDates = useMemo(() => {
    return Object.keys(slotsByDate).map(dateStr => parseISO(dateStr))
  }, [slotsByDate])

  const displaySlots = useMemo(() => {
    if (!selectedDate) return []
    const dateStr = format(selectedDate, "yyyy-MM-dd")
    return slotsByDate[dateStr] ?? []
  }, [selectedDate, slotsByDate])

  React.useEffect(() => {
    if (bookingQuery.data?.recipientEmail) {
      setClientEmail(bookingQuery.data.recipientEmail)
    }
  }, [bookingQuery.data])

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      setSelectedSlot("")
      setStep(2)
    }
  }

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot)
    setStep(3)
  }

  if (bookingMutation.isSuccess) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <Card className="w-full max-w-md text-center shadow-2xl border-none ring-1 ring-border/50">
            <CardHeader className="pb-2">
              <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CheckCircle2 className="size-10" />
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight">Confirmed!</CardTitle>
              <CardDescription className="text-lg mt-2 font-medium">
                Your appointment is scheduled.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              <div className="rounded-2xl bg-muted/50 p-6 mb-8 text-left border border-border/50 shadow-inner">
                <div className="flex items-center gap-4 mb-4">
                  <CalendarClock className="size-6 text-primary" />
                  <span className="font-bold text-xl">{format(parseISO(selectedSlot), "MMMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Clock className="size-6 text-primary" />
                  <span className="font-bold text-xl">{format(parseISO(selectedSlot), "h:mm a")}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                We&apos;ve sent a calendar invitation and confirmation details to <span className="font-bold text-foreground">{clientEmail}</span>.
              </p>
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  className="w-full h-14 text-lg font-bold rounded-2xl gap-2"
                  onClick={() => navigate(`/manage-booking/${bookingMutation.data.id}`)}
                >
                  <ExternalLink className="size-5" /> Manage Appointment
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-background px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[800px]">
        {/* Header - Always Visible */}
        <div className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-black tracking-tight text-foreground lg:text-6xl leading-tight">
              {bookingQuery.data?.title ?? "Book a Session"}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-4 leading-relaxed">
              {bookingQuery.data?.description ??
                "Schedule a time for our upcoming meeting."}
            </p>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={cn(
                "size-10 rounded-full flex items-center justify-center font-bold transition-all duration-500",
                step === s ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110" : 
                step > s ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {step > s ? <CheckCircle2 className="size-5" /> : s}
              </div>
              {s < 3 && (
                <div className={cn(
                  "w-12 h-1 mx-2 rounded-full transition-colors duration-500",
                  step > s ? "bg-primary/30" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {/* Step 1: Date */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="flex justify-center"
              >
                <Card className="w-full max-w-[450px] shadow-2xl border-none ring-1 ring-border/50 p-8">
                  <div className="text-center mb-8">
                    <Label className="text-xs font-bold uppercase tracking-[0.2em] text-primary block mb-2">Step 1</Label>
                    <h2 className="text-2xl font-bold">Pick a Date</h2>
                  </div>
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      disabled={(date) => {
                        const isPast = date < new Date(new Date().setHours(0,0,0,0))
                        const isAvailable = availableDates.some(avail => isSameDay(avail, date))
                        return isPast || !isAvailable
                      }}
                      className="rounded-2xl border-none shadow-sm"
                    />
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Time */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="flex flex-col items-center"
              >
                <Card className="w-full max-w-[500px] shadow-2xl border-none ring-1 ring-border/50 p-8">
                  <div className="flex items-center justify-between mb-8">
                    <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-muted-foreground hover:text-primary p-0">
                      <ArrowLeft className="mr-2 size-4" /> Back to dates
                    </Button>
                    <div className="text-right">
                      <Label className="text-xs font-bold uppercase tracking-[0.2em] text-primary block mb-1">Step 2</Label>
                      <p className="text-sm font-bold">{format(selectedDate!, "MMMM d, yyyy")}</p>
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-center mb-8">Available Times</h2>
                  
                  <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {displaySlots.map((slot) => (
                      <Button
                        key={slot.startsAt}
                        variant={selectedSlot === slot.startsAt ? "default" : "outline"}
                        className={cn(
                          "h-16 justify-center transition-all text-lg font-bold rounded-2xl",
                          selectedSlot === slot.startsAt && "ring-4 ring-primary/20 scale-[1.02]"
                        )}
                        onClick={() => handleSlotSelect(slot.startsAt)}
                      >
                        {format(parseISO(slot.startsAt), "h:mm a")}
                      </Button>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="flex flex-col items-center"
              >
                <Card className="w-full max-w-[600px] shadow-2xl border-none ring-1 ring-border/50 p-10">
                  <div className="flex items-center justify-between mb-10">
                    <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="text-muted-foreground hover:text-primary p-0">
                      <ArrowLeft className="mr-2 size-4" /> Back to times
                    </Button>
                    <div className="text-right">
                      <Label className="text-xs font-bold uppercase tracking-[0.2em] text-primary block mb-1">Step 3</Label>
                      <div className="text-xs font-bold opacity-60">
                        {format(selectedDate!, "MMM d")} • {format(parseISO(selectedSlot), "h:mm a")}
                      </div>
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold text-center mb-10">Finalize Details</h2>

                  <div className="space-y-8">
                    <div className="grid gap-8 sm:grid-cols-2">
                      <div className="space-y-3">
                        <Label htmlFor="name" className="text-sm font-bold text-foreground/70 flex items-center gap-2">
                          <User className="size-4" /> Full Name
                        </Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="bg-muted/30 border-border/50 focus:border-primary/50 transition-all h-14 text-lg rounded-2xl"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-sm font-bold text-foreground/70 flex items-center gap-2">
                          <Mail className="size-4" /> Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Email address"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          disabled={!!bookingQuery.data?.recipientEmail}
                          className="bg-muted/30 border-border/50 focus:border-primary/50 transition-all h-14 text-lg rounded-2xl disabled:opacity-70"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="notes" className="text-sm font-bold text-foreground/70 flex items-center gap-2">
                        <MessageSquare className="size-4" /> Notes (Optional)
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Anything else we should know?"
                        className="min-h-[140px] bg-muted/30 border-border/50 focus:border-primary/50 transition-all text-lg rounded-2xl"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>

                    <div className="pt-6">
                      <Button
                        className="w-full h-18 text-xl font-black shadow-2xl shadow-primary/30 rounded-2xl transition-all active:scale-[0.98]"
                        disabled={bookingMutation.isPending || !clientName || !clientEmail}
                        onClick={() => bookingMutation.mutate()}
                      >
                        {bookingMutation.isPending ? "Confirming..." : (
                          <span className="flex items-center gap-3">
                            Complete Booking <ChevronRight className="size-6" />
                          </span>
                        )}
                      </Button>
                    </div>

                    {bookingMutation.error && (
                      <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold text-center">
                        {(bookingMutation.error as Error).message}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Info */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-muted/30 text-muted-foreground text-sm font-medium">
            <Globe className="size-4" />
            <span>Timezone: {bookingQuery.data?.timezone ?? "Detected Local"}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
