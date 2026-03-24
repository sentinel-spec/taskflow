"use client";

import {
  ArrowDownWideNarrow,
  Check,
  ChevronDown,
  ListFilter,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePageHeader } from "@/core/components/workspace/page-header-context";
import {
  useNavigationTranslations,
  useWorkspaceTranslations,
  useCommonTranslations,
} from "@/i18n/hooks";

type ProjectsHeaderActionsProps = {
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  visibilityFilter: "all" | "public" | "private";
  onVisibilityFilterChange: (value: "all" | "public" | "private") => void;
  sortBy: "recent" | "name-asc" | "name-desc";
  onSortByChange: (value: "recent" | "name-asc" | "name-desc") => void;
  onCreateProject: () => void;
};

export function ProjectsHeaderActions({
  searchQuery,
  onSearchQueryChange,
  visibilityFilter,
  onVisibilityFilterChange,
  sortBy,
  onSortByChange,
  onCreateProject,
}: ProjectsHeaderActionsProps) {
  const { setRightItems } = usePageHeader();
  const tw = useWorkspaceTranslations();
  const tn = useNavigationTranslations();
  const tc = useCommonTranslations();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filterSearchQuery, setFilterSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const filterInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenSearch = useCallback(() => {
    setIsSearchOpen(true);
    requestAnimationFrame(() => searchInputRef.current?.focus());
  }, []);

  const handleCloseSearch = useCallback(() => {
    onSearchQueryChange("");
    setIsSearchOpen(false);
  }, [onSearchQueryChange]);

  const sortLabel =
    sortBy === "recent"
      ? tw("recentlyCreated")
      : sortBy === "name-asc"
        ? tw("nameAZ")
        : tw("nameZA");

  const filterOptions = useMemo(
    () => [
      { key: "all" as const, label: tw("allProjects") },
      { key: "public" as const, label: tw("publicProjects") },
      { key: "private" as const, label: tw("privateProjects") },
    ],
    [tw],
  );

  const filteredFilterOptions = useMemo(
    () =>
      filterOptions.filter((option) =>
        option.label.toLowerCase().includes(filterSearchQuery.toLowerCase()),
      ),
    [filterOptions, filterSearchQuery],
  );
  const isFiltersApplied = visibilityFilter !== "all";

  useEffect(() => {
    setRightItems(
      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 md:flex">
          {!isSearchOpen ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleOpenSearch}
              aria-label={tc("search")}
            >
              <Search size={14} />
            </Button>
          ) : (
            <div className="relative">
              <Search
                size={14}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-txt-placeholder"
              />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(event) => onSearchQueryChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    if (searchQuery.trim().length > 0) {
                      onSearchQueryChange("");
                    } else {
                      setIsSearchOpen(false);
                    }
                  }
                }}
                placeholder={tw("searchProjects")}
                className="h-8 w-56 pr-8 pl-8"
              />
              <button
                type="button"
                onClick={handleCloseSearch}
                className="absolute right-2 top-1/2 grid -translate-y-1/2 place-items-center text-txt-placeholder hover:text-txt-secondary"
                aria-label={tc("close")}
              >
                <X size={12} />
              </button>
            </div>
          )}

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-2">
                <ArrowDownWideNarrow size={14} />
                <span className="hidden lg:inline">{sortLabel}</span>
                <ChevronDown size={12} className="text-txt-placeholder" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-52 p-1">
              <button
                type="button"
                onClick={() => onSortByChange("recent")}
                className="flex h-8 w-full items-center justify-between rounded-md px-2 text-sm text-txt-primary hover:bg-bg-surface-2"
              >
                <span>{tw("recentlyCreated")}</span>
                {sortBy === "recent" && <Check size={14} />}
              </button>
              <button
                type="button"
                onClick={() => onSortByChange("name-asc")}
                className="flex h-8 w-full items-center justify-between rounded-md px-2 text-sm text-txt-primary hover:bg-bg-surface-2"
              >
                <span>{tw("nameAZ")}</span>
                {sortBy === "name-asc" && <Check size={14} />}
              </button>
              <button
                type="button"
                onClick={() => onSortByChange("name-desc")}
                className="flex h-8 w-full items-center justify-between rounded-md px-2 text-sm text-txt-primary hover:bg-bg-surface-2"
              >
                <span>{tw("nameZA")}</span>
                {sortBy === "name-desc" && <Check size={14} />}
              </button>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-2">
                <ListFilter size={14} />
                <span>{tw("filter")}</span>
                {isFiltersApplied && (
                  <span className="rounded bg-bg-accent-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-txt-accent-primary">
                    1
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-2">
              <div className="relative mb-2">
                <Search
                  size={12}
                  className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-txt-placeholder"
                />
                <Input
                  ref={filterInputRef}
                  value={filterSearchQuery}
                  onChange={(event) => setFilterSearchQuery(event.target.value)}
                  placeholder={tw("filters")}
                  className="h-8 pl-7 text-xs"
                />
              </div>
              <div className="mb-1 px-1 text-[11px] font-medium text-txt-tertiary">
                {tw("access")}
              </div>
              {filteredFilterOptions.length > 0 ? (
                filteredFilterOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => onVisibilityFilterChange(option.key)}
                    className="flex h-8 w-full items-center justify-between rounded-md px-2 text-sm text-txt-primary hover:bg-bg-surface-2"
                  >
                    <span>{option.label}</span>
                    {visibilityFilter === option.key && <Check size={14} />}
                  </button>
                ))
              ) : (
                <p className="px-2 py-1 text-xs italic text-txt-tertiary">
                  {tc("noMatchesFound")}
                </p>
              )}
            </PopoverContent>
          </Popover>

          <Button
            variant="default"
            size="sm"
            className="h-8 gap-2 bg-bg-accent-primary hover:bg-bg-accent-primary-hover"
            onClick={onCreateProject}
          >
            <Plus size={14} />
            <span>{tn("createProject")}</span>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 relative"
                aria-label={tw("filters")}
              >
                <ListFilter size={14} />
                {isFiltersApplied && (
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-bg-accent-primary" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[min(92vw,20rem)] p-2">
              <div className="space-y-2">
                <div className="relative">
                  <Search
                    size={12}
                    className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-txt-placeholder"
                  />
                  <Input
                    value={searchQuery}
                    onChange={(event) => onSearchQueryChange(event.target.value)}
                    placeholder={tw("searchProjects")}
                    className="h-8 pl-7 text-xs"
                  />
                </div>

                <div className="rounded-md border border-border-subtle p-1">
                  <div className="mb-1 px-1 text-[11px] font-medium text-txt-tertiary">
                    {tw("sort")}
                  </div>
                  <button
                    type="button"
                    onClick={() => onSortByChange("recent")}
                    className="flex h-8 w-full items-center justify-between rounded-md px-2 text-sm text-txt-primary hover:bg-bg-surface-2"
                  >
                    <span>{tw("recentlyCreated")}</span>
                    {sortBy === "recent" && <Check size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSortByChange("name-asc")}
                    className="flex h-8 w-full items-center justify-between rounded-md px-2 text-sm text-txt-primary hover:bg-bg-surface-2"
                  >
                    <span>{tw("nameAZ")}</span>
                    {sortBy === "name-asc" && <Check size={14} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => onSortByChange("name-desc")}
                    className="flex h-8 w-full items-center justify-between rounded-md px-2 text-sm text-txt-primary hover:bg-bg-surface-2"
                  >
                    <span>{tw("nameZA")}</span>
                    {sortBy === "name-desc" && <Check size={14} />}
                  </button>
                </div>

                <div className="rounded-md border border-border-subtle p-1">
                  <div className="mb-1 px-1 text-[11px] font-medium text-txt-tertiary">
                    {tw("access")}
                  </div>
                  {filteredFilterOptions.length > 0 ? (
                    filteredFilterOptions.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => onVisibilityFilterChange(option.key)}
                        className="flex h-8 w-full items-center justify-between rounded-md px-2 text-sm text-txt-primary hover:bg-bg-surface-2"
                      >
                        <span>{option.label}</span>
                        {visibilityFilter === option.key && <Check size={14} />}
                      </button>
                    ))
                  ) : (
                    <p className="px-2 py-1 text-xs italic text-txt-tertiary">
                      {tc("noMatchesFound")}
                    </p>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="default"
            size="sm"
            className="h-8 w-8 p-0 bg-bg-accent-primary hover:bg-bg-accent-primary-hover"
            onClick={onCreateProject}
            aria-label={tn("createProject")}
          >
            <Plus size={14} />
          </Button>
        </div>
      </div>,
    );

    return () => {
      setRightItems(null);
    };
  }, [
    onCreateProject,
    handleCloseSearch,
    handleOpenSearch,
    onSearchQueryChange,
    onVisibilityFilterChange,
    onSortByChange,
    searchQuery,
    isSearchOpen,
    isFiltersApplied,
    filterSearchQuery,
    sortLabel,
    setRightItems,
    sortBy,
    tn,
    tw,
    tc,
    visibilityFilter,
    filteredFilterOptions,
  ]);

  return null;
}
