import { z } from "zod"

export const loginSchema = z.object({
  email: z.email("Enter a valid work email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export const registerSchema = loginSchema
  .extend({
    fullName: z.string().min(2, "Enter your full name"),
    teamName: z.string().min(2, "Enter a team name"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
