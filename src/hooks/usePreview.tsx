import { create } from "zustand";

interface PreviewSlice {
  src?: string;
  setSrc: (src?: string | ((prev: PreviewSlice) => PreviewSlice)) => void;
}

export const usePreview = create<PreviewSlice>()((set) => {
  return {
    src: undefined,
    setSrc(src) {
      if (!src) {
        set({ src: undefined });
        return;
      }
      if (typeof src === "function") {
        const updater = src;
        set((state) => {
          return updater(state);
        });
      } else {
        set({ src: src });
      }
    },
  };
});
