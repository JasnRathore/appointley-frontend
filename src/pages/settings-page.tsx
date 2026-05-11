import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { Save, Settings } from "lucide-react"

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
import { getSettings, updateSettings } from "@/lib/api"
import { useAuthStore } from "@/store/auth-store"

export function SettingsPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const accessToken = useAuthStore((state) => state.accessToken)
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const setSession = useAuthStore((state) => state.setSession)
  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  })
  const [fullName, setFullName] = useState("")
  const [teamName, setTeamName] = useState("")
  const [senderName, setSenderName] = useState("")

  useEffect(() => {
    if (settingsQuery.data) {
      setFullName(settingsQuery.data.fullName)
      setTeamName(settingsQuery.data.teamName)
      setSenderName(settingsQuery.data.senderName)
    }
  }, [settingsQuery.data])

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

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your personal and workspace settings.
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Workspace Configuration</CardTitle>
              <CardDescription>
                Update your name, team details, and sender information.
              </CardDescription>
            </div>
            <Settings className="size-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sender-name">Sender Name</Label>
            <Input
              id="sender-name"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="This name appears on booking emails"
            />
          </div>

          <div className="flex items-center justify-between border-t pt-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Google OAuth</span>
              <Badge variant={settingsQuery.data?.oauthEnabled ? "success" : "outline"}>
                {settingsQuery.data?.oauthEnabled ? "Configured" : "Not configured"}
              </Badge>
            </div>
            <Button
              disabled={updateMutation.isPending}
              onClick={() =>
                updateMutation.mutate({
                  fullName,
                  teamName,
                  senderName,
                })
              }
            >
              <Save className="mr-2 size-4" />
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
