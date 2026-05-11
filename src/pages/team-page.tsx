import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { Mail, Plus, Shield, UserMinus, Users } from "lucide-react"

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
  acceptTeamInvite,
  createTeam,
  getCurrentTeam,
  inviteTeamMember,
  removeTeamMember,
  updateTeamMemberRole,
} from "@/lib/api"
import type { TeamRole } from "@/lib/types"

const teamRoles: TeamRole[] = ["OWNER", "ADMIN", "MANAGER", "MEMBER", "VIEWER"]

export function TeamPage() {
  const queryClient = useQueryClient()
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<TeamRole>("MEMBER")
  const [acceptToken, setAcceptToken] = useState("")
  const [newTeamName, setNewTeamName] = useState("")
  const teamQuery = useQuery({
    queryKey: ["team-current"],
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
  const acceptMutation = useMutation({
    mutationFn: acceptTeamInvite,
    onSuccess: () => {
      setAcceptToken("")
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
    onSuccess: () => {
      setNewTeamName("")
      void queryClient.invalidateQueries({ queryKey: ["team-current"] })
    },
  })

  if (teamQuery.error && "status" in teamQuery.error && teamQuery.error.status === 404) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Create Workspace</CardTitle>
            <CardDescription>
              No active team found. Create a new workspace to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Team name"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
            />
            <Button
              className="w-full"
              disabled={createTeamMutation.isPending}
              onClick={() => createTeamMutation.mutate({ name: newTeamName })}
            >
              {createTeamMutation.isPending ? "Creating..." : "Create Team"}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Team</h2>
          <p className="text-muted-foreground">
            Manage your workspace members and invitations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            {teamQuery.data?.team.name}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="space-y-6 lg:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
              <CardDescription>
                A list of everyone currently in your workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {teamQuery.data?.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                        <Users className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">{member.fullName}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        className="h-8 rounded-md border bg-transparent px-2 text-xs"
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
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-destructive"
                        disabled={member.role === "OWNER" || removeMutation.isPending}
                        onClick={() => removeMutation.mutate(member.id)}
                      >
                        <UserMinus className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Invites</CardTitle>
              <CardDescription>Invitations waiting to be accepted.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamQuery.data?.pendingInvites.map((invite) => (
                  <div key={invite.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium leading-none">{invite.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {invite.role} • Expires {new Date(invite.expiresAt).toLocaleDateString()}
                      </p>
                      <code className="mt-1 block text-[10px] text-muted-foreground">
                        Token: {invite.token}
                      </code>
                    </div>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                ))}
                {!teamQuery.data?.pendingInvites.length && (
                  <p className="text-sm text-muted-foreground">No pending invitations.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Invite Member</CardTitle>
              <CardDescription>Add a new person to your workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-medium">Email Address</p>
                <div className="relative">
                  <Mail className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="name@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium">Role</p>
                <div className="relative">
                  <Shield className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
                  <select
                    className="h-9 w-full rounded-md border border-input bg-transparent pr-3 pl-9 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
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
                className="w-full"
                disabled={inviteMutation.isPending || !inviteEmail}
                onClick={() =>
                  inviteMutation.mutate({
                    email: inviteEmail,
                    role: inviteRole,
                  })
                }
              >
                <Plus className="mr-2 size-4" /> Send Invite
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accept Invite</CardTitle>
              <CardDescription>Join a team using an invite token.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Paste token here"
                value={acceptToken}
                onChange={(e) => setAcceptToken(e.target.value)}
              />
              <Button
                className="w-full"
                variant="outline"
                disabled={acceptMutation.isPending || !acceptToken}
                onClick={() => acceptMutation.mutate(acceptToken)}
              >
                Accept Invite
              </Button>
            </CardContent>
          </Card>
      </div>
    </div>
  </div>
  )
}




