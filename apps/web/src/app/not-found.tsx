"use client";

import { ArrowLeft, Home, TimerReset } from "lucide-react";
import { observer } from "mobx-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import Image404 from "@/app/assets/404.svg";
import { Button } from "@/components/ui/button";
import { useUser, useWorkspace } from "@/core/lib/store-context";
import { useCommonTranslations } from "@/i18n/hooks";

const REDIRECT_SECONDS = 8;
const SYSTEM_ROUTES = new Set([
  "",
  "onboarding",
  "profile",
  "sign-up",
  "workspace",
]);

const getSlugFromPathname = (pathname: string) => {
  const segment = pathname.split("/")[1] ?? "";
  if (!segment || SYSTEM_ROUTES.has(segment) || segment.includes(".")) {
    return null;
  }
  return segment;
};

export default observer(function NotFoundPage() {
  const router = useRouter();
  const pathname = usePathname();
  const userStore = useUser();
  const workspaceStore = useWorkspace();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);
  const hasRedirectedRef = useRef(false);
  const t = useCommonTranslations();

  const requestedSlug = useMemo(
    () => getSlugFromPathname(pathname),
    [pathname],
  );
  const availableWorkspaces = workspaceStore.workspaces || [];

  const targetWorkspaceSlug = useMemo(() => {
    if (
      requestedSlug &&
      availableWorkspaces.some((workspace) => workspace.slug === requestedSlug)
    ) {
      return requestedSlug;
    }

    if (workspaceStore.currentWorkspace?.slug) {
      return workspaceStore.currentWorkspace.slug;
    }

    if (availableWorkspaces.length > 0) {
      return availableWorkspaces[0].slug;
    }

    return null;
  }, [
    requestedSlug,
    availableWorkspaces,
    workspaceStore.currentWorkspace?.slug,
  ]);

  const redirectPath = targetWorkspaceSlug
    ? `/${targetWorkspaceSlug}`
    : userStore.isLoggedIn
      ? "/onboarding"
      : "/";

  useEffect(() => {
    hasRedirectedRef.current = false;
    setSecondsLeft(REDIRECT_SECONDS);
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  useEffect(() => {
    if (secondsLeft > 0 || hasRedirectedRef.current) return;
    hasRedirectedRef.current = true;
    router.replace(redirectPath);
  }, [secondsLeft, redirectPath, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-12">
      <div className="w-full max-w-95 space-y-7 text-center">
        <div className="mx-auto flex h-52 w-52 items-center justify-center">
          <div className="relative h-44 w-44">
            <Image
              src={Image404}
              fill
              priority
              className="object-contain"
              alt="404 page not found"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-txt-tertiary">
            {t("notFoundTitle")}
          </p>
          <h1 className="text-3xl font-semibold text-txt-primary">
            {t("notFoundSubtitle")}
          </h1>
          <p className="text-sm leading-relaxed text-txt-secondary">
            {t("notFoundDescription")}
          </p>
        </div>

        <div className="mx-auto flex max-w-xs items-center justify-center gap-2 rounded-xl border border-border-subtle bg-white px-4 py-3">
          <TimerReset size={16} className="text-txt-tertiary" />
          <span className="text-sm text-txt-secondary">
            {t("redirectingIn", { seconds: secondsLeft })}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center gap-3">
          <Link href={redirectPath} className="w-full">
            <Button className="w-full" size="lg">
              <Home size={16} />{t("backToWorkspace")}
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => router.back()}
          >
            <ArrowLeft size={16} />
            {t("back")}
          </Button>
        </div>
      </div>
    </main>
  );
});
