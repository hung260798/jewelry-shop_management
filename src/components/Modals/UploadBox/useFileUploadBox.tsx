import { createStoreHook } from "@/hooks/stores/useMyStore";
// import { NonCallable, SetStateFn } from "@/utils/types/Others";
// import { create } from "zustand";

export type IdAndName = { _id: string; name: string; [k: string]: unknown };

interface UploadBoxContent<T extends { _id: string } = IdAndName> {
  collection: string;
  id: string;
  item: T;
}

type StateFields<TPayload extends { _id: string } = IdAndName> = {
  boxContent: UploadBoxContent<TPayload> | null;
  queryKey: unknown[] | undefined;
  open: boolean;
};

// type StateType<TPayload extends { _id: string } = IdAndName> =
//   StateFields<TPayload> & {
//     setPayload: SetStateFn<StateFields<TPayload>["payload"]>;
//     setQueryKey?: SetStateFn<StateFields<TPayload>["queryKey"]>;
//     setOpen: SetStateFn<StateFields<TPayload>["open"]>;
//   };

// const useFileUploadBox = create<StateType>()((set) => {
//   return {
//     payload: null,
//     setPayload(updater) {
//       if (typeof updater === "function") {
//         return set((prev) => ({ payload: updater(prev.payload) }));
//       } else {
//         set({ payload: updater });
//       }
//     },
//     queryKey: [],
//     setQueryKey(updater) {
//       if (typeof updater === "function") {
//         return set((prev) => ({ queryKey: updater(prev.queryKey) }));
//       } else {
//         set({ queryKey: updater });
//       }
//     },
//     open: false,
//     setOpen(updater) {
//       if (typeof updater === "function") {
//         return set((prev) => ({ open: updater(prev.open) }));
//       } else {
//         set({ open: updater });
//       }
//     },
//   };
// });

const useFileUploadBox = createStoreHook<StateFields>({
  boxContent: null,
  open: false,
  queryKey: [],
})();

export default useFileUploadBox;
