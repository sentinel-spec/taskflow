"use client";

import { EmojiPicker } from "frimousse";
import { useEffect, useRef } from "react";
import { cn } from "@/core/lib/utils";

type EmojiRootProps = {
  onChange: (value: string) => void;
  searchPlaceholder?: string;
  searchDisabled?: boolean;
};

export function EmojiRoot(props: EmojiRootProps) {
  const {
    onChange,
    searchPlaceholder = "Search",
    searchDisabled = false,
  } = props;
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const focusInput = () => {
      const searchWrapper = searchWrapperRef.current;
      if (searchWrapper) {
        const inputElement = searchWrapper.querySelector("input");
        if (inputElement) {
          inputElement.removeAttribute("disabled");
          inputElement.focus();
        }
      }
    };
    focusInput();
  }, []);

  return (
    <EmojiPicker.Root
      data-slot="emoji-picker"
      className="isolate flex h-full min-h-0 w-full flex-col rounded-md border-none p-2"
      onEmojiSelect={(val) => onChange(val.emoji)}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-white px-1.5 py-2 [&>[data-slot='emoji-picker-search-wrapper']]:flex-grow [&>[data-slot='emoji-picker-search-wrapper']]:p-0">
        <div
          ref={searchWrapperRef}
          data-slot="emoji-picker-search-wrapper"
          className="p-2"
        >
          <EmojiPicker.Search
            placeholder={searchPlaceholder}
            disabled={searchDisabled}
            className="block h-full w-full flex-grow-0 rounded-md border border-gray-200 bg-transparent p-0 px-3 py-2 text-base placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <EmojiPicker.SkinToneSelector
          data-slot="emoji-picker-skin-tone-selector"
          className="hover:bg-gray-100 mx-2 mb-1.5 size-8 flex-shrink-0 rounded-md bg-white text-base"
        />
      </div>
      <EmojiPicker.Viewport
        data-slot="emoji-picker-content"
        className={cn(
          "relative flex-1 overflow-y-auto overscroll-contain outline-none",
        )}
        onWheelCapture={(e) => e.stopPropagation()}
      >
        <EmojiPicker.List
          data-slot="emoji-picker-list"
          className={cn("pb-2 select-none")}
          components={{
            CategoryHeader: ({ category, ...props }) => (
              <div
                data-slot="emoji-picker-list-category-header"
                className="bg-white px-3 pb-1.5 text-xs font-medium text-gray-500 sticky top-0 z-10"
                {...props}
              >
                {category.label}
              </div>
            ),
            Row: ({ children, ...props }) => (
              <div
                data-slot="emoji-picker-list-row"
                className="scroll-my-1.5 px-1.5"
                {...props}
              >
                {children}
              </div>
            ),
            Emoji: ({ emoji, ...props }) => (
              <button
                type="button"
                aria-label={emoji?.label ?? emoji?.emoji}
                data-slot="emoji-picker-list-emoji"
                className="data-active:bg-blue-50 flex size-8 items-center justify-center rounded-md text-base"
                {...props}
              >
                {emoji.emoji}
              </button>
            ),
          }}
        />
      </EmojiPicker.Viewport>
    </EmojiPicker.Root>
  );
}
