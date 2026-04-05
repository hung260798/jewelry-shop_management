import { StateAndUpdaters } from "@/utils/types/Others";
import { create } from "zustand";

type State = {
  formValues: unknown;
  fieldsChange: boolean;
  open: boolean;
};

// interface Actions {
//   setFormValues: SetState<State["formValues"]>;
//   setFieldsChange: SetState<State["fieldsChange"]>;
//   setOpen: SetState<State["open"]>;
// }

export const useModalForm = create<StateAndUpdaters<State>>()((set) => {
  return {
    formValues: undefined,
    fieldsChange: false,
    open: false,

    setFormValues(updater) {
      if (typeof updater === "function") {
        return set((state) => ({ formValues: updater(state.formValues) }));
      } else {
        return set({ formValues: updater });
      }
    },
    setFieldsChange(updater) {
      if (typeof updater === "function") {
        return set((state) => ({ fieldsChange: updater(state.fieldsChange) }));
      } else {
        return set({ fieldsChange: updater });
      }
    },
    setOpen(updater) {
      if (typeof updater === "function") {
        return set((state) => ({ open: updater(state.open) }));
      } else {
        return set({ open: updater });
      }
    },
  };
});
