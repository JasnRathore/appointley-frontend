import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import {
  AlertCircle,
  Bell,
  Calendar,
  Lock,
  LogOut,
  Mail,
  Save,
  ShieldCheck,
  Smartphone,
  User,
  Zap,
} from "lucide-react"
import { useSearchParams, useNavigate } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  deleteAccount,
  getSettings,
  logoutEverywhere,
  updatePassword,
  updateSettings,
} from "@/lib/api"
import type { EmailTemplate, EmailType } from "@/lib/types"
import { useAuthStore } from "@/store/auth-store"


export function AccountSettingsPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const defaultTab = searchParams.get("tab") || "general"
  const user = useAuthStore((state) => state.user)
  const accessToken = useAuthStore((state) => state.accessToken)
  const refreshToken = useAuthStore((state) => state.refreshToken)
  const activeTeamId = useAuthStore((state) => state.activeTeamId)
  const setSession = useAuthStore((state) => state.setSession)

  const settingsQuery = useQuery({
    queryKey: ["settings", activeTeamId],
    queryFn: getSettings,
  })


  const [fullName, setFullName] = useState("")
  const [teamName, setTeamName] = useState("")
  const [senderName, setSenderName] = useState("")
  const [emailOnBooking, setEmailOnBooking] = useState(true)
  const [inAppOnBooking, setInAppOnBooking] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(false)
  const [marketingEmails, setMarketingEmails] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")

  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const passwordMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      setShowPasswordDialog(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    },
  })

  const logoutEverywhereMutation = useMutation({
    mutationFn: logoutEverywhere,
    onSuccess: () => navigate("/login"),
  })

  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      useAuthStore.getState().clearSession()
      navigate("/login")
    },
  })

  useEffect(() => {
    if (!settingsQuery.data) {
      return
    }

    setFullName(settingsQuery.data.fullName)
    setTeamName(settingsQuery.data.teamName)
    setSenderName(settingsQuery.data.senderName)
    setEmailOnBooking(settingsQuery.data.emailOnBooking)
    setInAppOnBooking(settingsQuery.data.inAppOnBooking)
    setWeeklyDigest(settingsQuery.data.weeklyDigest)
    setMarketingEmails(settingsQuery.data.marketingEmails)
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


  const templateError = null

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



  return (
    <div className="flex flex-col gap-8 pb-8">
      <Tabs defaultValue={defaultTab} onValueChange={(v) => setSearchParams({ tab: v })} className="w-full">
        <TabsList className="mb-8 grid w-full max-w-[760px] grid-cols-2 sm:grid-cols-3">
          <TabsTrigger value="general" className="gap-2">
            <User className="size-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="size-4" />
            <span className="hidden sm:inline">Alerts</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="size-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="max-w-3xl border-none shadow-sm">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                This information will be displayed on your booking pages.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-static">Email Address</Label>
                  <Input
                    id="email-static"
                    value={user?.email ?? ""}
                    disabled
                    className="h-11 bg-muted/50 opacity-70"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between border-t pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                    <ShieldCheck className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Google Integration</p>
                    <Badge
                      variant={settingsQuery.data?.oauthEnabled ? "secondary" : "outline"}
                      className="mt-1 border-none bg-green-500/10 text-green-600"
                    >
                      {settingsQuery.data?.oauthEnabled ? "Verified & Active" : "Pending Connection"}
                    </Badge>
                  </div>
                </div>
                <Button
                  className="shadow-lg shadow-primary/20"
                  disabled={updateMutation.isPending}
                  onClick={saveGeneralSettings}
                >
                  <Save className="mr-2 size-4" />
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="max-w-3xl border-none shadow-sm ring-2 ring-red-500/30 overflow-hidden bg-red-500/[0.02]">
            <CardHeader className="bg-red-500/10 border-b border-red-500/20 pb-4">
              <CardTitle className="flex items-center gap-2 text-xl font-black text-red-500 uppercase tracking-tight dark:text-red-400">
                <AlertCircle className="size-5 text-red-500" />
                Danger Zone
              </CardTitle>
              <CardDescription className="font-medium text-red-400/70 dark:text-red-400/70">
                Irreversible actions. Please proceed with extreme caution.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6 pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border-2 border-red-500/10 bg-red-500/[0.03]">
                <div className="space-y-1">
                  <p className="text-sm font-black text-red-500">Sign Out Everywhere</p>
                  <p className="text-xs text-muted-foreground font-medium">
                    Ends all active sessions across all devices.
                  </p>
                </div>
                <Button
                  className="h-11 px-6 font-bold shadow-lg shadow-red-600/30 bg-red-600 hover:bg-red-700 text-white border-none transition-all active:scale-95"
                  onClick={() => logoutEverywhereMutation.mutate()}
                  disabled={logoutEverywhereMutation.isPending}
                >
                  <LogOut className="mr-2 size-4" />
                  {logoutEverywhereMutation.isPending ? "Signing out..." : "Sign Out Everywhere"}
                </Button>
              </div>
              <Dialog open={showDeleteAccount} onOpenChange={setShowDeleteAccount}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border-2 border-red-500/10 bg-red-500/[0.03]">
                  <div className="space-y-1">
                    <p className="text-sm font-black text-red-500">Delete Account</p>
                    <p className="text-xs text-muted-foreground font-medium">
                      All data, booking links, and meetings will be <span className="text-red-500 underline font-bold">permanently deleted</span>.
                    </p>
                  </div>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-10 px-6 font-bold text-red-400 border-red-500/30 transition-all hover:bg-red-600 hover:text-white dark:text-red-400 shadow-sm"
                    >
                      Delete Account
                    </Button>
                  </DialogTrigger>
                </div>

                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-red-600">Delete Account</DialogTitle>
                    <DialogDescription>
                      This action is irreversible. All your booking links, meetings, and data will be permanently deleted.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="confirm-delete">
                        To confirm, type <span className="font-bold text-foreground">delete</span> below:
                      </Label>
                      <Input
                        id="confirm-delete"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="type delete here..."
                        className="h-11 border-red-500/20 focus:border-red-500"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setShowDeleteAccount(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      disabled={deleteConfirmText.toLowerCase() !== "delete" || deleteAccountMutation.isPending}
                      onClick={() => deleteAccountMutation.mutate()}
                    >
                      {deleteAccountMutation.isPending ? "Deleting..." : "Permanently Delete Account"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="max-w-3xl border-none shadow-sm">
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Control how you receive updates about your meetings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  id: "emailOnBooking",
                  title: "Email Notifications",
                  icon: Mail,
                  desc: "Get emails for new bookings and schedule changes.",
                  checked: emailOnBooking,
                  onCheckedChange: setEmailOnBooking,
                },
                {
                  id: "inAppOnBooking",
                  title: "In-App Alerts",
                  icon: Zap,
                  desc: "Real-time notifications within the dashboard.",
                  checked: inAppOnBooking,
                  onCheckedChange: setInAppOnBooking,
                },
                {
                  id: "weeklyDigest",
                  title: "Weekly Digest",
                  icon: Calendar,
                  desc: "A summary of your performance and upcoming week.",
                  checked: weeklyDigest,
                  onCheckedChange: setWeeklyDigest,
                },
                {
                  id: "marketingEmails",
                  title: "Product Updates",
                  icon: Smartphone,
                  desc: "News about new features and improvements.",
                  checked: marketingEmails,
                  onCheckedChange: setMarketingEmails,
                },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl border bg-muted/5 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex size-10 items-center justify-center rounded-lg border bg-background shadow-sm">
                      <item.icon className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <Switch checked={item.checked} onCheckedChange={item.onCheckedChange} />
                </div>
              ))}

              <div className="flex justify-end pt-4">
                <Button
                  className="shadow-lg shadow-primary/20"
                  disabled={updateMutation.isPending}
                  onClick={saveGeneralSettings}
                >
                  <Save className="mr-2 size-4" />
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="security" className="space-y-6">
          <Card className="max-w-3xl border-none shadow-sm">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Keep your account and team data safe.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-dashed p-4 text-center">
                <Lock className="mx-auto mb-3 size-8 text-muted-foreground opacity-50" />
                <p className="text-sm font-medium">Password Management</p>
                <p className="mt-1 mb-4 text-xs text-muted-foreground">
                  Update your password to stay secure.
                </p>
                <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Enter your current password and a new secure password.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input
                          id="current-password"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="h-11"
                        />
                      </div>
                      {passwordMutation.error && (
                        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm font-bold text-red-600">
                          {(passwordMutation.error as Error).message}
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setShowPasswordDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        disabled={
                          !currentPassword ||
                          !newPassword ||
                          newPassword !== confirmPassword ||
                          passwordMutation.isPending
                        }
                        onClick={() => passwordMutation.mutate({ currentPassword, newPassword })}
                      >
                        {passwordMutation.isPending ? "Updating..." : "Update Password"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
