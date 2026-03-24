import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign up - Sensata",
  description: "Create your account on Sensata",
  robots: "index, nofollow",
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
