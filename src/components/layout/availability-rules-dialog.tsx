import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Trash2 } from "lucide-react"

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
import { replaceAvailabilityRules } from "@/lib/api"
import type { AvailabilityRuleInput, DayOfWeek } from "@/lib/types"

const weekdayOptions: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]

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
  const [rules, setRules] = React.useState<AvailabilityRuleInput[]>(initialRules)

  React.useEffect(() => {
    setRules(initialRules)
  }, [initialRules])

  const mutation = useMutation({
    mutationFn: replaceAvailabilityRules,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["availability-rules"] })
      onOpenChange(false)
    },
  })

  const addRule = () => {
    setRules([
      ...rules,
      {
        dayOfWeek: "MONDAY",
        startTime: "09:00",
        endTime: "17:00",
        slotDurationMinutes: 30,
        active: true,
      },
    ])
  }

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index))
  }

  const updateRule = (index: number, updates: Partial<AvailabilityRuleInput>) => {
    setRules(rules.map((r, i) => (i === index ? { ...r, ...updates } : r)))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Availability Rules</DialogTitle>
          <DialogDescription>
            Configure when you are available for bookings.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[400px] space-y-4 overflow-y-auto pr-2">
          {rules.map((rule, index) => (
            <div
              key={index}
              className="grid grid-cols-[1fr_1fr_1fr_80px_auto] items-center gap-2 rounded-lg border p-3"
            >
              <select
                className="h-9 rounded-md border bg-transparent px-2 text-sm"
                value={rule.dayOfWeek}
                onChange={(e) => updateRule(index, { dayOfWeek: e.target.value as DayOfWeek })}
              >
                {weekdayOptions.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
              <Input
                type="time"
                value={rule.startTime}
                onChange={(e) => updateRule(index, { startTime: e.target.value })}
              />
              <Input
                type="time"
                value={rule.endTime}
                onChange={(e) => updateRule(index, { endTime: e.target.value })}
              />
              <Input
                type="number"
                value={rule.slotDurationMinutes}
                onChange={(e) => updateRule(index, { slotDurationMinutes: Number(e.target.value) })}
              />
              <Button
                size="icon"
                variant="ghost"
                className="text-destructive"
                onClick={() => removeRule(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" className="w-full" onClick={addRule}>
            <Plus className="mr-2 size-4" /> Add Rule
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={() => mutation.mutate(rules)} disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
