import { useEffect, useMemo, useState } from "react";
import { Modal, Button } from "antd";
import type { ModalProps, UploadFile } from "antd";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  Alignment,
  Bold,
  ClassicEditor,
  Essentials,
  Heading,
  ImageInsert,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Italic,
  List,
  Paragraph,
  Table,
  TableToolbar,
  Underline,
  Image as CKImage,
  Plugin,
} from "ckeditor5"; // bạn đã mô tả import này
import { devLog } from "@/utils/logger";
import { upload } from "@/utils/mutationFn";

type Props = {
  value?: string;
  onChange?: (v: string) => void;
  modalProps?: Partial<ModalProps>;
  buttonLabel?: { empty?: string; edit?: string };
};

interface ImageItem {
  objectURL: string;
  file: File;
}

export default function MyCkeditorFormInput({
  value = "",
  onChange,
  modalProps,
  buttonLabel = { empty: "Nhập nội dung", edit: "Chỉnh sửa nội dung" },
}: Props) {
  const [open, setOpen] = useState(false);
  const [editor, setEditor] = useState<ClassicEditor | null>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const addImage = (file: ImageItem) => {
    setImages((prev) => [...prev, file]);
  };
  // Sync prop value -> tempValue (always)
  useEffect(() => {
    // devLog("tempValue", tempValue);
    if (editor !== null) {
      // devLog("editorRef is ready");
      editor.setData(value);
    }
  }, [value, editor]);

  const openModal = () => {
    setOpen(true);
  };

  const handleOk = async () => {
    let htmlData = editor?.getData();
    if (htmlData && images.length) {
      const arrayOfResults = await upload({
        files: {
          descriptionImages: {
            fileList: images.map(
              ({ file }) =>
                ({
                  uid: crypto.randomUUID(),
                  name: file.name,
                  status: "done",
                  originFileObj: file,
                } as UploadFile)
            ),
            file: images[0].file,
          },
        },
        fields: [{ name: "descriptionImages", maxCount: 10 }],
      });
      devLog("arrayOfResults", arrayOfResults);
      const uploadResult = arrayOfResults?.[0];
      if (
        uploadResult &&
        typeof uploadResult.url === "object" &&
        uploadResult.url.length === images.length
      ) {
        // devLog("htmlData", htmlData);
        uploadResult.url.forEach((serverURL, index) => {
          devLog("objectURL", images[index].objectURL);
          htmlData = htmlData?.replace(images[index].objectURL, serverURL);
        });
      }
    }
    onChange?.(htmlData ?? value);
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  // Minimal preview text for the button (plain text, strip tags quickly)
  const previewText = useMemo(() => {
    if (!value) return "";
    const txt = value.replace(/<\/?[^>]+(>|$)/g, ""); // remove tags
    return txt.length > 60 ? txt.slice(0, 57) + "..." : txt;
  }, [value]);

  return (
    <>
      <span>
        <Button onClick={openModal} className="max-w-full overflow-hidden">
          {value ? buttonLabel.edit : buttonLabel.empty}
        </Button>
        {value ? (
          <span style={{ marginLeft: 4, opacity: 0.7 }}>{previewText}</span>
        ) : null}
      </span>

      <Modal
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        width={1000}
        closable={false}
        okText="Hoàn tất"
        cancelText="Hủy"
        {...modalProps}
      >
        <div style={{ minHeight: 360 }}>
          <CKEditor
            editor={ClassicEditor}
            config={{
              licenseKey: "GPL",
              toolbar: [
                "heading",
                "|",
                "bold",
                "italic",
                "underline",
                "|",
                "alignment:left", // thêm alignment
                "alignment:center",
                "alignment:right",
                "alignment:justify",
                "|",
                "bulletedList",
                "|",
                "insertImage",
                "insertTable",
                "|",
                "undo",
                "redo",
              ],
              alignment: {
                options: ["left", "center", "right", "justify"],
              },
              image: {
                resizeUnit: "%",
                toolbar: [
                  "imageTextAlternative",
                  "|",
                  "imageStyle:inline",
                  "imageStyle:block",
                  "imageStyle:side",
                  "|",
                  "resizeImage",
                ],
                styles: { options: ["inline", "block", "side"] },
                resizeOptions: [
                  {
                    name: "resizeImage:original",
                    label: "Original",
                    value: null,
                  },
                  {
                    name: "resizeImage:25",
                    label: "25%",
                    value: "25",
                  },
                  {
                    name: "resizeImage:50",
                    label: "50%",
                    value: "50",
                  },
                  {
                    name: "resizeImage:75",
                    label: "75%",
                    value: "75",
                  },
                ],
              },
              table: {
                contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
              },
              plugins: [
                Alignment,
                Heading,
                Bold,
                Italic,
                Underline,
                List,
                CKImage,
                ImageInsert,
                ImageUpload,
                ImageToolbar,
                ImageResize,
                ImageStyle,
                Table,
                TableToolbar,
                Essentials,
                Paragraph,
              ],
              extraPlugins: [LocalUploadAdapterPlugin],
            }}
            onReady={(editor) => {
              editor.plugins.get("FileRepository").createUploadAdapter = (
                loader
              ) => {
                return new (class {
                  async upload() {
                    const file: File = await loader.file;
                    const objectURL = URL.createObjectURL(file);
                    addImage({ objectURL, file });
                    return { default: objectURL };
                  }
                  abort() {}
                })();
              };
              setEditor(editor);
            }}
            onError={(err) => {
              devLog("CKEditor onError:", err);
            }}
          />
        </div>
      </Modal>
    </>
  );
}

// LocalUploadAdapter.ts
export class LocalUploadAdapter {
  private loader: any;
  private onAddImage: (file: File) => void;

  constructor(loader: any, onAddImage: (file: File) => void) {
    this.loader = loader;
    this.onAddImage = onAddImage;
  }

  async upload(): Promise<{ default: string }> {
    const file: File = await this.loader.file;

    // Lưu file vào React state
    this.onAddImage(file);

    // Tạo URL blob để CKEditor hiển thị ảnh
    const url = URL.createObjectURL(file);

    return {
      default: url,
    };
  }

  abort(): void {
    // Không cần implement gì thêm
  }
}

export class LocalUploadAdapterPlugin extends Plugin {
  static get requires() {
    return [];
  }

  static get pluginName() {
    return "LocalUploadAdapterPlugin";
  }

  init(): void {
    const editor = this.editor;
    const onAddImage = editor.config.get("onAddImage") as (file: File) => void;

    editor.plugins.get("FileRepository").createUploadAdapter = (
      loader: any
    ) => {
      return new LocalUploadAdapter(loader, onAddImage);
    };
  }
}
