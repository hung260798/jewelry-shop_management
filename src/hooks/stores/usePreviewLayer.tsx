import { create } from "zustand";

interface PreviewSlice {
  src?: string | string[];
  setSrc: (
    src?:
      | string
      | string[]
      | ((prev?: string | string[]) => string | string[] | undefined)
  ) => void;
  currentIndex?: number;
  setCurrentIndex: (
    index?: number | ((prev?: number) => number | undefined)
  ) => void;
}

export const usePreviewLayer = create<PreviewSlice>()((set) => {
  return {
    src: undefined,
    setSrc(src) {
      if (typeof src !== "function") {
        set({ src });
      } else {
        const updater = src;
        set((state) => {
          return { src: updater(state.src) };
        });
      }
    },
    currentIndex: undefined,
    setCurrentIndex(index) {
      if (typeof index !== "function") {
        set({ currentIndex: index });
      } else {
        const updater = index;
        set((state) => {
          return { currentIndex: updater(state.currentIndex) };
        });
      }
    },
  };
});
