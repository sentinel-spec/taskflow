"use client";

import { X } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import { type Control, Controller, type UseFormWatch } from "react-hook-form";
import { CoverImage } from "@/core/components/common/cover-image";
import {
  EmojiIconPickerTypes,
  Logo,
} from "@/core/components/project/emoji-icon-picker";
import { useNavigationTranslations } from "@/i18n/hooks";
import type { ProjectFormData } from "./types";

const ImagePickerPopover = dynamic(
  () =>
    import("@/core/components/core/image-picker-popover").then(
      (module) => module.ImagePickerPopover,
    ),
  { ssr: false },
);

const EmojiPicker = dynamic(
  () =>
    import("@/core/components/project/emoji-icon-picker").then(
      (module) => module.EmojiPicker,
    ),
  { ssr: false },
);

type Props = {
  handleClose: () => void;
  watch: UseFormWatch<ProjectFormData>;
  control: Control<ProjectFormData>;
  isMobile?: boolean;
  isClosable?: boolean;
};

export function ProjectCreateHeader(props: Props) {
  const { handleClose, isClosable = true, watch, control } = props;
  const tNav = useNavigationTranslations();

  const coverImage = watch("cover_image_url");

  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  return (
    <div className="group relative h-44 w-full rounded-lg">
      {/* Cover Image */}
      <CoverImage
        src={coverImage}
        alt={tNav("projectCoverImageAlt")}
        className="absolute top-0 left-0 h-full w-full rounded-lg"
      />

      {/* Close Button */}
      {isClosable && (
        <div className="absolute top-2 right-2 p-2 z-10">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-1 hover:bg-black/20 text-white/70 hover:text-white transition-all"
            aria-label={tNav("closeModal")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Image Picker (Bottom Right) */}
      <div className="absolute right-2 bottom-2 z-10">
        <Controller
          name="cover_image_url"
          control={control}
          render={({ field: { value, onChange } }) => (
            <ImagePickerPopover
              label={tNav("changeCover")}
              value={value ?? null}
              onChange={onChange}
              tabIndex={0}
            />
          )}
        />
      </div>

      {/* Emoji/Icon Picker (Bottom Left - Overlapping) */}
      <div className="absolute -bottom-[22px] left-3 z-20">
        <Controller
          name="logo_props"
          control={control}
          render={({ field: { value, onChange } }) => (
            <EmojiPicker
              iconType="material"
              isOpen={isEmojiPickerOpen}
              handleToggle={setIsEmojiPickerOpen}
              className="flex items-center justify-center"
              buttonClassName="flex items-center justify-center"
              label={
                <span className="grid h-11 w-11 place-items-center rounded-md border border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-all">
                  <Logo logo={value} size={20} />
                </span>
              }
              onChange={(val) => {
                let logoValue = {};

                if (val.type === "emoji") {
                  logoValue = {
                    value: val.value,
                  };
                } else if (val.type === "icon") {
                  logoValue = val.value;
                }

                const newLogoProps = {
                  in_use: val.type,
                  [val.type]: logoValue,
                };
                onChange(newLogoProps);
                setIsEmojiPickerOpen(false);
              }}
              defaultIconColor={
                value?.in_use && value.in_use === "icon"
                  ? (value.icon?.color ?? undefined)
                  : "#6d7b8a"
              }
              defaultOpen={
                value?.in_use && value.in_use === "emoji"
                  ? EmojiIconPickerTypes.EMOJI
                  : EmojiIconPickerTypes.ICON
              }
            />
          )}
        />
      </div>
    </div>
  );
}
