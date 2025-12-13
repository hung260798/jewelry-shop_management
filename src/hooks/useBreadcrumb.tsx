import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { persist, createJSONStorage } from "zustand/middleware";

export interface BreadState {
  breadCrumb: string | null;
  addBread(bread: string): void;
}

export const useBreadcrumb = create<BreadState>()(
  devtools(
    persist(
      (set) => {
        return {
          breadCrumb: null,
          addBread: async (bread) => {
            try {
              const parts = bread.split("/");
              const capitalizedParts = parts.map(
                (part) => part.charAt(0).toUpperCase() + part.slice(1)
              );
              const newData = capitalizedParts.join("/");
              set({ breadCrumb: newData }, false, {
                type: "breadCrumb/add-success",
              });
            } catch {
              set({ breadCrumb: null }, false, {
                type: "breadCrumb/add-error",
              });
              throw new Error("failed");
            }
          },
        };
      },
      {
        name: "breadCrumb", // unique name
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);
