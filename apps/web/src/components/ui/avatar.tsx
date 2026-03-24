import Image from "next/image";
import * as React from "react";
import { cn } from "@/core/lib/utils";

type AvatarProps = {
  src?: string | null;
  alt?: string;
  fallback?: string;
  className?: string;
  imageClassName?: string;
};

function getFallbackText(value?: string) {
  if (!value) return "U";
  return value.trim().slice(0, 2).toUpperCase();
}

export function Avatar({
  src,
  alt = "Avatar",
  fallback,
  className,
  imageClassName,
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  const imageSrc = src?.trim();
  const shouldShowImage = Boolean(imageSrc) && !imageError;

  return (
    <div
      data-slot="avatar"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-xs font-semibold text-gray-700",
        className,
      )}
    >
      {shouldShowImage ? (
        <Image
          src={imageSrc as string}
          alt={alt}
          width={32}
          height={32}
          className={cn("size-full object-cover", imageClassName)}
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{getFallbackText(fallback)}</span>
      )}
    </div>
  );
}
