"use client";

import { Sparkles } from "lucide-react";
import { type Control, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/core/lib/utils";
import type { ProjectFormData } from "./types";

type Props = {
  control: Control<ProjectFormData>;
  isAiOpen: boolean;
  setIsAiOpen: (open: boolean) => void;
  isGenerating: boolean;
  aiPrompt: string;
  setAiPrompt: (value: string) => void;
  onGenerateDescription: () => Promise<void>;
  onAiQuickAction: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => Promise<void>;
};

export function ProjectCommonDescriptionField({
  control,
  isAiOpen,
  setIsAiOpen,
  isGenerating,
  aiPrompt,
  setAiPrompt,
  onGenerateDescription,
  onAiQuickAction,
}: Props) {
  return (
    <div className="md:col-span-4">
      <span className="mb-2 block text-xs font-medium text-gray-600">
        Description
      </span>

      <div className="relative">
        <Popover open={isAiOpen} onOpenChange={setIsAiOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={isGenerating}
              onClick={onAiQuickAction}
              className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 transition hover:bg-gray-50"
            >
              <Sparkles
                size={13}
                className={cn(
                  "text-violet-600",
                  isGenerating && "animate-spin",
                )}
              />
              {isGenerating ? "AI..." : "AI"}
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[28rem] space-y-4 p-4"
            align="end"
            sideOffset={6}
          >
            <div className="space-y-1">
              <p className="text-sm font-semibold text-gray-900">
                Generate Description
              </p>
              <p className="text-xs text-gray-500">
                If Description is empty, enter a prompt here. If Description
                already has text, click AI to generate directly from it.
              </p>
            </div>

            <Textarea
              value={aiPrompt}
              onChange={(event) => setAiPrompt(event.target.value)}
              placeholder="Example: Project management platform for distributed teams with Kanban and sprint planning."
              className="h-36 w-full resize-none"
            />

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsAiOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={onGenerateDescription}
                disabled={!aiPrompt.trim() || isGenerating}
              >
                {isGenerating ? "Generating..." : "Generate"}
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Controller
          name="description"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Textarea
              id="description"
              name="description"
              value={value}
              placeholder="Description"
              onChange={onChange}
              className="h-24 w-full resize-none pr-16 pb-8"
            />
          )}
        />

        {isGenerating && (
          <div className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-violet-50 px-2 py-1 text-[11px] text-violet-700">
            <Sparkles size={12} className="animate-spin text-violet-600" />
            Generating...
          </div>
        )}
      </div>
    </div>
  );
}
