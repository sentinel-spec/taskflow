export type ProjectLogoProps = {
  in_use?: "emoji" | "icon" | null;
  emoji?: { value?: string | null } | null;
  icon?: { name?: string | null; color?: string | null } | null;
};

export type ProjectFormData = {
  name: string;
  identifier: string;
  description: string;
  cover_image_url: string;
  logo_props: ProjectLogoProps;
  network: string;
  projectLead: string | null;
};
