export const EmojiIconPickerTypes = {
  EMOJI: "emoji",
  ICON: "icon",
} as const;

export type TEmojiIconPickerTypes =
  | typeof EmojiIconPickerTypes.EMOJI
  | typeof EmojiIconPickerTypes.ICON;

export type TChangeHandlerProps =
  | {
      type: typeof EmojiIconPickerTypes.EMOJI;
      value: string;
    }
  | {
      type: typeof EmojiIconPickerTypes.ICON;
      value: {
        name: string;
        color: string;
      };
    };

export type TCustomEmojiPicker = {
  isOpen: boolean;
  handleToggle: (value: boolean) => void;
  buttonClassName?: string;
  className?: string;
  closeOnSelect?: boolean;
  defaultIconColor?: string;
  defaultOpen?: TEmojiIconPickerTypes;
  disabled?: boolean;
  dropdownClassName?: string;
  label: React.ReactNode;
  onChange: (value: TChangeHandlerProps) => void;
  searchDisabled?: boolean;
  searchPlaceholder?: string;
  iconType?: "material" | "lucide";
};

export const DEFAULT_COLORS = [
  "#95999f",
  "#6d7b8a",
  "#5e6ad2",
  "#02b5ed",
  "#02b55c",
  "#f2be02",
  "#e57a00",
  "#f38e82",
];

export function emojiToDecimalEnhanced(emoji: string): number[] {
  const codePoints: number[] = [];
  const characters = Array.from(emoji);

  for (const char of characters) {
    const codePoint = char.codePointAt(0);
    if (codePoint !== undefined) {
      codePoints.push(codePoint);
    }
  }

  return codePoints;
}

export function decimalToEmojiEnhanced(decimals: number[]): string {
  return decimals.map((decimal) => String.fromCodePoint(decimal)).join("");
}

export function emojiToString(emoji: string): string {
  const decimals = emojiToDecimalEnhanced(emoji);
  return decimals.join("-");
}

export function stringToEmoji(emojiString: string): string {
  if (!emojiString) return "";
  const decimals = emojiString
    .split("-")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n >= 0 && n <= 0x10ffff);
  try {
    return decimalToEmojiEnhanced(decimals);
  } catch {
    return "";
  }
}

export const getEmojiSize = (size: number) => size * 0.9 * 0.0625;

export function adjustColorForContrast(hex: string): string {
  if (!/^#([0-9A-F]{3}){1,2}$/i.test(hex)) {
    throw new Error("Invalid hex color code");
  }

  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  if (luminance > 0.5) {
    r = Math.max(0, r - 50);
    g = Math.max(0, g - 50);
    b = Math.max(0, b - 50);
  }

  const toHex = (value: number): string => {
    const hex = value.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
