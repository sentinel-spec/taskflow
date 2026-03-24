import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workspace Invitations - Sensata",
  description: "Accept or reject workspace invitation",
  robots: "noindex, nofollow",
};

export default function WorkspaceInvitationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
