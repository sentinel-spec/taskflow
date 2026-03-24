import { describe, expect, it } from "vitest";
import { AuthEmailSchema, AuthPasswordSchema } from "./auth.validator";
import { ProjectSchema } from "./project.validator";
import { CreateWorkspaceSchema } from "./workspace.validator";

describe("validators", () => {
  it("validates auth email and password payloads", () => {
    expect(
      AuthEmailSchema.safeParse({ email: "user@example.com" }).success,
    ).toBe(true);
    expect(AuthEmailSchema.safeParse({ email: "bad-email" }).success).toBe(
      false,
    );

    expect(AuthPasswordSchema.safeParse({ password: "123456" }).success).toBe(
      true,
    );
    expect(AuthPasswordSchema.safeParse({ password: "" }).success).toBe(false);
  });

  it("validates workspace create payload", () => {
    expect(
      CreateWorkspaceSchema.safeParse({
        name: "Acme Workspace",
        slug: "acme-workspace",
        teamSize: "1-10",
      }).success,
    ).toBe(true);

    expect(
      CreateWorkspaceSchema.safeParse({
        name: "",
        slug: "Bad Slug",
        teamSize: "",
      }).success,
    ).toBe(false);
  });

  it("validates project payload", () => {
    expect(
      ProjectSchema.safeParse({
        name: "Platform",
        identifier: "platform",
        description: "desc",
        cover_image_url: "/cover-images/image_1.jpg",
        logo_props: {
          in_use: "icon",
          icon: { name: "folder", color: "#6d7b8a" },
        },
        network: "private",
        projectLead: null,
      }).success,
    ).toBe(true);

    expect(
      ProjectSchema.safeParse({
        name: "",
        cover_image_url: "",
        logo_props: {},
        network: "",
        projectLead: null,
      }).success,
    ).toBe(false);
  });
});
