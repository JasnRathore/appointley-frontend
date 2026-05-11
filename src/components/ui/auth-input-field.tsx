import type { FieldError, UseFormRegisterReturn } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type AuthInputFieldProps = {
  label: string
  placeholder: string
  registration: UseFormRegisterReturn
  error?: FieldError
  type?: string
}

export function AuthInputField({
  label,
  placeholder,
  registration,
  error,
  type = "text",
}: AuthInputFieldProps) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <Input
        aria-invalid={Boolean(error)}
        className={cn(error && "border-destructive")}
        placeholder={placeholder}
        type={type}
        {...registration}
      />
      <span className="block min-h-5 text-xs text-destructive">
        {error?.message ?? ""}
      </span>
    </label>
  )
}
