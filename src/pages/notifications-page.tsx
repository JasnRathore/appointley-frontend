import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { Bell, Check, Clock, Info, AlertCircle, Zap, Calendar, ExternalLink } from "lucide-react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/api"
import { cn } from "@/lib/utils"

export function NotificationsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
  })

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id)
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "BOOKING":
        return <Calendar className="size-5 text-blue-500" />
      case "SYSTEM":
        return <Zap className="size-5 text-yellow-500" />
      case "ALERT":
        return <AlertCircle className="size-5 text-red-500" />
      default:
        return <Info className="size-5 text-muted-foreground" />
    }
  }

  return (
    <div className="flex flex-col gap-8 pb-8">
      {notifications.some(n => !n.isRead) && (
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            <Check className="mr-2 size-4" />
            Mark all as read
          </Button>
        </div>
      )}

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading activity...</div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-6">
                <Bell className="size-8 opacity-20" />
              </div>
              <h3 className="text-xl font-bold">No notifications yet</h3>
              <p className="text-muted-foreground max-w-sm mt-2">
                When you receive invites or booking confirmations, they'll appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "group flex items-start gap-4 p-6 hover:bg-muted/30 transition-all cursor-pointer relative",
                    !notification.isRead && "bg-primary/[0.02]"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {!notification.isRead && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                  )}
                  <div className={cn(
                    "size-12 rounded-2xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105",
                    !notification.isRead ? "bg-background shadow-sm" : "bg-muted/50"
                  )}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className={cn("font-bold leading-none", !notification.isRead ? "text-foreground" : "text-muted-foreground")}>
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border-none">New</Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Clock className="size-3" />
                        {format(new Date(notification.createdAt), "MMM d, h:mm a")}
                      </span>
                    </div>
                    <p className={cn("text-sm leading-relaxed max-w-2xl", !notification.isRead ? "text-foreground/80" : "text-muted-foreground")}>
                      {notification.message}
                    </p>
                    {notification.actionUrl && (
                      <div className="pt-2">
                        <span className="text-xs font-bold text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          View details <ExternalLink className="size-3" />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
