"use client";

import { observer } from "mobx-react";
import { useParams, usePathname } from "next/navigation";
import React from "react";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/breadcrumb";
import {
  EHeaderVariant,
  Header,
  HeaderLeftItem,
  HeaderRightItem,
} from "@/components/ui/header";
import { useWorkspace } from "@/core/lib/store-context";
import { usePageHeader } from "./page-header-context";

export const PageHeader = observer(function PageHeader() {
  const params = useParams();
  const pathname = usePathname();
  const workspaceStore = useWorkspace();
  const workspace = workspaceStore.currentWorkspace;
  const { rightItems } = usePageHeader();
  const normalizeParam = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;
  const workspaceSlug = normalizeParam(
    params.workspaceSlug as string | string[] | undefined,
  );
  const projectSlug = normalizeParam(
    params.projectSlug as string | string[] | undefined,
  );

  const projectName = projectSlug
    ? workspace?.projects?.find(
        (project) =>
          project.identifier?.toLowerCase() === projectSlug.toLowerCase(),
      )?.name
    : null;

  const breadcrumbItems: BreadcrumbItem[] = React.useMemo(() => {
    if (!pathname) return [];

    const segments = pathname
      .split("/")
      .filter((segment) => segment.length > 0);

    return segments.map((segment, index, arr) => {
      let label = decodeURIComponent(segment)
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      if (workspaceSlug && segment === workspaceSlug && workspace?.name) {
        label = workspace.name;
      } else if (projectSlug && segment === projectSlug && projectName) {
        label = projectName;
      }

      const href = `/${arr.slice(0, index + 1).join("/")}`;
      return { label, href };
    });
  }, [pathname, workspaceSlug, workspace?.name, projectSlug, projectName]);

  return (
    <Header
      variant={EHeaderVariant.PRIMARY}
      className="px-6 py-1 border-b border-border-subtle"
    >
      <HeaderLeftItem>
        <Breadcrumb items={breadcrumbItems} />
      </HeaderLeftItem>
      <HeaderRightItem>{rightItems}</HeaderRightItem>
    </Header>
  );
});
