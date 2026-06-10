import SelectableImage from "@/components/Images/Selectable/SelectableImage";
import { axiosClientJson } from "@/libraries/axiosClient";
import { useQuery } from "@tanstack/react-query";
import { Button, Modal } from "antd";
import { useState } from "react";

const ImagesPicker = () => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <Button type="text" onClick={() => setOpen(true)}>
        Open Images Picker
      </Button>
      <ImagesPickerModal
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => {
          // Handle OK action here
          setOpen(false);
        }}
      />
    </div>
  );
};

interface ImagesPickerModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: () => void;
}

const ImagesPickerModal = ({
  open,
  onCancel,
  onOk,
}: ImagesPickerModalProps) => {
  const perPage = 9;
  const [page, setPage] = useState(1);
  const { data: images } = useQuery<{ files: string[] }>({
    queryKey: ["images"],
    queryFn: async () => {
      try {
        const response = await axiosClientJson.get(`/gcs/list/images-only`);
        return response.data;
      } catch (error) {
        console.error("Error fetching images:", error);
        return [];
      }
    },
  });
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOk={onOk}
      height={500}
      width={800}
      style={{ width: "800px" }}
      className="max-h-[500px]"
    >
      <div
        className="grid grid-cols-3 gap-4 mx-auto w-fit"
        style={{ height: "500px", overflow: "auto" }}
      >
        {(images?.files || []).map((image) => (
          <SelectableImage
            src={image}
            key={image}
            alt="Image"
            className="object-cover w-full border p-1 rounded"
            width={150}
            height={150}
            loading="lazy"
            onChange={() => {}}
          />
        ))}
      </div>
    </Modal>
  );
};

export default ImagesPicker;
