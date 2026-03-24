"use client";

import { Info, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/core/lib/utils";
import { adjustColorForContrast, DEFAULT_COLORS } from "../helper";
import { MaterialIconList } from "./material-root";

type IconRootProps = {
  onChange: (value: { name: string; color: string }) => void;
  defaultColor: string;
  searchDisabled?: boolean;
  iconType: "material" | "lucide";
};

export function IconRoot(props: IconRootProps) {
  const { defaultColor, onChange, searchDisabled = false, iconType } = props;

  const [activeColor, setActiveColor] = useState(defaultColor);
  const [showHexInput, setShowHexInput] = useState(false);
  const [hexValue, setHexValue] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (DEFAULT_COLORS.includes(defaultColor.toLowerCase() ?? "")) {
      setShowHexInput(false);
    } else {
      setHexValue(defaultColor?.slice(1, 7) ?? "");
      setShowHexInput(true);
    }
  }, [defaultColor]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="sticky top-0 flex flex-col bg-white">
        {!searchDisabled && (
          <div className="flex w-full items-center px-2 py-[15px]">
            <div
              className={cn(
                "relative flex h-10 w-full items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-[30px] focus-within:border-blue-500",
              )}
            >
              <Search className="absolute bottom-3 left-2.5 h-3.5 w-3.5 text-gray-400" />

              <input
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="block h-full w-full rounded-md border-none bg-transparent p-0 px-3 py-2 text-base placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>
        )}
        <div className="grid h-9 grid-cols-9 items-center justify-items-center gap-2 px-2.5 py-1">
          {showHexInput ? (
            <div className="col-span-8 ml-2 flex items-center gap-1 justify-self-stretch">
              <span
                className="mr-1 h-4 w-4 flex-shrink-0 rounded-full"
                style={{
                  backgroundColor: `#${hexValue}`,
                }}
              />
              <span className="flex-shrink-0 text-xs text-gray-500">HEX</span>
              <span className="-mr-1 flex-shrink-0 text-xs text-gray-600">
                #
              </span>
              <input
                type="text"
                value={hexValue}
                onChange={(e) => {
                  const value = e.target.value;
                  setHexValue(value);
                  if (/^[0-9A-Fa-f]{6}$/.test(value))
                    setActiveColor(adjustColorForContrast(`#${value}`));
                }}
                className="block flex-grow rounded-sm border-none bg-transparent px-3 py-2 pl-0 text-xs text-gray-600 placeholder-gray-400 ring-0 focus:outline-none"
              />
            </div>
          ) : (
            DEFAULT_COLORS.map((curCol) => (
              <button
                key={curCol}
                type="button"
                className="grid size-5 place-items-center"
                onClick={() => {
                  setActiveColor(curCol);
                  setHexValue(curCol.slice(1, 7));
                }}
              >
                <span
                  className="h-4 w-4 cursor-pointer rounded-full"
                  style={{ backgroundColor: curCol }}
                />
              </button>
            ))
          )}
          <button
            type="button"
            className={cn(
              "grid h-4 w-4 place-items-center rounded-full border border-transparent",
              {
                "border-gray-300": !showHexInput,
              },
            )}
            onClick={() => {
              setShowHexInput((prevData) => !prevData);
              setHexValue(activeColor.slice(1, 7));
            }}
          >
            {showHexInput ? (
              <span className="h-4 w-4 rounded-full conical-gradient" />
            ) : (
              <span className="grid place-items-center text-[10px] text-gray-500">
                #
              </span>
            )}
          </button>
        </div>
        <div className="flex h-6 w-full items-center gap-2 py-1 pr-3 pl-4">
          <Info className="h-3 w-3 text-gray-400" />
          <p className="text-xs text-gray-500">
            Colors will be adjusted to ensure sufficient contrast.
          </p>
        </div>
      </div>
      <div
        className="mt-2 min-h-0 flex-1 overflow-y-auto overscroll-contain px-2.5 pb-2"
        onWheelCapture={(e) => e.stopPropagation()}
      >
        {iconType === "material" ? (
          <div className="grid grid-cols-8 justify-items-center gap-1">
            <MaterialIconList
              query={query}
              onChange={onChange}
              activeColor={activeColor}
            />
          </div>
        ) : (
          <div className="text-center text-sm text-gray-500 py-4">
            Lucide icons coming soon
          </div>
        )}
      </div>
    </div>
  );
}
