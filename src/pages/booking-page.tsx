import { useMutation, useQuery } from "@tanstack/react-query"
import { CalendarClock, ShieldCheck, CheckCircle2 } from "lucide-react"
import { useMemo, useState } from "react"
import { useParams } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
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
import { bookPublicMeeting, getPublicBookingLink } from "@/lib/api"
import { cn } from "@/lib/utils"

export function BookingPage() {
  const { token } = useParams()
  const safeToken = useMemo(() => token ?? "unknown-link", [token])
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

  if (bookingMutation.isSuccess) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="size-6" />
            </div>
            <CardTitle>Booking Confirmed</CardTitle>
            <CardDescription>
              Your meeting has been scheduled. Confirmation emails have been sent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/">Done</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-muted/30 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="px-0">
                <Badge className="w-fit mb-2">Public Booking</Badge>
                <CardTitle className="text-4xl font-bold tracking-tight">
                  {bookingQuery.data?.title ?? "Book a Session"}
                </CardTitle>
                <CardDescription className="text-base mt-4 leading-relaxed">
                  {bookingQuery.data?.description ??
                    "Schedule a meeting directly in my calendar using this secure booking surface."}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 space-y-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ShieldCheck className="size-4" />
                  </div>
                  <span>Secure Token: {safeToken}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CalendarClock className="size-4" />
                  </div>
                  <span>Timezone: {bookingQuery.data?.timezone ?? "Local"}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Schedule Meeting</CardTitle>
                <CardDescription>Select a slot and provide your details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Available Slots</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {(bookingQuery.data?.slots ?? []).map((slot) => (
                      <Button
                        key={slot.startsAt}
                        variant={selectedSlot === slot.startsAt ? "default" : "outline"}
                        className={cn(
                          "h-auto py-3 px-4 justify-start font-normal",
                          selectedSlot === slot.startsAt && "ring-2 ring-primary ring-offset-2"
                        )}
                        onClick={() => setSelectedSlot(slot.startsAt)}
                      >
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="font-medium">
                            {new Date(slot.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="text-[10px] opacity-70">
                            {new Date(slot.startsAt).toLocaleDateString()}
                          </span>
                        </div>
                      </Button>
                    ))}
                    {!bookingQuery.data?.slots.length && (
                      <p className="text-sm text-muted-foreground col-span-2 py-4 text-center border rounded-lg border-dashed">
                        No slots available currently.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Tell us about the meeting..."
                      className="min-h-[100px]"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  disabled={!selectedSlot || !clientName || !clientEmail || bookingMutation.isPending}
                  onClick={() => bookingMutation.mutate()}
                >
                  {bookingMutation.isPending ? "Processing..." : "Confirm Booking"}
                </Button>

                {bookingMutation.error && (
                  <p className="text-sm text-destructive mt-2 text-center">
                    {(bookingMutation.error as Error).message}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

