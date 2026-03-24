"use client";

import { Boxes, Check, Share2, Star, User2, X } from "lucide-react";
import { observer } from "mobx-react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { EmptySpace, EmptySpaceItem } from "@/components/ui/empty-space";
import { LogoSpinner } from "@/core/components/common/logo-spinner";
import { useUser } from "@/core/lib/store-context";
import { workspaceService } from "@/core/services/workspace.service";

const WORKSPACE_INVITATION = (invitationId: string) =>
  `WORKSPACE_INVITATION_${invitationId}`;

export default observer(function WorkspaceInvitationPage() {
  const searchParams = useSearchParams();
  const invitationId = searchParams.get("invitation_id");
  const slug = searchParams.get("slug");
  const token = searchParams.get("token");

  const userStore = useUser();
  const currentUser = userStore.currentUser;

  const { data: invitationDetail, error } = useSWR(
    invitationId && slug ? WORKSPACE_INVITATION(invitationId) : null,
    invitationId && slug
      ? () => workspaceService.getWorkspaceInvitation(slug, invitationId)
      : null,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const respondedAt =
    invitationDetail?.responded_at ?? invitationDetail?.respondedAt;
  const isAccepted = Boolean(invitationDetail?.accepted);
  const invitationEmail = invitationDetail?.email?.toLowerCase();
  const currentUserEmail = currentUser?.email?.toLowerCase();

  const handleAccept = async () => {
    if (!invitationDetail) return;
    try {
      await workspaceService.joinWorkspace(
        invitationDetail.workspace.slug,
        invitationDetail.id,
        {
          accepted: true,
          token,
        },
      );
      if (
        invitationEmail &&
        currentUserEmail &&
        invitationEmail === currentUserEmail
      ) {
        window.location.href = `/${invitationDetail.workspace.slug}`;
        return;
      }
      window.location.href = "/";
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async () => {
    if (!invitationDetail) return;
    try {
      await workspaceService.joinWorkspace(
        invitationDetail.workspace.slug,
        invitationDetail.id,
        {
          accepted: false,
          token,
        },
      );
      window.location.href = "/";
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-full min-h-screen w-full flex-col items-center justify-center px-3 py-8">
      {invitationDetail && !respondedAt ? (
        error ? (
          <div className="flex w-full flex-col space-y-4 rounded-sm border border-border-subtle bg-bg-surface-1 px-4 py-8 text-center shadow-2xl md:w-1/3">
            <h2 className="text-lg uppercase">INVITATION NOT FOUND</h2>
          </div>
        ) : (
          <EmptySpace
            title={`You have been invited to ${invitationDetail.workspace.name}`}
            description="Your workspace is where you'll create projects, collaborate on your work items, and organize different streams of work in your Sensata account."
          >
            <EmptySpaceItem Icon={Check} title="Accept" action={handleAccept} />
            <EmptySpaceItem Icon={X} title="Ignore" action={handleReject} />
          </EmptySpace>
        )
      ) : error || respondedAt ? (
        isAccepted ? (
          <EmptySpace
            title={`You are already a member of ${invitationDetail?.workspace.name ?? "this workspace"}`}
            description="Your workspace is where you'll create projects, collaborate on your work items, and organize different streams of work in your Sensata account."
          >
            <EmptySpaceItem Icon={Boxes} title="Continue to home" href="/" />
          </EmptySpace>
        ) : (
          <EmptySpace
            title="This invitation link is not active anymore."
            description="Your workspace is where you'll create projects, collaborate on your work items, and organize different streams of work in your Sensata account."
            link={{ text: "Or start from an empty project", href: "/" }}
          >
            {!currentUser ? (
              <EmptySpaceItem
                Icon={User2}
                title="Sign in to continue"
                href="/"
              />
            ) : (
              <EmptySpaceItem Icon={Boxes} title="Continue to home" href="/" />
            )}
            <EmptySpaceItem
              Icon={Star}
              title="Star us on GitHub"
              href="https://github.com/makeplane"
            />
            <EmptySpaceItem
              Icon={Share2}
              title="Join our community of active creators"
              href="https://forum.sensata.kz"
            />
          </EmptySpace>
        )
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <LogoSpinner />
        </div>
      )}
    </div>
  );
});
