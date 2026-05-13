import * as React from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Check, Loader2, UserPlus, LogIn, ArrowRight, AlertCircle, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getTeamInviteDetails, acceptTeamInvite, logout } from "@/lib/api"
import { useAuthStore } from "@/store/auth-store"
import { toast } from "sonner"

export default function InvitePage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, accessToken, setActiveTeamId } = useAuthStore()
  const isAuthenticated = !!accessToken && !!user
  
  const { data: invite, isLoading, isError } = useQuery({
    queryKey: ["invite", token],
    queryFn: () => getTeamInviteDetails(token!),
    enabled: !!token,
    retry: false,
  })

  const acceptMutation = useMutation({
    mutationFn: () => acceptTeamInvite(token!),
    onSuccess: (data) => {
      toast.success(`Welcome to ${invite?.teamName}!`)
      void queryClient.invalidateQueries({ queryKey: ["teams"] })
      setActiveTeamId(data.team.id)
      navigate("/dashboard")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to accept invitation")
    }
  })

  const handleLogoutAndJoin = async () => {
    await logout()
    navigate(`/login?token=${token}`)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isError || !invite) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-destructive/20 shadow-2xl rounded-2xl overflow-hidden">
          <div className="h-2 bg-destructive" />
          <CardHeader className="text-center">
            <div className="mx-auto size-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="size-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-black tracking-tight">Invalid Invitation</CardTitle>
            <CardDescription className="text-muted-foreground font-medium">
              This invitation link is invalid, has expired, or has already been used.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" className="w-full rounded-xl font-bold" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const isEmailMatch = isAuthenticated && user?.email.toLowerCase() === invite.email.toLowerCase()

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl border-none ring-1 ring-border/50 rounded-3xl overflow-hidden bg-muted/20 backdrop-blur-sm">
        <div className="h-2 bg-primary" />
        <CardHeader className="text-center pt-8">
          <div className="mx-auto size-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
            <UserPlus className="size-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-black tracking-tighter leading-none mb-2">
            Join {invite.teamName}
          </CardTitle>
          <CardDescription className="text-muted-foreground font-bold px-4">
            {invite.inviterName} has invited you to join their team as a <span className="text-foreground capitalize">{invite.role.toLowerCase()}</span>.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          {invite.isRevoked ? (
            <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/10 text-destructive text-center">
               <p className="text-sm font-bold">This invitation has been canceled.</p>
            </div>
          ) : invite.isAccepted ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-green-500/5 border border-green-500/10 text-green-600 text-center">
                 <p className="text-sm font-bold">You have already joined this team!</p>
              </div>
              <Button className="w-full h-12 rounded-xl font-black text-base" onClick={() => navigate("/dashboard")}>
                Go to Dashboard <ArrowRight className="ml-2 size-5" />
              </Button>
            </div>
          ) : invite.isExpired ? (
            <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/10 text-destructive text-center">
               <p className="text-sm font-bold">This invitation has expired.</p>
            </div>
          ) : isAuthenticated ? (
            isEmailMatch ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Check className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-primary/70">Logged in as</p>
                    <p className="text-sm font-bold text-foreground">{user?.email}</p>
                  </div>
                </div>
                <Button 
                  className="w-full h-12 rounded-xl font-black text-base shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" 
                  onClick={() => acceptMutation.mutate()}
                  disabled={acceptMutation.isPending}
                >
                  {acceptMutation.isPending ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <>Accept Invitation <ArrowRight className="ml-2 size-5" /></>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10 flex items-center gap-3">
                  <div className="size-10 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                    <AlertCircle className="size-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black uppercase tracking-widest text-orange-500/70">Account Mismatch</p>
                    <p className="text-xs font-bold text-muted-foreground leading-snug">
                      This invite was sent to <span className="text-foreground">{invite.email}</span>, but you are logged in as <span className="text-foreground">{user?.email}</span>.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    className="w-full h-12 rounded-xl font-black text-base shadow-lg shadow-primary/20"
                    onClick={() => acceptMutation.mutate()}
                    disabled={acceptMutation.isPending}
                  >
                    {acceptMutation.isPending ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <>Join with {user?.email} <ArrowRight className="ml-2 size-5" /></>
                    )}
                  </Button>
                  <Button variant="outline" className="h-12 rounded-xl font-bold" onClick={handleLogoutAndJoin}>
                    <LogOut className="mr-2 size-4" /> Switch Account
                  </Button>
                </div>
              </div>
            )
          ) : (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-muted/50 border border-border/50 text-center">
                 <p className="text-sm font-bold text-muted-foreground mb-1">Invited email:</p>
                 <p className="text-base font-black tracking-tight">{invite.email}</p>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {invite.isExistingUser ? (
                  <Button 
                    className="h-12 rounded-xl font-black text-base shadow-lg shadow-primary/20"
                    onClick={() => navigate(`/login?token=${token}&email=${invite.email}`)}
                  >
                    <LogIn className="mr-2 size-5" /> Sign in to Join
                  </Button>
                ) : (
                  <Button 
                    className="h-12 rounded-xl font-black text-base shadow-lg shadow-primary/20"
                    onClick={() => navigate(`/register?token=${token}&email=${invite.email}`)}
                  >
                    <UserPlus className="mr-2 size-5" /> Create Account to Join
                  </Button>
                )}
                <Button variant="ghost" className="h-12 rounded-xl font-bold text-muted-foreground" onClick={() => navigate("/login")}>
                  Login as different user
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
