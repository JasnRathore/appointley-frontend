import { Bell, Check, Clock, Loader2 } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { useNavigate } from "react-router-dom"
import * as React from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getNotifications, getUnreadCount, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/api"
import { cn } from "@/lib/utils"

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

  const handleNotificationClick = (notification: any) => {
    // Check both isRead (frontend type) and read (backend property name)
    const isAlreadyRead = notification.isRead || notification.read
    if (!isAlreadyRead) {
      markReadMutation.mutate(notification.id)
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 size-5 flex items-center justify-center p-0 bg-red-500 hover:bg-red-600 border-2 border-background animate-in zoom-in duration-300">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0 overflow-hidden" align="end">
        <div className="flex items-center justify-between p-4 bg-muted/30">
          <DropdownMenuLabel className="p-0 font-bold">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs font-medium hover:text-primary transition-colors"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              {markAllReadMutation.isPending ? <Loader2 className="size-3 animate-spin" /> : "Mark all read"}
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="h-[350px] overflow-y-auto">
          {isLoadingNotifications ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 px-8 text-center text-muted-foreground">
               <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Bell className="size-6 opacity-20" />
               </div>
               <p className="text-sm font-medium">All caught up!</p>
               <p className="text-xs mt-1">No new notifications to show.</p>
            </div>
          ) : (
            <DropdownMenuGroup>
              {notifications.map((notification) => {
                const isRead = notification.isRead || notification.read
                return (
                  <DropdownMenuItem
                    key={notification.id}
                    className={cn(
                      "flex flex-col items-start gap-1 p-4 cursor-pointer focus:bg-muted/50 transition-colors border-b last:border-0",
                      !isRead && "bg-primary/5"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex w-full items-start justify-between gap-2">
                      <p className={cn("text-sm leading-tight", !isRead ? "font-bold text-foreground" : "font-medium text-muted-foreground")}>
                        {notification.title}
                      </p>
                      {!isRead && (
                        <div className="size-2 rounded-full bg-primary mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      <Clock className="size-3" />
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </div>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuGroup>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <Button variant="ghost" className="w-full rounded-none h-11 text-xs font-bold text-muted-foreground hover:text-primary" onClick={() => navigate("/notifications")}>
           View All Activity
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
