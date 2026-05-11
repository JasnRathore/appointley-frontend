import * as React from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { addBlockedDate, deleteBlockedDate, getBlockedDates } from "@/lib/api"

export function BlockedWindowsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const [start, setStart] = React.useState("")
  const [end, setEnd] = React.useState("")
  const [reason, setReason] = React.useState("")

  const { data: blockedDates = [] } = useQuery({
    queryKey: ["blocked-dates"],
    queryFn: getBlockedDates,
  })

  const addMutation = useMutation({
    mutationFn: addBlockedDate,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["blocked-dates"] })
      setStart("")
      setEnd("")
      setReason("")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBlockedDate,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["blocked-dates"] })
    },
  })

  const handleAdd = () => {
    if (start && end) {
      addMutation.mutate({
        startsAt: new Date(start).toISOString(),
        endsAt: new Date(end).toISOString(),
        reason,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Blocked Windows</DialogTitle>
          <DialogDescription>
            Add exceptions to your availability.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-3 rounded-lg border p-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <p className="text-xs font-medium">Starts At</p>
                <Input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium">Ends At</p>
                <Input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>
            </div>
            <Input placeholder="Reason (Optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
            <Button className="w-full" onClick={handleAdd} disabled={addMutation.isPending || !start || !end}>
              {addMutation.isPending ? "Adding..." : "Add Blocked Window"}
            </Button>
          </div>

          <div className="max-h-[300px] space-y-2 overflow-y-auto">
            {blockedDates.map((blocked) => (
              <div key={blocked.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{new Date(blocked.startsAt).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">to {new Date(blocked.endsAt).toLocaleString()}</p>
                  {blocked.reason && <p className="text-xs text-muted-foreground italic">"{blocked.reason}"</p>}
                </div>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteMutation.mutate(blocked.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            {blockedDates.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">No blocked windows configured.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
