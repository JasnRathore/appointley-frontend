import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Trash2, Clock, Calendar as CalendarIcon } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { replaceAvailabilityRules } from "@/lib/api"
import type { AvailabilityRuleInput, DayOfWeek } from "@/lib/types"
import { cn } from "@/lib/utils"

const weekdayOptions: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]

interface DaySchedule {
  day: DayOfWeek
  enabled: boolean
  ranges: Array<{ startTime: string; endTime: string }>
}

function normalizeTimeValue(value: string) {
  return value.length >= 5 ? value.slice(0, 5) : value
}

export function AvailabilityRulesDialog({
  open,
  onOpenChange,
  initialRules,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialRules: AvailabilityRuleInput[]
}) {
  const queryClient = useQueryClient()
  const [schedule, setSchedule] = React.useState<DaySchedule[]>([])

  // Initialize schedule from rules
  React.useEffect(() => {
    const newSchedule = weekdayOptions.map((day) => {
      const dayRules = initialRules.filter((r) => r.dayOfWeek === day && r.active)
      return {
        day,
        enabled: dayRules.length > 0,
        ranges: dayRules.length > 0
          ? dayRules.map((r) => ({
              startTime: normalizeTimeValue(r.startTime),
              endTime: normalizeTimeValue(r.endTime),
            }))
          : [{ startTime: "09:00", endTime: "17:00" }]
      }
    })
    setSchedule(newSchedule)
  }, [initialRules, open])

  const mutation = useMutation({
    mutationFn: replaceAvailabilityRules,
    onSuccess: (updatedRules) => {
      queryClient.setQueryData(["availability-rules"], updatedRules)
      void queryClient.invalidateQueries({ queryKey: ["availability-rules"] })
      onOpenChange(false)
    },
  })

  const toggleDay = (dayIndex: number) => {
    setSchedule(prev => prev.map((s, i) => i === dayIndex ? { ...s, enabled: !s.enabled } : s))
  }

  const addRange = (dayIndex: number) => {
    setSchedule(prev => prev.map((s, i) => i === dayIndex ? { 
      ...s, 
      ranges: [...s.ranges, { startTime: "09:00", endTime: "17:00" }] 
    } : s))
  }

  const removeRange = (dayIndex: number, rangeIndex: number) => {
    setSchedule(prev => prev.map((s, i) => i === dayIndex ? { 
      ...s, 
      ranges: s.ranges.filter((_, ri) => ri !== rangeIndex) 
    } : s))
  }

  const updateRange = (dayIndex: number, rangeIndex: number, updates: Partial<{ startTime: string; endTime: string }>) => {
    setSchedule(prev => prev.map((s, i) => i === dayIndex ? { 
      ...s, 
      ranges: s.ranges.map((r, ri) => ri === rangeIndex ? { ...r, ...updates } : r)
    } : s))
  }

  const handleSave = () => {
    const flattenedRules: AvailabilityRuleInput[] = []
    schedule.forEach(s => {
      if (s.enabled) {
        s.ranges.forEach(r => {
          flattenedRules.push({
            dayOfWeek: s.day,
            startTime: r.startTime,
            endTime: r.endTime,
            slotDurationMinutes: 30, // Default for now
            active: true
          })
        })
      }
    })
    mutation.mutate(flattenedRules)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden border-none ring-1 ring-border/50 shadow-2xl">
        <DialogHeader className="p-8 pb-4 bg-muted/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarIcon className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Weekly Schedule</DialogTitle>
              <DialogDescription>
                Set your standard working hours for each day of the week.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 pt-4 max-h-[60vh] overflow-y-auto space-y-6">
          {schedule.map((daySched, dIndex) => (
            <div 
              key={daySched.day} 
              className={cn(
                "group relative flex flex-col gap-4 p-4 rounded-2xl border transition-all duration-200",
                daySched.enabled ? "bg-card border-border shadow-sm" : "bg-muted/30 border-transparent opacity-60"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Switch 
                    checked={daySched.enabled} 
                    onCheckedChange={() => toggleDay(dIndex)}
                    className="data-[state=checked]:bg-primary"
                  />
                  <Label className="text-sm font-bold uppercase tracking-widest w-24">
                    {daySched.day.charAt(0) + daySched.day.slice(1).toLowerCase()}
                  </Label>
                </div>
                
                {!daySched.enabled && (
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Unavailable</span>
                )}
                
                {daySched.enabled && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => addRange(dIndex)}
                    className="h-8 px-2 text-primary hover:text-primary hover:bg-primary/10 font-bold text-xs"
                  >
                    <Plus className="mr-1 size-3" /> Add Window
                  </Button>
                )}
              </div>

              {daySched.enabled && (
                <div className="space-y-3 pl-14">
                  {daySched.ranges.map((range, rIndex) => (
                    <div key={rIndex} className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-200">
                      <div className="relative flex-1">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                        <Input
                          type="time"
                          value={range.startTime}
                          onChange={(e) => updateRange(dIndex, rIndex, { startTime: e.target.value })}
                          className="pl-8 h-10 bg-muted/30 border-none ring-1 ring-border/50 focus:ring-primary/50"
                        />
                      </div>
                      <span className="text-muted-foreground font-medium">—</span>
                      <div className="relative flex-1">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                        <Input
                          type="time"
                          value={range.endTime}
                          onChange={(e) => updateRange(dIndex, rIndex, { endTime: e.target.value })}
                          className="pl-8 h-10 bg-muted/30 border-none ring-1 ring-border/50 focus:ring-primary/50"
                        />
                      </div>
                      {daySched.ranges.length > 1 && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-10 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl"
                          onClick={() => removeRange(dIndex, rIndex)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <DialogFooter className="p-8 pt-4 bg-muted/20 border-t">
          {mutation.error && (
            <div className="w-full rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
              {(mutation.error as Error).message}
            </div>
          )}
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="font-semibold">
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={mutation.isPending}
            className="px-8 font-bold shadow-lg shadow-primary/20"
          >
            {mutation.isPending ? "Applying Changes..." : "Save Weekly Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
