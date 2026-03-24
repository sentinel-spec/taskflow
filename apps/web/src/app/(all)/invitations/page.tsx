"use client";

import { CheckCircle2 } from "lucide-react";
import { observer } from "mobx-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import useSWR, { mutate } from "swr";
import { LogoSpinner } from "@/core/components/common/logo-spinner";
import AuthLayout from "@/core/layouts/auth-layout";
import { useUser, useWorkspace } from "@/core/lib/store-context";
import { workspaceService } from "@/core/services/workspace.service";
import type { WorkspaceInvitationDto } from "@/core/types/dto/workspace.dto";

const USER_WORKSPACE_INVITATIONS = "USER_WORKSPACE_INVITATIONS";

function WorkspaceInvitationCard({
  invitation,
  selected,
  onToggle,
}: {
  invitation: WorkspaceInvitationDto;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex w-full cursor-pointer items-center gap-2 rounded-sm border px-3.5 py-5 text-left transition-colors ${
        selected
          ? "border-border-accent-strong bg-bg-surface-1"
          : "border-border-subtle hover:bg-bg-surface-2"
      }`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-bg-surface-1 text-xs font-semibold uppercase text-txt-accent-primary">
        {invitation.workspace.name?.[0] ?? "W"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-txt-primary">
          {invitation.workspace.name}
        </div>
        <p className="text-xs text-txt-tertiary">
          {(invitation.role || "member").toUpperCase()}
        </p>
      </div>
      <span
        className={`shrink-0 ${
          selected ? "text-txt-accent-primary" : "text-txt-tertiary"
        }`}
      >
        <CheckCircle2 className="h-5 w-5" />
      </span>
    </button>
  );
}

export default observer(function UserInvitationsPage() {
  const router = useRouter();
  const { currentUser } = useUser();
  const workspaceStore = useWorkspace();
  const [selectedInvitations, setSelectedInvitations] = useState<string[]>([]);
  const [isJoiningWorkspaces, setIsJoiningWorkspaces] = useState(false);

  const {
    data: invitations,
    error,
    isLoading,
  } = useSWR(
    USER_WORKSPACE_INVITATIONS,
    () => workspaceService.userWorkspaceInvitations(),
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const selectedInvitationsSet = useMemo(
    () => new Set(selectedInvitations),
    [selectedInvitations],
  );

  const toggleInvitation = (id: string) => {
    setSelectedInvitations((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const submitInvitations = async () => {
    if (selectedInvitations.length === 0) return;

    setIsJoiningWorkspaces(true);
    try {
      await workspaceService.joinWorkspaces({
        invitations: selectedInvitations,
      });
      await mutate(USER_WORKSPACE_INVITATIONS);
      await workspaceStore.fetchWorkspaces({ force: true });

      const firstInviteId = selectedInvitations[0];
      const redirectWorkspace = invitations?.find(
        (i) => i.id === firstInviteId,
      )?.workspace;

      router.push(redirectWorkspace?.slug ? `/${redirectWorkspace.slug}` : "/");
    } catch (_error) {
      setIsJoiningWorkspaces(false);
      return;
    }

    setIsJoiningWorkspaces(false);
  };

  if (isLoading) {
    return (
      <AuthLayout>
        <div className="flex min-h-[260px] w-full max-w-xl items-center justify-center">
          <LogoSpinner />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-xl px-4 py-6">
        <div className="mb-6 flex justify-center">
          <Image
            src="/invitation.svg"
            alt="Invitation"
            width={220}
            height={220}
            priority
            className="h-auto w-40 sm:w-52"
          />
        </div>

        {error ? (
          <div className="space-y-4 text-center">
            <h3 className="text-xl font-semibold text-txt-primary">
              Invitations API is not available
            </h3>
            <p className="text-sm text-txt-secondary">
              Backend endpoint for workspace invitations is missing (404).
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="btn-primary h-10"
            >
              Back to home
            </button>
          </div>
        ) : invitations && invitations.length > 0 ? (
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h4 className="text-2xl font-semibold text-txt-primary">
                Join a workspace
              </h4>
              <p className="text-sm text-txt-secondary">
                We found invitations for {currentUser?.email ?? "your account"}.
              </p>
            </div>

            <div className="max-h-[42vh] space-y-3 overflow-y-auto">
              {invitations.map((invitation) => (
                <WorkspaceInvitationCard
                  key={invitation.id}
                  invitation={invitation}
                  selected={selectedInvitationsSet.has(invitation.id)}
                  onToggle={() => toggleInvitation(invitation.id)}
                />
              ))}
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={submitInvitations}
                disabled={
                  isJoiningWorkspaces || selectedInvitations.length === 0
                }
                className="btn-primary h-10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isJoiningWorkspaces ? "Joining..." : "Accept and join"}
              </button>
              <Link href="/" className="btn-secondary h-10">
                Go home
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <h3 className="text-xl font-semibold text-txt-primary">
              No pending invites
            </h3>
            <p className="text-sm text-txt-secondary">
              You can see here if someone invites you to a workspace.
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="btn-primary h-10"
            >
              Back to home
            </button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
});
