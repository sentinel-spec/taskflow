import { z } from "zod";

export const AuthEmailSchema = z.object({
  email: z.email("Invalid email"),
});

export const AuthPasswordSchema = z.object({
  password: z.string().min(1, "Password is required"),
  confirm_password: z.string().optional(),
});

export type AuthEmailInput = z.infer<typeof AuthEmailSchema>;
export type AuthPasswordInput = z.infer<typeof AuthPasswordSchema>;
