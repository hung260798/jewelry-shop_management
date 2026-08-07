import { createStoreHook } from "@/hooks/stores/useMyStore";

export type IdAndNameWise = { _id: string; name: string; [k: string]: unknown };

type StateFields<TPayload extends { _id: string } = IdAndNameWise> = {
  boxContent: {
    collection: string;
    item: TPayload;
  } | null;
  queryKey: unknown[] | undefined;
  open: boolean;
};

const useFileUploadBox = createStoreHook<StateFields>({
  boxContent: null,
  open: false,
  queryKey: [],
})();

export default useFileUploadBox;
