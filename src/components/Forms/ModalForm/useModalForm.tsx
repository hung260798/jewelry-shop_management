import { createStoreHook } from "@/hooks/stores/useMyStore";

export const useModalForm = createStoreHook<{
  formValues: object | undefined;
  open: boolean;
  formKey: string;
}>({
  formValues: undefined,
  open: false,
  formKey: "",
})({
  closeModal: (set) => () =>
    set({ formValues: undefined, open: false, formKey: "" }),
  openModal: (set) => (initValues: object | undefined, formKey: string) =>
    set({
      formValues: initValues,
      formKey: formKey,
      open: true,
    }),
});
