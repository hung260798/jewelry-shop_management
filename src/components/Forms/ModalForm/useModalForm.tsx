import { createStoreHook } from "@/hooks/stores/useMyStore";

export const useModalForm = createStoreHook<{
  formValues: object | undefined;
  open: boolean;
  formKey: string;
  queryKey: unknown[];
}>({
  formValues: undefined,
  open: false,
  formKey: "",
  queryKey: [],
})({
  closeModal: (set) => () =>
    set({ formValues: undefined, open: false, formKey: "", queryKey: [] }),
  openModal:
    (set) =>
    (initValues: object | undefined, formKey: string, queryKey?: unknown[]) =>
      set({
        formValues: initValues,
        formKey: formKey,
        open: true,
        queryKey: queryKey || [],
      }),
});
