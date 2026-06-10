import { createStoreHook } from "@/hooks/stores/useMyStore";

export type IdAndNameWise = { _id: string; name: string; [k: string]: unknown };

interface UploadBoxContent<T extends { _id: string } = IdAndNameWise> {
  collection: string;
  item: T;
}

type StateFields<TPayload extends { _id: string } = IdAndNameWise> = {
  boxContent: UploadBoxContent<TPayload> | null;
  queryKey: unknown[] | undefined;
  open: boolean;
};

const useFileUploadBox = createStoreHook<StateFields>({
  boxContent: null,
  open: false,
  queryKey: [],
})();

export default useFileUploadBox;
