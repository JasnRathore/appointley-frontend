import { useMutation, useQuery } from "@tanstack/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"

import { AuthInputField } from "@/components/ui/auth-input-field"
import { Button } from "@/components/ui/button"
import { type LoginValues, loginSchema } from "@/features/auth/schemas"
import { getOAuthStatus, login } from "@/lib/api"
import { useAuthStore } from "@/store/auth-store"

export function LoginPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })
  const oauthQuery = useQuery({
    queryKey: ["oauth-status"],
    queryFn: getOAuthStatus,
  })
  const loginMutation = useMutation({
    mutationFn: login,
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
    try {
      await loginMutation.mutateAsync(values)
    } catch (error) {
      if (error instanceof Error && "fieldErrors" in error) {
        const fieldErrors = (error as { fieldErrors?: Record<string, string> }).fieldErrors
        if (fieldErrors) {
          for (const [field, message] of Object.entries(fieldErrors)) {
            form.setError(field as keyof LoginValues, {
              message,
            })
          }
        }
      }
    }
  })

  return (
    <div className="min-h-svh bg-[radial-gradient(circle_at_top,_rgba(61,118,255,0.22),_transparent_32%),linear-gradient(180deg,_oklch(0.985_0.006_235),_oklch(0.96_0.02_240))] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] border border-border/70 bg-card/90 p-8 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-primary">
            Sign In
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            Run client scheduling from one control surface
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            Email authentication is the first implemented frontend path. The form
            already uses React Hook Form and Zod so the auth API can be connected
            without reshaping the page.
          </p>
        </section>
        <section className="rounded-[2rem] border border-border/70 bg-background/92 p-8 shadow-sm">
          <form className="space-y-4" onSubmit={onSubmit}>
            <AuthInputField
              label="Work email"
              placeholder="advisor@appointley.com"
              registration={form.register("email")}
              error={form.formState.errors.email}
              type="email"
            />
            <AuthInputField
              label="Password"
              placeholder="Minimum 8 characters"
              registration={form.register("password")}
              error={form.formState.errors.password}
              type="password"
            />
            <Button className="w-full" size="lg" type="submit">
              {loginMutation.isPending ? "Signing in..." : "Continue"}
            </Button>
            {loginMutation.error ? (
              <p className="text-sm text-destructive">
                {loginMutation.error.message}
              </p>
            ) : null}
            <Button
              asChild={Boolean(oauthQuery.data?.googleConfigured)}
              className="w-full"
              size="lg"
              type="button"
              variant="outline"
            >
              {oauthQuery.data?.googleConfigured && oauthQuery.data.loginUrl ? (
                <a href={`http://localhost:8080${oauthQuery.data.loginUrl}`}>
                  Continue with Google
                </a>
              ) : (
                <span>Google OAuth not configured</span>
              )}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            Need an account?{" "}
            <Link className="font-medium text-primary" to="/register">
              Create workspace
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}
