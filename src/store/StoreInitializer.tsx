
"use client";

import { useAthkarStore } from "./athkarStore";
import { useEffect, useRef } from "react";

export function StoreInitializer() {
  const initialized = useRef(false);
  const setHydrated = useAthkarStore((state) => state.setHydrated);

  useEffect(() => {
    if (!initialized.current) {
      // This will trigger rehydration from localStorage
      // The `onRehydrateStorage` in the middleware will then set `isHydrated` to true
      initialized.current = true;
    }
  }, []);

  return null;
}
