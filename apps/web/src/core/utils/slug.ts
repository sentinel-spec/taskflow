/**
 * Transliterates Unicode text to ASCII for slug generation.
 * Supports Cyrillic, Latin with diacritics, Greek, and other common scripts.
 */
export function transliterate(text: string): string {
  const cyrillicMap: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "g",
    д: "d",
    е: "e",
    ё: "e",
    ж: "zh",
    з: "z",
    и: "i",
    й: "y",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "h",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "sch",
    ъ: "",
    ы: "y",
    ь: "",
    э: "e",
    ю: "yu",
    я: "ya",
    А: "A",
    Б: "B",
    В: "V",
    Г: "G",
    Д: "D",
    Е: "E",
    Ё: "E",
    Ж: "Zh",
    З: "Z",
    И: "I",
    Й: "Y",
    К: "K",
    Л: "L",
    М: "M",
    Н: "N",
    О: "O",
    П: "P",
    Р: "R",
    С: "S",
    Т: "T",
    У: "U",
    Ф: "F",
    Х: "H",
    Ц: "Ts",
    Ч: "Ch",
    Ш: "Sh",
    Щ: "Sch",
    Ъ: "",
    Ы: "Y",
    Ь: "",
    Э: "E",
    Ю: "Yu",
    Я: "Ya",
  };

  const greekMap: Record<string, string> = {
    α: "a",
    β: "v",
    γ: "g",
    δ: "d",
    ε: "e",
    ζ: "z",
    η: "i",
    θ: "th",
    ι: "i",
    κ: "k",
    λ: "l",
    μ: "m",
    ν: "n",
    ξ: "ks",
    ο: "o",
    π: "p",
    ρ: "r",
    σ: "s",
    τ: "t",
    υ: "y",
    φ: "f",
    χ: "ch",
    ψ: "ps",
    ω: "o",
    Α: "A",
    Β: "V",
    Γ: "G",
    Δ: "D",
    Ε: "E",
    Ζ: "Z",
    Η: "I",
    Θ: "Th",
    Ι: "I",
    Κ: "K",
    Λ: "L",
    Μ: "M",
    Ν: "N",
    Ξ: "Ks",
    Ο: "O",
    Π: "P",
    Ρ: "R",
    Σ: "S",
    Τ: "T",
    Υ: "Y",
    Φ: "F",
    Χ: "Ch",
    Ψ: "Ps",
    Ω: "O",
  };

  const diacriticsMap: Record<string, string> = {
    // Latin with diacritics
    à: "a",
    á: "a",
    â: "a",
    ã: "a",
    ä: "a",
    å: "a",
    æ: "ae",
    ç: "c",
    è: "e",
    é: "e",
    ê: "e",
    ë: "e",
    ì: "i",
    í: "i",
    î: "i",
    ï: "i",
    ñ: "n",
    ò: "o",
    ó: "o",
    ô: "o",
    õ: "o",
    ö: "o",
    ø: "o",
    ù: "u",
    ú: "u",
    û: "u",
    ü: "u",
    ý: "y",
    ÿ: "y",
    ß: "ss",
    À: "A",
    Á: "A",
    Â: "A",
    Ã: "A",
    Ä: "A",
    Å: "A",
    Æ: "Ae",
    Ç: "C",
    È: "E",
    É: "E",
    Ê: "E",
    Ë: "E",
    Ì: "I",
    Í: "I",
    Î: "I",
    Ï: "I",
    Ñ: "N",
    Ò: "O",
    Ó: "O",
    Ô: "O",
    Õ: "O",
    Ö: "O",
    Ø: "O",
    Ù: "U",
    Ú: "U",
    Û: "U",
    Ü: "U",
    Ý: "Y",
  };

  // Apply transliteration maps
  let result = text;

  // Apply Cyrillic mapping
  for (const [cyrillic, latin] of Object.entries(cyrillicMap)) {
    result = result.replace(new RegExp(cyrillic, "g"), latin);
  }

  // Apply Greek mapping
  for (const [greek, latin] of Object.entries(greekMap)) {
    result = result.replace(new RegExp(greek, "g"), latin);
  }

  // Apply diacritics mapping
  for (const [diacritic, latin] of Object.entries(diacriticsMap)) {
    result = result.replace(new RegExp(diacritic, "g"), latin);
  }

  return result;
}

/**
 * Generates a URL-safe slug from any text input.
 * - Transliterates non-ASCII characters
 * - Converts to lowercase
 * - Replaces spaces and special chars with hyphens
 * - Removes invalid characters
 * - Trims length
 */
export function generateSlug(text: string, maxLength: number = 48): string {
  if (!text) return "";

  // Transliterate to ASCII
  let slug = transliterate(text);

  // Convert to lowercase
  slug = slug.toLowerCase();

  // Replace spaces and underscores with hyphens
  slug = slug.replace(/[\s_]+/g, "-");

  // Remove all non-alphanumeric characters except hyphens
  slug = slug.replace(/[^a-z0-9-]/g, "");

  // Remove leading/trailing hyphens
  slug = slug.replace(/^-+|-+$/g, "");

  // Remove multiple consecutive hyphens
  slug = slug.replace(/-+/g, "-");

  // Trim to max length
  if (slug.length > maxLength) {
    slug = slug.slice(0, maxLength);
    // Remove trailing hyphen after truncation
    slug = slug.replace(/-+$/g, "");
  }

  return slug;
}

/**
 * Validates if a slug is valid (lowercase letters, numbers, hyphens only)
 */
export function isValidSlug(slug: string): boolean {
  if (!slug) return false;
  return /^[a-z0-9-]+$/.test(slug);
}
