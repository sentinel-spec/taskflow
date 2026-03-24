"use client";

import useFontFaceObserver from "use-font-face-observer";
import { getEmojiSize, stringToEmoji } from "./helper";
import { LUCIDE_ICONS_LIST } from "./lucide-icons";

type TLogoProps = {
  in_use?: "emoji" | "icon" | null;
  emoji?: { value?: string | null } | null;
  icon?: { name?: string | null; color?: string | null } | null;
};

type Props = {
  logo?: TLogoProps;
  size?: number;
  type?: "lucide" | "material";
};

export function Logo({ logo, size = 16, type = "material" }: Props) {
  const isMaterialSymbolsFontLoaded = useFontFaceObserver([
    {
      family: "Material Symbols Rounded",
      style: "normal",
      weight: "normal",
      stretch: "condensed",
    },
  ]);

  const loadingSkeleton = (
    <span
      style={{ height: size, width: size }}
      className="rounded-sm bg-gray-100"
    />
  );

  if (!logo || !logo.in_use) return loadingSkeleton;

  const { in_use, emoji, icon } = logo;
  const value = in_use === "emoji" ? emoji?.value : icon?.name;

  if (!value) return loadingSkeleton;

  if (in_use === "emoji") {
    return (
      <span
        className="flex items-center justify-center"
        style={{
          fontSize: `${getEmojiSize(size)}rem`,
          lineHeight: `${getEmojiSize(size)}rem`,
          height: size,
          width: size,
        }}
      >
        {stringToEmoji(emoji?.value || "")}
      </span>
    );
  }

  if (in_use === "icon") {
    const color = icon?.color || "#6d7b8a";

    if (type === "lucide") {
      const lucideIcon = LUCIDE_ICONS_LIST.find((item) => item.name === value);
      if (!lucideIcon) return null;

      const LucideIconElement = lucideIcon.element;
      return <LucideIconElement style={{ color, height: size, width: size }} />;
    }

    if (!isMaterialSymbolsFontLoaded) return loadingSkeleton;

    return (
      <span
        className="material-symbols-rounded"
        style={{
          fontSize: size,
          color,
          scale: "115%",
        }}
      >
        {value}
      </span>
    );
  }

  return null;
}

export type { TLogoProps };
