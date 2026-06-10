import { createStoreHook } from "@/hooks/stores/useMyStore";

type PreviewSlice = {
  src: string | string[];
  currentIndex: number;
};

export const usePreviewLayer = createStoreHook<PreviewSlice>({
  src: "",
  currentIndex: -1,
})({
  closeLayer: (set) => () => set({ src: "", currentIndex: -1 }),
});

// export const usePreviewLayer = create<Store<PreviewSlice>>()((set) => {
//   return {
//     src: undefined,
//     setSrc(src) {
//       if (typeof src !== "function") {
//         set({ src });
//       } else {
//         const updater = src;
//         set((state) => {
//           return { src: updater(state.src) };
//         });
//       }
//     },
//     currentIndex: undefined,
//     setCurrentIndex(index) {
//       if (typeof index !== "function") {
//         set({ currentIndex: index });
//       } else {
//         const updater = index;
//         set((state) => {
//           return { currentIndex: updater(state.currentIndex) };
//         });
//       }
//     },
//   };
// });
