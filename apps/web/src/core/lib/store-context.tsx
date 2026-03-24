"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import { CoreRootStore } from "../store/root.store";

const StoreContext = createContext<CoreRootStore | null>(null);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [store] = useState(() => new CoreRootStore());
  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
};

export const useUser = () => useStore().user;
export const useInstance = () => useStore().instance;
export const useWorkspace = () => useStore().workspace;
export const useProject = () => useStore().workspace;
