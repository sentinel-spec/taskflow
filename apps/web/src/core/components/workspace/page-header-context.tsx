"use client";

import type React from "react";
import { createContext, useCallback, useContext, useState } from "react";

interface PageHeaderContextType {
  rightItems: React.ReactNode;
  setRightItems: (items: React.ReactNode) => void;
  clearRightItems: () => void;
}

const PageHeaderContext = createContext<PageHeaderContextType | undefined>(
  undefined,
);

export function PageHeaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [rightItems, setRightItems] = useState<React.ReactNode>(null);

  const clearRightItems = useCallback(() => {
    setRightItems(null);
  }, []);

  return (
    <PageHeaderContext.Provider
      value={{ rightItems, setRightItems, clearRightItems }}
    >
      {children}
    </PageHeaderContext.Provider>
  );
}

export function usePageHeader() {
  const context = useContext(PageHeaderContext);
  if (context === undefined) {
    throw new Error("usePageHeader must be used within a PageHeaderProvider");
  }
  return context;
}
