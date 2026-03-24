"use client";

import { Command } from "cmdk";
import { Command as CommandIcon, Search, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/core/lib/utils";

interface PowerKCommand {
  id: string;
  label: string;
  shortcut?: string;
  icon?: React.ReactNode;
  action?: () => void;
}

interface PowerKProps {
  commands?: PowerKCommand[];
}

export function PowerK({ commands = [] }: PowerKProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle command palette with Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const handleCommandSelect = useCallback((command: PowerKCommand) => {
    if (command.action) {
      command.action();
    }
    setOpen(false);
    setSearchTerm("");
  }, []);

  const handleClear = () => {
    setSearchTerm("");
    inputRef.current?.focus();
  };

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  return (
    <div className="relative">
      {/* Search Input */}
      <button
        type="button"
        className={cn(
          "flex h-8 w-[280px] items-center gap-2 rounded-md border border-border-subtle bg-bg-surface-2 px-3 text-txt-placeholder transition-all cursor-pointer hover:bg-bg-surface-1",
          {
            "w-[320px]": open,
          },
        )}
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
      >
        <Search size={14} className="shrink-0" />
        <span className="text-xs flex-1">Search or type a command...</span>
        <div className="flex items-center gap-1 rounded border border-border-subtle bg-white px-1.5 py-0.5 text-[10px] font-medium text-txt-tertiary">
          <span className="opacity-50">⌘</span>K
        </div>
      </button>

      {/* Backdrop */}
      {open && (
        <button
          type="button"
          aria-label="Close command palette"
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Command Palette Modal - Positioned directly below input */}
      {open && (
        <Command
          className="absolute top-full left-0 mt-2 z-50 w-[500px] rounded-lg border border-border-subtle bg-bg-surface-1 shadow-2xl"
          filter={(value, search) => {
            if (value.toLowerCase().includes(search.toLowerCase())) return 1;
            return 0;
          }}
        >
          <div className="flex items-center border-b border-border-subtle px-3">
            <Search size={16} className="mr-2 text-txt-tertiary" />
            <Command.Input
              ref={inputRef}
              value={searchTerm}
              onValueChange={setSearchTerm}
              placeholder="Type a command or search..."
              className="flex h-12 w-full bg-transparent py-3 text-sm text-txt-primary outline-none placeholder:text-txt-tertiary"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                className="rounded p-1 text-txt-tertiary hover:bg-bg-surface-2 hover:text-txt-primary"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-txt-tertiary">
              No results found.
            </Command.Empty>

            {/* Quick Commands */}
            <Command.Group heading="Suggestions">
              {commands.map((command) => (
                <Command.Item
                  key={command.id}
                  value={command.label}
                  onSelect={() => handleCommandSelect(command)}
                  className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-txt-primary data-[selected=true]:bg-bg-surface-2 data-[selected=true]:text-txt-primary"
                >
                  <div className="flex items-center gap-3">
                    {command.icon}
                    <span>{command.label}</span>
                  </div>
                  {command.shortcut && (
                    <kbd className="rounded border border-border-subtle bg-white px-1.5 py-0.5 text-[10px] font-medium text-txt-tertiary">
                      {command.shortcut}
                    </kbd>
                  )}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Separator className="my-2 h-px bg-border-subtle" />

            {/* Navigation */}
            <Command.Group heading="Navigation">
              <Command.Item
                value="Dashboard"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-txt-primary data-[selected=true]:bg-bg-surface-2"
              >
                <LayoutGrid size={16} className="text-txt-tertiary" />
                <span>Go to Dashboard</span>
              </Command.Item>
              <Command.Item
                value="Issues"
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-txt-primary data-[selected=true]:bg-bg-surface-2"
              >
                <CircleDot size={16} className="text-txt-tertiary" />
                <span>View Issues</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border-subtle bg-bg-surface-2 px-3 py-2 text-xs text-txt-tertiary">
            <div className="flex items-center gap-2">
              <CommandIcon size={12} />
              <span>Press</span>
              <kbd className="rounded border border-border-subtle bg-white px-1.5 py-0.5 text-[10px]">
                ⌘K
              </kbd>
              <span>to toggle</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Press</span>
              <kbd className="rounded border border-border-subtle bg-white px-1.5 py-0.5 text-[10px]">
                ↵
              </kbd>
              <span>to select</span>
            </div>
          </div>
        </Command>
      )}
    </div>
  );
}

// Simple icons for commands
function LayoutGrid({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      role="img"
      aria-label="Grid"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function CircleDot({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      role="img"
      aria-label="Circle"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
