import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_COVER_IMAGE_URL,
  getCoverImageDisplayURL,
  getRandomCoverImage,
  isStaticCoverImage,
  STATIC_COVER_IMAGES,
} from "./cover-image.helper";

describe("cover image helper", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("detects static image urls", () => {
    expect(isStaticCoverImage(STATIC_COVER_IMAGES.IMAGE_1)).toBe(true);
    expect(isStaticCoverImage("/unknown/image.jpg")).toBe(false);
    expect(isStaticCoverImage(null)).toBe(false);
  });

  it("returns fallback when url is missing", () => {
    expect(getCoverImageDisplayURL(undefined, DEFAULT_COVER_IMAGE_URL)).toBe(
      DEFAULT_COVER_IMAGE_URL,
    );
  });

  it("returns deterministic random static image", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    expect(getRandomCoverImage()).toBe(STATIC_COVER_IMAGES.IMAGE_1);
  });
});
