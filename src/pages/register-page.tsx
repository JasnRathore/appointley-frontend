import { SignupForm } from "@/components/signup-form"

export function RegisterPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center bg-background p-6 md:p-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--secondary)_0%,transparent_25%)] opacity-[0.03] pointer-events-none" />
      <div className="w-full max-w-sm md:max-w-md relative z-10">
        <SignupForm />
      </div>
    </div>
  )
}
