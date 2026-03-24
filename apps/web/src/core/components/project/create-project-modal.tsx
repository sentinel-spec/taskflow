"use client";

import { observer } from "mobx-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { useNavigationTranslations } from "@/i18n/hooks";
import { CreateProjectForm } from "./create/root";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (projectId: string) => void;
  workspaceSlug?: string;
}

export const CreateProjectModal = observer(function CreateProjectModal({
  isOpen,
  onClose,
  onSuccess,
  workspaceSlug,
}: CreateProjectModalProps) {
  const tNav = useNavigationTranslations();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-full overflow-hidden p-0 focus:outline-none sm:max-w-4xl"
        title={tNav("createProject")}
      >
        <DialogDescription className="sr-only">
          Форма создания нового проекта в текущем workspace.
        </DialogDescription>
        <CreateProjectForm
          onClose={onClose}
          onSuccess={onSuccess}
          workspaceSlug={workspaceSlug}
        />
      </DialogContent>
    </Dialog>
  );
});
