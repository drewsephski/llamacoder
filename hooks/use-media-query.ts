import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onStoreChange) => {
      const result = matchMedia(query);
      result.addEventListener("change", onStoreChange);

      return () => result.removeEventListener("change", onStoreChange);
    },
    () => matchMedia(query).matches,
    () => false,
  );
}
