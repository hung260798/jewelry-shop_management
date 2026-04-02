import { SetState } from "@/utils/types/Others";
import { create } from "zustand";

export interface ModalFormState {
  title: string | null;
  setTitle: SetState<string | null>;
  formValues: unknown;
  setFormValues: SetState<unknown>;
  fieldsChange: boolean;
  setFieldsChange: SetState<boolean>;
}
export const useModalForm = create<ModalFormState>()((set) => {
  return {
    title: null,
    setTitle(updater) {
      if (typeof updater === "function") {
        return set((state) => ({ title: updater(state.title) }));
      } else {
        return set({ title: updater });
      }
    },
    formValues: undefined,
    setFormValues(updater) {
      if (typeof updater === "function") {
        return set((state) => ({ formValues: updater(state.formValues) }));
      } else {
        return set({ formValues: updater });
      }
    },
    fieldsChange: false,
    setFieldsChange(updater) {
      if (typeof updater === "function") {
        return set((state) => ({ fieldsChange: updater(state.fieldsChange) }));
      } else {
        return set({ fieldsChange: updater });
      }
    },
  };
});
