import { SetState } from "@/utils/types/Others";
import { create } from "zustand";

export type IdAndName = { _id: string; name: string; [k: string]: unknown };

interface UploadBoxPayload<T extends { _id: string } = IdAndName> {
  collection: string;
  id: string;
  item: T;
}

interface StateFields<TPayload extends { _id: string } = IdAndName> {
  payload: UploadBoxPayload<TPayload> | null;
  queryKey?: unknown[];
  open: boolean;
}

type StateType<TPayload extends { _id: string } = IdAndName> =
  StateFields<TPayload> & {
    setPayload: SetState<StateFields<TPayload>["payload"]>;
    setQueryKey?: SetState<StateFields<TPayload>["queryKey"]>;
    setOpen: SetState<StateFields<TPayload>["open"]>;
  };

const useFileUploadBox = create<StateType>()((set) => {
  return {
    payload: null,
    setPayload(updater) {
      if (typeof updater === "function") {
        return set((prev) => ({ payload: updater(prev.payload) }));
      } else {
        set({ payload: updater });
      }
    },
    queryKey: [],
    setQueryKey(updater) {
      if (typeof updater === "function") {
        return set((prev) => ({ queryKey: updater(prev.queryKey) }));
      } else {
        set({ queryKey: updater });
      }
    },
    open: false,
    setOpen(updater) {
      if (typeof updater === "function") {
        return set((prev) => ({ open: updater(prev.open) }));
      } else {
        set({ open: updater });
      }
    },
  };
});

export default useFileUploadBox;
