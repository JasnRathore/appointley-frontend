import { Bell, Clock, Loader2 } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { useNavigate } from "react-router-dom"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { getNotifications, getUnreadCount, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/api"
import type { Notification } from "@/lib/types"
import { cn } from "@/lib/utils"

const formatMessage = (msg: string) => {
  // Try to find ISO date strings and format them
  return msg.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/g, (match) => {
    try {
      return new Date(match).toLocaleString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit' 
      })
    } catch {
      return match
    }
  })
}

export function NotificationDropdown() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: notifications = [], isLoading: isLoadingNotifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: getNotifications,
    refetchInterval: 30000,
  })

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: getUnreadCount,
    refetchInterval: 30000,
  })

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] })
      void queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] })
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] })
      void queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] })
    },
  })

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id)
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-muted/50 rounded-full transition-all">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2.5 size-2 rounded-full bg-primary ring-2 ring-background animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[340px] p-0 overflow-hidden shadow-2xl border-none ring-1 ring-border/50 rounded-2xl" align="end">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/20 backdrop-blur-sm">
          <DropdownMenuLabel className="p-0 text-sm font-black tracking-tight">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <button 
              className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              {markAllReadMutation.isPending ? "Updating..." : "Mark all read"}
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="m-0 bg-border/40" />
        <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
          {isLoadingNotifications ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="size-5 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 px-8 text-center">
                <div className="size-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                  <Bell className="size-5 text-muted-foreground opacity-40" />
                </div>
                <p className="text-xs font-bold text-muted-foreground">All caught up!</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">No new alerts to show.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => {
                const isRead = notification.isRead
                return (
                  <button
                    key={notification.id}
                    className={cn(
                      "flex flex-col items-start gap-1 p-4 text-left transition-all border-b border-border/30 last:border-0 relative",
                      !isRead ? "bg-primary/[0.03] hover:bg-primary/[0.06]" : "hover:bg-muted/30"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {!isRead && (
                      <div className="absolute top-5 right-4 size-1.5 rounded-full bg-primary" />
                    )}
                    <div className="flex w-full pr-4">
                      <p className={cn(
                        "text-xs leading-snug tracking-tight", 
                        !isRead ? "font-black text-foreground" : "font-bold text-muted-foreground"
                      )}>
                        {notification.title}
                      </p>
                    </div>
                    <p className="text-[11px] text-muted-foreground/90 line-clamp-2 leading-relaxed mt-0.5">
                      {formatMessage(notification.message)}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2.5">
                       <Clock className="size-3 text-muted-foreground/40" />
                       <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/60">
                         {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                       </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
        <DropdownMenuSeparator className="m-0 bg-border/40" />
        <button 
          className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted/50 hover:text-primary transition-all" 
          onClick={() => navigate("/notifications")}
        >
           View All Activity
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
