import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type UseFormReturn, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { createBookingLink } from "@/lib/api"

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  description: z.string().optional(),
  durationMinutes: z.number().min(1, "Duration must be at least 1 minute."),
  expirationDays: z.number().min(1, "Expiration must be at least 1 day."),
  recipientEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  oneTimeUse: z.boolean(),
})

type FormValues = z.infer<typeof formSchema>

export function CreateLinkDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const queryClient = useQueryClient()

  const form: UseFormReturn<FormValues> = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "Advisory Session",
      description: "30-minute client call",
      durationMinutes: 30,
      expirationDays: 10,
      recipientEmail: "",
      oneTimeUse: false,
    },
  })

  const mutation = useMutation({
    mutationFn: createBookingLink,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["booking-links"] })
      void queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] })
      onOpenChange(false)
      form.reset()
    },
  })

  function onSubmit(values: FormValues) {
    mutation.mutate({
      title: values.title,
      description: values.description,
      durationMinutes: values.durationMinutes,
      expirationDays: values.expirationDays,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      recipientEmail: values.recipientEmail || undefined,
      oneTimeUse: values.oneTimeUse,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Targeted Link</DialogTitle>
          <DialogDescription>
            Generate a special link for a specific recipient or a one-time use session.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Advisory Session" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="recipientEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Email (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="client@example.com" {...field} />
                  </FormControl>
                  <FormDescription className="text-[10px]">
                    If set, the link will be emailed to them and only they can book.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (min)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expirationDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expires (days)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="oneTimeUse"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>One-time use</FormLabel>
                    <FormDescription className="text-[10px]">
                      Deactivate link after the first booking.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? "Generating..." : "Generate & Send Link"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
