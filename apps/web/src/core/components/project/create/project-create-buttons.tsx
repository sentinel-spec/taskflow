"use client";

import { Button } from "@/components/ui/button";
import { useCommonTranslations, useNavigationTranslations } from "@/i18n/hooks";

type Props = {
  handleClose: () => void;
  isMobile?: boolean;
  isSubmitting?: boolean;
};

export function ProjectCreateButtons(props: Props) {
  const { handleClose, isSubmitting = false } = props;
  const tCommon = useCommonTranslations();
  const tNav = useNavigationTranslations();

  return (
    <div className="flex justify-end gap-2 border-t border-gray-200 py-4">
      <Button
        variant="secondary"
        size="sm"
        onClick={handleClose}
        disabled={isSubmitting}
      >
        {tCommon("cancel")}
      </Button>
      <Button variant="default" size="sm" type="submit" disabled={isSubmitting}>
        {isSubmitting ? tCommon("creating") : tNav("createProject")}
      </Button>
    </div>
  );
}
