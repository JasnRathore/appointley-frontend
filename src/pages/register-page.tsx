import { useMutation } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"

import { AuthInputField } from "@/components/ui/auth-input-field"
import { Button } from "@/components/ui/button"
import { type RegisterValues, registerSchema } from "@/features/auth/schemas"
import { register } from "@/lib/api"
import { useAuthStore } from "@/store/auth-store"

export function RegisterPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      teamName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })
  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: (payload) => {
      setSession(
        payload.accessToken,
        payload.refreshToken,
        payload.user,
        payload.oauthEnabled
      )
      navigate("/dashboard", { replace: true })
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    await registerMutation.mutateAsync({
      fullName: values.fullName,
      teamName: values.teamName,
      email: values.email,
      password: values.password,
    })
  })

  return (
    <div className="min-h-svh bg-[radial-gradient(circle_at_top_right,_rgba(61,118,255,0.2),_transparent_28%),linear-gradient(180deg,_oklch(0.985_0.007_235),_oklch(0.95_0.024_245))] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] border border-border/70 bg-card/90 p-8 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-primary">
            Register
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Create a team workspace for client-facing scheduling
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            This is the route foundation for workspace creation. Later slices will
            attach team provisioning, owner membership, and audit logging to this
            form submission.
          </p>
        </section>
        <section className="rounded-[2rem] border border-border/70 bg-background/92 p-8 shadow-sm">
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
            <div className="sm:col-span-2">
              <AuthInputField
                label="Full name"
                placeholder="Jordan Patel"
                registration={form.register("fullName")}
                error={form.formState.errors.fullName}
              />
            </div>
            <div className="sm:col-span-2">
              <AuthInputField
                label="Team name"
                placeholder="Nexus Advisory"
                registration={form.register("teamName")}
                error={form.formState.errors.teamName}
              />
            </div>
            <div className="sm:col-span-2">
              <AuthInputField
                label="Work email"
                placeholder="owner@appointley.com"
                registration={form.register("email")}
                error={form.formState.errors.email}
                type="email"
              />
            </div>
            <AuthInputField
              label="Password"
              placeholder="Minimum 8 characters"
              registration={form.register("password")}
              error={form.formState.errors.password}
              type="password"
            />
            <AuthInputField
              label="Confirm password"
              placeholder="Repeat password"
              registration={form.register("confirmPassword")}
              error={form.formState.errors.confirmPassword}
              type="password"
            />
            <div className="sm:col-span-2">
              <Button className="w-full" size="lg" type="submit">
                {registerMutation.isPending ? "Creating..." : "Create workspace"}
              </Button>
            </div>
          </form>
          {registerMutation.error ? (
            <p className="mt-4 text-sm text-destructive">
              {registerMutation.error.message}
            </p>
          ) : null}
          <p className="mt-4 text-sm text-muted-foreground">
            Already set up?{" "}
            <Link className="font-medium text-primary" to="/login">
              Return to sign in
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}
