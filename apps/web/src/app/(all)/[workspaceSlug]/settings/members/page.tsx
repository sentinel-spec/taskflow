"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { setToast, TOAST_TYPE } from "@/core/lib/toast";
import { workspaceService } from "@/core/services/workspace.service";
import type {
  InviteWorkspaceMembersDto,
  WorkspaceMemberDto,
} from "@/core/types/dto/workspace.dto";
import { ChevronDown, Plus, Search, Upload, UserPlus, X } from "lucide-react";
import { observer } from "mobx-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import useSWR from "swr";

const getFullName = (member: WorkspaceMemberDto) => {
  const firstName = member.user.firstName?.trim() || "";
  const lastName = member.user.lastName?.trim() || "";
  return `${firstName} ${lastName}`.trim() || member.user.email;
};

const MEMBERS_SW_KEY = (workspaceSlug: string) =>
  `WORKSPACE_MEMBERS_${workspaceSlug}`;

const getDisplayName = (member: WorkspaceMemberDto) => {
  const base =
    member.user.firstName?.trim() ||
    member.user.email.split("@")[0] ||
    "member";
  return base.replace(/\s+/g, ".").toLowerCase();
};

const getJoinedDate = (member: WorkspaceMemberDto) => {
  const date = new Date(member.createdAt);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
};

const formatRole = (role: WorkspaceMemberDto["role"]) =>
  role === "OWNER" ? "Owner" : "Member";

type InviteRow = {
  id: string;
  email: string;
  role: "OWNER" | "MEMBER";
};

const createInviteRow = (): InviteRow => ({
  id: Math.random().toString(36).slice(2, 11),
  email: "",
  role: "MEMBER",
});

