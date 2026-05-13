import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { 
  Mail, 
  Shield, 
  UserMinus, 
  Users, 
  ArrowRight,
  Copy,
  ExternalLink,
  Crown, 
  MoreHorizontal,
  XCircle
} from "lucide-react"
import { toast } from "sonner"

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  createTeam,
  getCurrentTeam,
  inviteTeamMember,
  removeTeamMember,
  updateTeamMemberRole,
  revokeTeamInvite,
} from "@/lib/api"
import type { TeamRole } from "@/lib/types"
import { useAuthStore } from "@/store/auth-store"

const teamRoles: TeamRole[] = ["OWNER", "ADMIN", "MANAGER", "MEMBER", "VIEWER"]

export function TeamPage() {
  const { user, activeTeamId, setActiveTeamId } = useAuthStore()
  const queryClient = useQueryClient()
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<TeamRole>("MEMBER")
  const [newTeamName, setNewTeamName] = useState("")
  
  const teamQuery = useQuery({
    queryKey: ["team-current", activeTeamId],
    queryFn: getCurrentTeam,
    retry: false,
  })

  const inviteMutation = useMutation({
    mutationFn: inviteTeamMember,
    onSuccess: () => {
      setInviteEmail("")
      void queryClient.invalidateQueries({ queryKey: ["team-current"] })
      void queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] })
    },
  })


  const roleMutation = useMutation({
    mutationFn: ({
      memberId,
      role,
    }: {
      memberId: string
      role: TeamRole
    }) => updateTeamMemberRole(memberId, { role }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["team-current"] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: removeTeamMember,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["team-current"] })
    },
  })

  const createTeamMutation = useMutation({
    mutationFn: createTeam,
    onSuccess: (data) => {
      setNewTeamName("")
      queryClient.setQueryData(["teams"], (old: unknown[]) => [...(old || []), data])
      setActiveTeamId(data.id)
      void queryClient.invalidateQueries()
      toast.success(`Team "${data.name}" created!`)
    },
  })

  const revokeInviteMutation = useMutation({
    mutationFn: revokeTeamInvite,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["team-current"] })
      toast.success("Invitation canceled")
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel invitation")
    },
  })





  if (teamQuery.error && "status" in teamQuery.error && teamQuery.error.status === 404) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <Card className="w-full max-w-md border-none shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto size-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
               <Users className="size-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Create Workspace</CardTitle>
            <CardDescription>
              Every great collaboration starts with a team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
               <p className="text-sm font-medium">Team Name</p>
               <Input
                  placeholder="e.g. Acme Design"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="h-11"
               />
            </div>
            <Button
              className="w-full h-11 shadow-lg shadow-primary/20"
              disabled={createTeamMutation.isPending || !newTeamName}
              onClick={() => createTeamMutation.mutate({ name: newTeamName })}
            >
              {createTeamMutation.isPending ? "Creating..." : "Create Team"}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const teamData = teamQuery.data
  const members = teamData?.members ?? []
  const invites = teamData?.pendingInvites ?? []

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div className="flex items-center justify-end">
         <Badge variant="secondary" className="h-8 px-4 font-bold bg-primary/10 text-primary border-none">
           {members.length} Members
         </Badge>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Workspace Members</CardTitle>
              <CardDescription>
                Manage individual access and permissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between py-4 group first:pt-0 last:pb-0">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                         <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-bold text-lg">
                           {member.fullName.charAt(0)}
                         </div>
                         {member.role === 'OWNER' && (
                           <div className="absolute -top-1 -right-1 size-5 rounded-full bg-yellow-500 border-2 border-background flex items-center justify-center">
                              <Crown className="size-2.5 text-white" />
                           </div>
                         )}
                      </div>
                      <div>
                        <p className="text-sm font-bold leading-none">{member.fullName}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {member.email === user?.email ? (
                        <Badge variant="outline" className="h-8 px-3 text-[10px] font-bold uppercase tracking-wider border-none bg-muted/50">
                          {member.role}
                        </Badge>
                      ) : (
                        <select
                          className="h-8 rounded-lg border-none bg-muted/50 px-2 text-[10px] font-bold uppercase tracking-wider focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer"
                          disabled={member.role === "OWNER" || roleMutation.isPending}
                          value={member.role}
                          onChange={(e) =>
                            roleMutation.mutate({
                              memberId: member.id,
                              role: e.target.value as TeamRole,
                            })
                          }
                        >
                          {teamRoles.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                           <Button size="icon" variant="ghost" className="size-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="size-4" />
                           </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem 
                             className="text-destructive gap-2" 
                             disabled={member.role === "OWNER" || removeMutation.isPending} 
                             onClick={() => {
                               if (confirm(member.email === user?.email ? "Are you sure you want to leave this team?" : "Are you sure you want to remove this member?")) {
                                 removeMutation.mutate(member.id)
                               }
                             }}
                           >
                              <UserMinus className="size-4" />
                              {member.email === user?.email ? "Leave Team" : "Remove Member"}
                           </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {invites.length > 0 && (
            <Card className="border-none shadow-sm bg-muted/20">
              <CardHeader>
                <CardTitle className="text-lg">Pending Invitations</CardTitle>
                <CardDescription>People invited to join your team.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border/50">
                  {invites.map((invite) => (
                    <div key={invite.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-background border">
                           <Mail className="size-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-bold leading-none">{invite.email}</p>
                          <p className="mt-1 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                            {invite.role} • Expires {new Date(invite.expiresAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 rounded-lg"
                          title="Copy Link"
                          onClick={() => {
                            const link = `${window.location.origin}/invite/${invite.token}`
                            void navigator.clipboard.writeText(link)
                            toast.success("Invite link copied!")
                          }}
                        >
                          <Copy className="size-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Cancel Invitation"
                          onClick={() => {
                            if (confirm("Are you sure you want to cancel this invitation?")) {
                              revokeInviteMutation.mutate(invite.id)
                            }
                          }}
                          disabled={revokeInviteMutation.isPending}
                        >
                          <XCircle className="size-4" />
                        </Button>
                        <Badge variant="outline" className="text-[10px] font-bold uppercase h-5">Pending</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-8">

          <Card className="border-none shadow-md bg-zinc-900 text-white">
            <CardHeader>
              <CardTitle className="text-lg">Invite New Member</CardTitle>
              <CardDescription className="text-zinc-400">Add someone to your collaboration space.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Email Address</p>
                <div className="relative">
                  <Mail className="absolute top-3 left-3 size-4 text-zinc-500" />
                  <Input
                    className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 h-11"
                    placeholder="teammate@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Assign Role</p>
                <div className="relative">
                  <Shield className="absolute top-3 left-3 size-4 text-zinc-500" />
                  <select
                    className="h-11 w-full rounded-md border border-zinc-700 bg-zinc-800 pr-3 pl-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer appearance-none"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                  >
                    {teamRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <Button
                className="w-full h-11 bg-white text-black hover:bg-zinc-200 mt-2"
                disabled={inviteMutation.isPending || !inviteEmail}
                onClick={() =>
                  inviteMutation.mutate({
                    email: inviteEmail,
                    role: inviteRole,
                  })
                }
              >
                {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm border border-dashed bg-muted/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                 <ExternalLink className="size-5 text-primary" />
                 Joining a team?
              </CardTitle>
              <CardDescription>Click the invitation link sent to your email to join another workspace.</CardDescription>
            </CardHeader>
            <CardContent>
               <p className="text-xs text-muted-foreground leading-relaxed">
                 Invitations are now link-based for better security and ease of use. If you have an old token, you can still enter it at <code>/invite/TOKEN</code>.
               </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
