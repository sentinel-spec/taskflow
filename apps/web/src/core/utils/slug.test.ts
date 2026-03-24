import { describe, expect, it } from "vitest";
import { generateSlug, isValidSlug, transliterate } from "./slug";

describe("slug utils", () => {
  it("transliterates Cyrillic and diacritics", () => {
    expect(transliterate("Привет мир")).toBe("Privet mir");
    expect(transliterate("Crème brûlée")).toBe("Creme brulee");
  });

  it("generates normalized slug", () => {
    expect(generateSlug("  Привет, Мир!  ")).toBe("privet-mir");
    expect(generateSlug("A__B   C")).toBe("a-b-c");
    expect(generateSlug("")).toBe("");
  });

  it("respects max length and validates format", () => {
    const slug = generateSlug("a".repeat(100), 10);
    expect(slug.length).toBe(10);
    expect(isValidSlug(slug)).toBe(true);
    expect(isValidSlug("Invalid Slug")).toBe(false);
  });
});