export default observer(function WorkspaceMembersSettingsPage() {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "OWNER" | "MEMBER">(
    "ALL",
  );
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteRows, setInviteRows] = useState<InviteRow[]>([
    createInviteRow(),
  ]);
  const [isInviting, setIsInviting] = useState(false);

  const {
    data: members,
    mutate,
    isLoading,
  } = useSWR(workspaceSlug ? MEMBERS_SW_KEY(workspaceSlug) : null, () =>
    workspaceService.listMembers(workspaceSlug!),
  );

  const filteredMembers = useMemo(() => {
    const list = members || [];
    const normalizedSearch = search.trim().toLowerCase();

    return list.filter((member) => {
      const roleMatches = roleFilter === "ALL" || member.role === roleFilter;
      if (!roleMatches) return false;

      if (!normalizedSearch) return true;
      const name = getFullName(member).toLowerCase();
      const email = member.user.email.toLowerCase();
      return (
        name.includes(normalizedSearch) || email.includes(normalizedSearch)
      );
    });
  }, [members, roleFilter, search]);

  const handleInvite = async () => {
    if (!workspaceSlug) return;

    const normalizedRows = inviteRows
      .map((row) => ({
        ...row,
        email: row.email.trim().toLowerCase(),
      }))
      .filter((row) => row.email.length > 0);

    if (normalizedRows.length === 0) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Invite failed",
        message: "Add at least one email address.",
      });
      return;
    }

    const invalidEmails = normalizedRows
      .map((row) => row.email)
      .filter((email) => !email.includes("@"));

    if (invalidEmails.length > 0) {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Invite failed",
        message: "Please enter valid email addresses.",
      });
      return;
    }

    setIsInviting(true);
    try {
      const groupedByRole = normalizedRows.reduce<
        Record<"OWNER" | "MEMBER", string[]>
      >(
        (acc, row) => {
          acc[row.role].push(row.email);
          return acc;
        },
        { OWNER: [], MEMBER: [] },
      );

      const requests: InviteWorkspaceMembersDto[] = [];
      if (groupedByRole.OWNER.length > 0) {
        requests.push({ emails: groupedByRole.OWNER, role: "OWNER" });
      }
      if (groupedByRole.MEMBER.length > 0) {
        requests.push({ emails: groupedByRole.MEMBER, role: "MEMBER" });
      }

      const responses = await Promise.all(
        requests.map((payload) =>
          workspaceService.inviteMembers(workspaceSlug, payload),
        ),
      );

      const invitationCount = responses.reduce(
        (acc, response) => acc + response.invitations.length,
        0,
      );

      setToast({
        type: TOAST_TYPE.SUCCESS,
        title: "Invitations sent",
        message: `${invitationCount} invitation(s) created.`,
      });
      setInviteRows([createInviteRow()]);
      setIsInviteOpen(false);
      await mutate();
    } catch {
      setToast({
        type: TOAST_TYPE.ERROR,
        title: "Invite failed",
        message: "Could not send invitations.",
      });
    } finally {
      setIsInviting(false);
    }
  };

  const updateInviteRow = (
    rowId: string,
    field: "email" | "role",
    value: string,
  ) => {
    setInviteRows((rows) =>
      rows.map((row) => {
        if (row.id !== rowId) return row;
        if (field === "role") {
          return { ...row, role: value as "OWNER" | "MEMBER" };
        }
        return { ...row, email: value };
      }),
    );
  };

  const addInviteRow = () => {
    setInviteRows((rows) => [...rows, createInviteRow()]);
  };

  const removeInviteRow = (rowId: string) => {
    setInviteRows((rows) =>
      rows.length === 1
        ? [createInviteRow()]
        : rows.filter((row) => row.id !== rowId),
    );
  };

  return (
    <div className="overflow-hidden">
      <header className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-txt-primary">Участники</h1>
          <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-bg-surface-3 px-2 py-0.5 text-xs font-semibold text-txt-secondary">
            {filteredMembers.length}
          </span>
        </div>
        <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
          <div className="relative w-full min-w-56 grow md:w-auto md:max-w-[320px] md:grow-0">
            <Search
              size={14}
              className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-txt-tertiary"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="h-9 pl-8"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value as "ALL" | "OWNER" | "MEMBER")
            }
            className="h-9 rounded-md border border-border-subtle bg-bg-surface-1 px-3 text-sm text-txt-primary outline-none transition-all hover:border-border-accent-strong focus:border-border-accent-strong"
          >
            <option value="ALL">Filters</option>
            <option value="OWNER">Владелец</option>
            <option value="MEMBER">Участник</option>
          </select>
          <Button variant="outline" size="lg" className="h-9">
            <Upload size={14} />
            Import
          </Button>
          <Button
            size="lg"
            className="h-9"
            onClick={() => setIsInviteOpen(true)}
          >
            <UserPlus size={14} />
            Add member
          </Button>
        </div>
      </header>

      <section className="p-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] divide-y divide-border-subtle">
            <thead>
              <tr className="text-left text-sm font-medium text-txt-secondary">
                <th className="px-3 py-3">
                  <div className="flex items-center gap-1">
                    Full name
                    <ChevronDown size={14} />
                  </div>
                </th>
                <th className="px-3 py-3">
                  <div className="flex items-center gap-1">
                    Display name
                    <ChevronDown size={14} />
                  </div>
                </th>
                <th className="px-3 py-3">
                  <div className="flex items-center gap-1">
                    Email
                    <ChevronDown size={14} />
                  </div>
                </th>
                <th className="px-3 py-3">
                  <div className="flex items-center gap-1">
                    Role
                    <ChevronDown size={14} />
                  </div>
                </th>
                <th className="px-3 py-3">Billing Status</th>
                <th className="px-3 py-3">Authentication</th>
                <th className="px-3 py-3">
                  <div className="flex items-center gap-1">
                    Joining date
                    <ChevronDown size={14} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle bg-white text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-txt-secondary">
                    Loading members...
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-txt-secondary">
                    No members found.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={member.user.avatarUrl}
                          fallback={getFullName(member)}
                          className="size-7 bg-bg-accent-primary text-white"
                        />
                        <span className="font-medium text-txt-primary">
                          {getFullName(member)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-txt-secondary">
                      {getDisplayName(member)}
                    </td>
                    <td className="px-3 py-3 text-txt-secondary">
                      {member.user.email}
                    </td>
                    <td className="px-3 py-3 text-txt-primary">
                      {formatRole(member.role)}
                    </td>
                    <td className="px-3 py-3 text-txt-secondary">—</td>
                    <td className="px-3 py-3 text-txt-secondary">—</td>
                    <td className="px-3 py-3 text-txt-secondary">
                      {getJoinedDate(member)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog
        open={isInviteOpen}
        onOpenChange={(open) => {
          setIsInviteOpen(open);
          if (open) {
            setInviteRows([createInviteRow()]);
          }
        }}
      >
        <DialogContent
          title="Invite members"
          className="sm:max-w-[640px] p-5"
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle className="text-[32px] leading-tight font-semibold text-txt-primary">
              Invite people to collaborate
            </DialogTitle>
            <DialogDescription>
              Invite people to collaborate on your workspace.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {inviteRows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-3"
              >
                <Input
                  value={row.email}
                  onChange={(e) =>
                    updateInviteRow(row.id, "email", e.target.value)
                  }
                  placeholder="name@company.com"
                  className="h-11"
                  type="email"
                />
                <select
                  value={row.role}
                  onChange={(e) =>
                    updateInviteRow(row.id, "role", e.target.value)
                  }
                  className="h-11 min-w-[120px] rounded-md border border-border-subtle bg-bg-surface-1 px-3 text-sm text-txt-primary outline-none transition-all hover:border-border-accent-strong focus:border-border-accent-strong"
                >
                  <option value="MEMBER">Member</option>
                  <option value="OWNER">Owner</option>
                </select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-txt-secondary hover:text-txt-primary"
                  onClick={() => removeInviteRow(row.id)}
                  aria-label="Remove invitation row"
                >
                  <X size={18} />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addInviteRow}
            className="mt-2 w-fit px-0 text-primary hover:text-primary/80"
          >
            <Plus size={14} />
            Add more
          </Button>

          <div className="mt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsInviteOpen(false)}
              disabled={isInviting}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleInvite} disabled={isInviting}>
              {isInviting ? "Sending..." : "Send invitations"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});
