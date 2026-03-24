"use client";

import {
  DEFAULT_COVER_IMAGE_URL,
  getCoverImageDisplayURL,
} from "@/core/helpers/cover-image.helper";
import { cn } from "@/core/lib/utils";

type TCoverImageProps = {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  showDefaultWhenEmpty?: boolean;
  fallbackUrl?: string;
} & React.ComponentProps<"img">;

export function CoverImage(props: TCoverImageProps) {
  const {
    src,
    alt = "Cover image",
    className,
    showDefaultWhenEmpty = false,
    fallbackUrl = DEFAULT_COVER_IMAGE_URL,
    ...restProps
  } = props;

  if (!src && !showDefaultWhenEmpty) {
    return <div className={cn("animate-pulse bg-gray-200", className)} />;
  }

  const displayUrl = getCoverImageDisplayURL(src, fallbackUrl);

  return (
    // biome-ignore lint/performance/noImgElement: This component intentionally supports arbitrary image urls and native img attributes.
    <img
      src={displayUrl}
      alt={alt}
      className={cn("object-cover", className)}
      {...restProps}
    />
  );
}
