import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, AlertCircle, Calendar } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Field,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { login } from "@/lib/api"
import { useAuthStore } from "@/store/auth-store"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSearchParams } from "react-router-dom"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const setSession = useAuthStore((state) => state.setSession)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const inviteToken = searchParams.get("token")
  const inviteEmail = searchParams.get("email")
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: inviteEmail || "",
    }
  })

  React.useEffect(() => {
    if (inviteEmail) {
      setValue("email", inviteEmail)
    }
  }, [inviteEmail, setValue])

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await login({
        ...values,
        inviteToken: inviteToken || undefined
      })
      setSession(
        response.accessToken,
        response.refreshToken,
        response.user,
        response.oauthEnabled,
        response.activeTeamId,
        response.joinedTeamId
      )
      // If there's an invite token, redirect back to the invite page
      // so the user can accept via the working "Accept Invitation" button
      if (inviteToken) {
        navigate(`/invite/${inviteToken}`)
      } else {
        navigate("/dashboard")
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <Calendar className="h-10 w-10 text-primary mb-2" />
              <h1 className="text-2xl font-bold">Welcome Back</h1>
              <p className="text-sm text-muted-foreground">
                {inviteToken
                  ? "Sign in to accept your team invitation"
                  : "Enter your credentials to access your account"}
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4">
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
                )}
              </Field>
              <Field>
                <div className="flex items-center justify-between mb-2">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="text-sm font-medium text-primary hover:underline underline-offset-4"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  {...register("password")}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
                )}
              </Field>
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : inviteToken ? (
                  "Sign in & Join Team"
                ) : (
                  "Login"
                )}
              </Button>
            </div>

            {!inviteToken && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <Button variant="outline" className="w-full" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 mr-2">
                      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.909 3.264-2.09 4.274-1.18 1.01-2.74 1.586-5.75 1.586-4.6 0-8.29-3.34-8.29-8.29s3.69-8.29 8.29-8.29c2.41 0 4.19.95 5.26 1.98l2.56-2.56C18.42 1.25 15.73 0 12.48 0 5.86 0 .5 5.36.5 12s5.36 12 11.98 12c3.53 0 6.22-1.17 8.11-3.1 2.02-2.02 2.65-4.8 2.65-7.18 0-.68-.05-1.33-.16-1.98h-10.6z" fill="currentColor" />
                    </svg>
                    Google
                  </Button>
                  <Button variant="outline" className="w-full" type="button">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
                      <path d="M12.152 6.896c-.548 0-1.151.516-1.151 1.238 0 .619.522 1.238 1.151 1.238.63 0 1.152-.516 1.152-1.238 0-.722-.522-1.238-1.152-1.238zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.838 17.062a.419.419 0 0 1-.419.419h-1.676a.419.419 0 0 1-.419-.419V9.213a.419.419 0 0 1 .419-.419h1.676a.419.419 0 0 1 .419.419v7.849zm-1.042-9.673a1.442 1.442 0 1 1 0-2.884 1.442 1.442 0 0 1 0 2.884z" fill="currentColor" />
                    </svg>
                  </Button>
                  <Button variant="outline" className="w-full" type="button">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33V21.88C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" fill="currentColor" />
                    </svg>
                  </Button>
                </div>
              </>
            )}
            
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link to={inviteToken ? `/register?token=${inviteToken}&email=${inviteEmail || ""}` : "/register"} className="text-primary font-medium hover:underline underline-offset-4">
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </Card>
      <p className="px-8 text-center text-xs text-muted-foreground leading-relaxed">
        By clicking continue, you agree to our <a href="#" className="underline underline-offset-4 hover:text-primary">Terms of Service</a>{" "}
        and <a href="#" className="underline underline-offset-4 hover:text-primary">Privacy Policy</a>.
      </p>
    </div>
  )
}
