import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import {
  AlertCircle,
  Save,
  Zap,
  Settings2,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

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
import {
  getSettings,
  updateSettings,
  getCurrentTeam,
  deleteTeam,
} from "@/lib/api"
import { useAuthStore } from "@/store/auth-store"


export function SettingsPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const accessToken = useAuthStore((state) => state.accessToken)
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const activeTeamId = useAuthStore((state) => state.activeTeamId)
  const setSession = useAuthStore((state) => state.setSession)

  const settingsQuery = useQuery({
    queryKey: ["settings", activeTeamId],
    queryFn: getSettings,
  })

  const teamQuery = useQuery({
    queryKey: ["current-team", activeTeamId],
    queryFn: getCurrentTeam,
  })


  const [fullName, setFullName] = useState("")
  const [teamName, setTeamName] = useState("")
  const [senderName, setSenderName] = useState("")
  const [emailOnBooking, setEmailOnBooking] = useState(true)
  const [inAppOnBooking, setInAppOnBooking] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)
  const [marketingEmails, setMarketingEmails] = useState(false)

  const [initialized, setInitialized] = useState(false)

  if (settingsQuery.data && !initialized) {
    setFullName(settingsQuery.data.fullName)
    setTeamName(settingsQuery.data.teamName)
    setSenderName(settingsQuery.data.senderName)
    setEmailOnBooking(settingsQuery.data.emailOnBooking)
    setInAppOnBooking(settingsQuery.data.inAppOnBooking)
    setWeeklyDigest(settingsQuery.data.weeklyDigest)
    setMarketingEmails(settingsQuery.data.marketingEmails)
    setInitialized(true)
  }

  const deleteTeamMutation = useMutation({
    mutationFn: deleteTeam,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["teams"] })
      toast.success("Workspace deleted")
      // Auth store or sidebar will handle the redirect since activeTeamId is cleared
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete workspace")
    }
  })



  const updateMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: (settings) => {
      if (user && accessToken && refreshToken) {
        setSession(
          accessToken,
          refreshToken,
          {
            ...user,
            fullName: settings.fullName,
          },
          settings.oauthEnabled
        )
      }
      void queryClient.invalidateQueries({ queryKey: ["settings"] })
      void queryClient.invalidateQueries({ queryKey: ["team-current"] })
    },
  })



  const saveGeneralSettings = () =>
    updateMutation.mutate({
      fullName,
      teamName,
      senderName,
      emailOnBooking,
      inAppOnBooking,
      weeklyDigest,
      marketingEmails,
    })

  const teamData = teamQuery.data
  const isOwner = teamData?.team.ownerId === user?.id

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div className="flex flex-col gap-8 max-w-3xl">
        <Card className="border-none shadow-sm overflow-hidden ring-1 ring-border/50">
          <CardHeader className="bg-muted/30 pb-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Settings2 className="size-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Workspace Identity</CardTitle>
                <CardDescription>
                  Manage your organization's name and how it appears in communications.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 pt-8">
            <div className="grid gap-8 sm:grid-cols-2">
              <div className="space-y-3">
                <Label htmlFor="team-name" className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">
                  Organization Name
                </Label>
                <Input
                  id="team-name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="h-12 bg-muted/20 border-border/50 focus:bg-background transition-all font-medium"
                />
                <p className="text-[11px] text-muted-foreground px-1">
                  This name is used internally and displayed to your team.
                </p>
              </div>
              <div className="space-y-3">
                <Label htmlFor="sender-name" className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">
                  Email Sender Name
                </Label>
                <Input
                  id="sender-name"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Jasn from Appointley"
                  className="h-12 bg-muted/20 border-border/50 focus:bg-background transition-all font-medium"
                />
                <p className="text-[11px] text-muted-foreground px-1">
                  How your name appears in automated emails to clients.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/50 pt-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                <Zap className="size-3 text-amber-500" />
                Changes apply instantly to all new bookings.
              </div>
              <Button
                className="h-11 px-8 shadow-lg shadow-primary/20 font-bold"
                disabled={updateMutation.isPending}
                onClick={saveGeneralSettings}
              >
                {updateMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="size-4" />
                    Save Workspace
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {isOwner && (
          <Card className="border-none shadow-sm ring-2 ring-red-500/30 overflow-hidden bg-red-500/[0.02]">
            <CardHeader className="bg-red-500/10 pb-4 border-b border-red-500/20">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
                  <AlertCircle className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-black text-red-500 uppercase tracking-tight">Danger Zone</CardTitle>
                  <CardDescription className="text-red-400/80 font-medium">
                    Irreversible actions related to this workspace.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border-2 border-red-500/10 bg-red-500/[0.03]">
                <div className="space-y-1">
                  <p className="text-base font-black text-red-500">Delete this workspace</p>
                  <p className="text-xs text-muted-foreground font-medium max-w-[300px]">
                    Once deleted, all data, meetings, and team associations will be <span className="text-red-500 font-bold underline">permanently removed</span>.
                  </p>
                </div>
                <Button 
                  className="h-12 px-8 font-black shadow-xl shadow-red-600/30 group uppercase tracking-wider bg-red-600 hover:bg-red-700 text-white border-none transition-all active:scale-95"
                  onClick={() => {
                    if (confirm(`Type "DELETE" to confirm you want to delete "${teamData?.team.name}". This cannot be undone.`)) {
                      deleteTeamMutation.mutate()
                    }
                  }}
                  disabled={deleteTeamMutation.isPending}
                >
                  <Trash2 className="size-5 mr-2 group-hover:scale-110 transition-transform" />
                  {deleteTeamMutation.isPending ? "Deleting..." : "Delete Workspace"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
