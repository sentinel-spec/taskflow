import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invitations - Sensata",
  description: "Manage workspace invitations",
  robots: "noindex, nofollow",
};

export default function InvitationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
