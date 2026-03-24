import * as LucideIcons from "lucide-react";

export const LUCIDE_ICONS_LIST = Object.entries(LucideIcons).map(
  ([name, icon]) => ({
    name: name.toLowerCase(),
    element: icon as React.ComponentType<{ style?: React.CSSProperties }>,
  }),
);
