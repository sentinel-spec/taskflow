// Images from public folder - these are served statically
export const STATIC_COVER_IMAGES = {
  IMAGE_1: "/cover-images/image_1.jpg",
  IMAGE_2: "/cover-images/image_2.jpg",
  IMAGE_3: "/cover-images/image_3.jpg",
  IMAGE_4: "/cover-images/image_4.jpg",
  IMAGE_5: "/cover-images/image_5.jpg",
  IMAGE_6: "/cover-images/image_6.jpg",
  IMAGE_7: "/cover-images/image_7.jpg",
  IMAGE_8: "/cover-images/image_8.jpg",
  IMAGE_9: "/cover-images/image_9.jpg",
  IMAGE_10: "/cover-images/image_10.jpg",
  IMAGE_11: "/cover-images/image_11.jpg",
  IMAGE_12: "/cover-images/image_12.jpg",
  IMAGE_13: "/cover-images/image_13.jpg",
  IMAGE_14: "/cover-images/image_14.jpg",
  IMAGE_15: "/cover-images/image_15.jpg",
  IMAGE_16: "/cover-images/image_16.jpg",
  IMAGE_17: "/cover-images/image_17.jpg",
  IMAGE_18: "/cover-images/image_18.jpg",
  IMAGE_19: "/cover-images/image_19.jpg",
  IMAGE_20: "/cover-images/image_20.jpg",
} as const;

export const DEFAULT_COVER_IMAGE_URL = STATIC_COVER_IMAGES.IMAGE_1;

const STATIC_COVER_IMAGES_SET = new Set<string>(
  Object.values(STATIC_COVER_IMAGES),
);

export const isStaticCoverImage = (
  imageUrl: string | null | undefined,
): boolean => {
  if (!imageUrl || typeof imageUrl !== "string") return false;
  return STATIC_COVER_IMAGES_SET.has(imageUrl);
};

export const getCoverImageDisplayURL = (
  imageUrl: string | null | undefined,
  fallbackUrl: string,
): string => {
  if (!imageUrl) {
    return fallbackUrl;
  }

  if (isStaticCoverImage(imageUrl)) {
    return imageUrl;
  }

  return imageUrl;
};

export const getRandomCoverImage = (): string => {
  const keys = Object.keys(STATIC_COVER_IMAGES) as Array<
    keyof typeof STATIC_COVER_IMAGES
  >;
  const randomKey = keys[Math.floor(Math.random() * keys.length)];
  return STATIC_COVER_IMAGES[randomKey];
};
