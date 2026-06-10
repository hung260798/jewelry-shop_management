import { createStoreHook } from "@/hooks/stores/useMyStore";

const useModalCard = createStoreHook<{
  cardValues: object | undefined;
  open: boolean;
  key: string;
}>({ cardValues: undefined, open: false, key: "" })({
  closeModal: (set) => () =>
    set({ cardValues: undefined, open: false, key: "" }),
  openModal: (set) => (initValues: object | undefined, key: string) =>
    set({
      cardValues: initValues,
      open: true,
      key,
    }),
});

export default useModalCard;
