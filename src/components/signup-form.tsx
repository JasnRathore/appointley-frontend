import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, AlertCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { register as registerApi } from "@/lib/api"
import { useAuthStore } from "@/store/auth-store"
import { Alert, AlertDescription } from "@/components/ui/alert"

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  teamName: z.string().min(2, "Team name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignupFormValues = z.infer<typeof signupSchema>

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (values: SignupFormValues) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await registerApi({
        fullName: values.fullName,
        teamName: values.teamName,
        email: values.email,
        password: values.password
      })
      setSession(
        response.accessToken,
        response.refreshToken,
        response.user,
        response.oauthEnabled
      )
      navigate("/dashboard")
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 border-none shadow-2xl">
        <CardContent className="p-0">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <span className="text-xl font-bold">A</span>
                </div>
                <h1 className="text-2xl font-bold mt-2">Create an account</h1>
                <p className="text-balance text-muted-foreground">
                  Get started with Appointley today
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    {...register("fullName")}
                    disabled={isLoading}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-destructive">{errors.fullName.message}</p>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="teamName">Team Name</FieldLabel>
                  <Input
                    id="teamName"
                    placeholder="Acme Corp"
                    {...register("teamName")}
                    disabled={isLoading}
                  />
                  {errors.teamName && (
                    <p className="text-xs text-destructive">{errors.teamName.message}</p>
                  )}
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input 
                    id="password" 
                    type="password" 
                    {...register("password")}
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password.message}</p>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="confirmPassword">Confirm</FieldLabel>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    {...register("confirmPassword")}
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </Field>
              </div>

              <Field>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </Field>

              <FieldSeparator>or continue with</FieldSeparator>
              
              <div className="grid grid-cols-3 gap-4">
                <Button variant="outline" className="w-full" type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.909 3.264-2.09 4.274-1.18 1.01-2.74 1.586-5.75 1.586-4.6 0-8.29-3.34-8.29-8.29s3.69-8.29 8.29-8.29c2.41 0 4.19.95 5.26 1.98l2.56-2.56C18.42 1.25 15.73 0 12.48 0 5.86 0 .5 5.36.5 12s5.36 12 11.98 12c3.53 0 6.22-1.17 8.11-3.1 2.02-2.02 2.65-4.8 2.65-7.18 0-.68-.05-1.33-.16-1.98h-10.6z" fill="currentColor" />
                  </svg>
                </Button>
                <Button variant="outline" className="w-full" type="button">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
                    <path d="M12.152 6.896c-.548 0-1.151.516-1.151 1.238 0 .619.522 1.238 1.151 1.238.63 0 1.152-.516 1.152-1.238 0-.722-.522-1.238-1.152-1.238zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.838 17.062a.419.419 0 0 1-.419.419h-1.676a.419.419 0 0 1-.419-.419V9.213a.419.419 0 0 1 .419-.419h1.676a.419.419 0 0 1 .419.419v7.849zm-1.042-9.673a1.442 1.442 0 1 1 0-2.884 1.442 1.442 0 0 1 0 2.884z" fill="currentColor" />
                  </svg>
                </Button>
                <Button variant="outline" className="w-full" type="button">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33V21.88C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z" fill="currentColor" />
                  </svg>
                </Button>
              </div>
              
              <FieldDescription className="text-center mt-2">
                Already have an account?{" "}
                <Link to="/login" className="underline underline-offset-4 font-medium hover:text-primary">
                  Sign in
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center text-xs">
        By clicking continue, you agree to our <a href="#" className="underline">Terms of Service</a>{" "}
        and <a href="#" className="underline">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
