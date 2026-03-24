"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/core/lib/utils";
import { EmojiRoot } from "./emoji/emoji";
import type { TChangeHandlerProps, TEmojiIconPickerTypes } from "./helper";
import { EmojiIconPickerTypes, emojiToString } from "./helper";
import { IconRoot } from "./icon/icon-root";

type TCustomEmojiPicker = {
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

export function EmojiPicker(props: TCustomEmojiPicker) {
  const {
    isOpen,
    handleToggle,
    buttonClassName,
    closeOnSelect = true,
    defaultIconColor = "#6d7b8a",
    defaultOpen = EmojiIconPickerTypes.ICON,
    disabled = false,
    dropdownClassName,
    label,
    onChange,
    searchDisabled = false,
    searchPlaceholder = "Search",
    iconType = "material",
  } = props;

  const [activeTab, setActiveTab] =
    useState<TEmojiIconPickerTypes>(defaultOpen);

  useEffect(() => {
    setActiveTab(defaultOpen);
  }, [defaultOpen]);

  const handleEmojiChange = useCallback(
    (value: string) => {
      onChange({
        type: EmojiIconPickerTypes.EMOJI,
        value: emojiToString(value),
      });
      if (closeOnSelect) handleToggle(false);
    },
    [onChange, closeOnSelect, handleToggle],
  );

  const handleIconChange = useCallback(
    (value: { name: string; color: string }) => {
      onChange({
        type: EmojiIconPickerTypes.ICON,
        value: value,
      });
      if (closeOnSelect) handleToggle(false);
    },
    [onChange, closeOnSelect, handleToggle],
  );

  const tabs = useMemo(
    () =>
      [
        {
          key: "emoji",
          label: "Emoji",
          content: (
            <div className="h-full min-h-0">
              <EmojiRoot
                onChange={handleEmojiChange}
                searchPlaceholder={searchPlaceholder}
                searchDisabled={searchDisabled}
              />
            </div>
          ),
        },
        {
          key: "icon",
          label: "Icon",
          content: (
            <div className="h-full min-h-0">
              <div className="h-full min-h-0 px-2 pb-2">
                <IconRoot
                  defaultColor={defaultIconColor}
                  onChange={handleIconChange}
                  searchDisabled={searchDisabled}
                  iconType={iconType}
                />
              </div>
            </div>
          ),
        },
      ].map((tab) => ({
        key: tab.key,
        label: tab.label,
        content: tab.content,
      })),
    [
      defaultIconColor,
      searchDisabled,
      searchPlaceholder,
      iconType,
      handleEmojiChange,
      handleIconChange,
    ],
  );

  return (
    <Popover open={isOpen} onOpenChange={handleToggle}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn("outline-none", buttonClassName)}
          disabled={disabled}
          onClick={(e) => e.stopPropagation()}
        >
          {label}
        </button>
      </PopoverTrigger>

      {isOpen && (
        <PopoverContent
          className={cn(
            "z-[80] h-[24rem] max-h-[60vh] w-80 overflow-hidden p-0",
            dropdownClassName,
          )}
          sideOffset={8}
          align="start"
        >
          <div className="flex h-full min-h-0 flex-col">
            {/* Tabs */}
            <div className="grid grid-cols-2 gap-1 px-3.5 pt-3">
              {tabs.map((tab) => (
                <button
                  type="button"
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as TEmojiIconPickerTypes)}
                  className={cn(
                    "rounded-sm border border-gray-200 bg-gray-50 py-1 text-sm transition-colors",
                    activeTab === tab.key
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="min-h-0 flex-1 overflow-hidden">
              {tabs.find((tab) => tab.key === activeTab)?.content}
            </div>
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
}
