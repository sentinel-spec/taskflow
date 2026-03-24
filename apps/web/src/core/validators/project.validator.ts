import { z } from "zod";

export const ProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required").max(255),
  identifier: z.string().trim().max(255).optional().default(""),
  description: z.string().max(5000).optional().default(""),
  cover_image_url: z.string().min(1),
  logo_props: z.object({
    in_use: z.enum(["emoji", "icon"]).nullable().optional(),
    emoji: z
      .object({ value: z.string().nullable().optional() })
      .nullable()
      .optional(),
    icon: z
      .object({
        name: z.string().nullable().optional(),
        color: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
  }),
  network: z.string().min(1),
  projectLead: z.string().nullable(),
});

export type ProjectInput = z.infer<typeof ProjectSchema>;
