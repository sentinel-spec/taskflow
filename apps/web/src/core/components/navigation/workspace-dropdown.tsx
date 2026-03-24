"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Check,
  ChevronDown,
  CirclePlus,
  LogOut,
  Mails,
  Settings,
  UserPlus,
} from "lucide-react";
import { observer } from "mobx-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser, useWorkspace } from "@/core/lib/store-context";
import {
  useAuthTranslations,
  useCommonTranslations,
  useNavigationTranslations,
} from "@/i18n/hooks";

export const WorkspaceDropdown = observer(function WorkspaceDropdown() {
  const userStore = useUser();
  const workspaceStore = useWorkspace();
  const router = useRouter();

  const user = userStore.currentUser;
  const workspaces = workspaceStore.workspaces;
  const currentWorkspace = workspaceStore.currentWorkspace;

  const handleSignOut = async () => {
    await userStore.logout();
    router.push("/");
  };
  const t = useAuthTranslations();
  const tCommon = useCommonTranslations();
  const tNav = useNavigationTranslations();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="group/menu-button flex max-w-48 items-center justify-between gap-2 truncate rounded-md p-1.5 text-sm font-medium text-txt-secondary hover:bg-bg-surface-2 focus:outline-none transition-all data-[state=open]:bg-bg-surface-2"
          aria-label={tNav("openWorkspaceSwitcher")}
        >
          <div className="flex items-center gap-2 truncate">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-bg-surface-1 text-[10px] font-bold text-txt-accent-primary uppercase">
              {currentWorkspace?.name?.[0] || "S"}
            </div>
            <h4 className="truncate text-sm font-semibold text-txt-primary">
              {currentWorkspace?.name || tCommon("loading")}
            </h4>
          </div>
          <ChevronDown
            size={14}
            className="shrink-0 text-txt-tertiary transition-transform duration-200 group-data-[state=open]/menu-button:rotate-180"
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-76 origin-top-left overflow-hidden rounded-md border border-border-strong bg-bg-surface-1 py-1 shadow-raised-200 animate-in fade-in zoom-in duration-100"
          sideOffset={8}
          align="start"
        >
          <div className="px-4 pt-3 pb-2">
            <span className="text-xs font-medium text-txt-tertiary">
              {user?.email}
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto overflow-x-hidden">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className="flex items-center justify-between gap-2 px-2 py-1.5"
              >
                <DropdownMenu.Item
                  onSelect={() => {
                    if (workspace.id === currentWorkspace?.id) return;
                    router.push(`/${workspace.slug}`);
                  }}
                  className="flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-sm text-txt-primary outline-none cursor-pointer hover:bg-bg-surface-2 transition-colors"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-bg-surface-2 text-[10px] font-bold text-txt-accent-primary">
                    {workspace.name[0]}
                  </div>
                  <span className="truncate">{workspace.name}</span>
                  {workspace.id === currentWorkspace?.id && (
                    <Check
                      size={14}
                      className="ml-auto text-txt-accent-primary"
                    />
                  )}
                </DropdownMenu.Item>

                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    router.push(`/${workspace.slug}/settings`);
                  }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-txt-tertiary transition-colors hover:bg-bg-surface-2 hover:text-txt-primary"
                  aria-label={`Open ${workspace.name} settings`}
                  title="Workspace settings"
                >
                  <Settings size={14} />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    router.push(`/${workspace.slug}/settings/members`);
                  }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-txt-tertiary transition-colors hover:bg-bg-surface-2 hover:text-txt-primary"
                  aria-label={`Add members to ${workspace.name}`}
                  title="Add members"
                >
                  <UserPlus size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-1 flex flex-col gap-1 border-t border-border-subtle px-2 py-2">
            <DropdownMenu.Item asChild>
              <Link
                href="/workspace/create"
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-txt-secondary outline-none hover:bg-bg-surface-2 transition-colors"
              >
                <CirclePlus size={16} />
                {t("createWorkspace")}
              </Link>
            </DropdownMenu.Item>

            <DropdownMenu.Item asChild>
              <Link
                href="/invitations"
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-txt-secondary outline-none hover:bg-bg-surface-2 transition-colors"
              >
                <Mails size={16} />
                {t("workspaceInvitations")}
              </Link>
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onSelect={handleSignOut}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-red-500 outline-none cursor-pointer hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              {t("signOut")}
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
});
