import type { Metadata, Viewport } from "next";
import { PreloadResources } from "./layout.preload";

export const metadata: Metadata = {
  robots: "noindex, nofollow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  viewportFit: "cover",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PreloadResources />
      {children}
    </>
  );
}
