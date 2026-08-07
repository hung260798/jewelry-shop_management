import { DeletableImage } from "@/components/Images/WithButton";
import usePopupMessage from "@/hooks/usePopupMessage";
import { ASSET_URL } from "@/utils/constants/URLS";
import { devLog } from "@/utils/logger";
import { appendDomain, getBase64 } from "@/utils/stringUtils";
import { IdWise } from "@/utils/types/Entities";
import {
  CloseOutlined,
  DeleteOutlined,
  PlusSquareOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Button,
  GetProp,
  Popconfirm,
  Upload,
  UploadFile,
  UploadProps,
} from "antd";
import { useEffect, useState } from "react";
import { FileField } from "utils/types/Form";
import styles from "./UploadBox.module.css";
import useFileUploadBox from "./useFileUploadBox";

type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

// const fileWidth=100;
// const modalWidth=600;

export default function FilePickerAndList({
  field,
  collection,
  item,
  onChange,
  showing,
}: {
  field: FileField;
  collection?: string;
  item?: IdWise;
  onChange: (
    fileList: UploadFile[] | Set<string>,
    type: "local" | "server"
  ) => void;
  showing?: number;
}) {
  // console.log("FilePickerAndList render");
  const {
    name,
    label = name,
    fileType = "unknown",
    maxCount = 1,
    sizes,
  } = field;
  showing ??= maxCount;
  // const queryClient = useQueryClient();

  const [fileList, setFileList] = useState<UploadFile[]>([]); // Filelist của Antd Upload input
  const [clientFileSources, setClientFileSources] = useState<string[]>([]); // Source của file trên client
  const [markedForDelete, setMarkedForDelete] = useState<Set<string>>(
    new Set<string>()
  ); // File (server) được đánh dấu để xoá

  // const boxContent = useFileUploadBox((s) => s.boxContent);
  // const setBoxContent = useFileUploadBox((s) => s.setBoxContent);
  const uploadBoxOpen = useFileUploadBox((s) => s.open);
  const [messageApi] = usePopupMessage() || [];

  const handlerFileListChange = (fileList: UploadFile[]) => {
    setFileList(fileList);
    const files = fileList
      .map((file) => file.originFileObj)
      .filter((file) => file != undefined);

    Promise.all(files.map(getBase64))
      .then((sources) => setClientFileSources(sources))
      .catch((error) => {
        devLog(error);
        messageApi?.error("Lỗi không xác định");
      });
  };

  useEffect(() => {
    setFileList([]);
    setClientFileSources([]);
    setMarkedForDelete(new Set());
  }, [uploadBoxOpen]);

  let serverSources =
    (item?.[field.name] as string | string[] | undefined) ?? [];

  if (typeof serverSources === "string") {
    serverSources = [serverSources];
  }

  const serverListLength = serverSources.length;

  const totalFiles = Math.min(
    serverListLength + clientFileSources.length,
    field.maxCount || 1
  );
  const nMore = Math.max(0, totalFiles - showing);

  const sizeStr = sizes
    ? ` (${sizes.map((s) => `${s[0]}x${s[1]}`).join(", ")})`
    : "";

  if (!name || !collection) {
    return null;
  }

  return (
    <div className={styles.fieldCard} title="FilePickerAndList">
      <div className={styles.fieldHeader}>
        <div>
          <div className={styles.fieldTitle}>{label}</div>
          <div className={styles.fieldMeta}>
            {maxCount > 1 ? `Tối đa ${maxCount} file` : "1 file"}
            {sizeStr ? ` • ${sizeStr}` : ""}
          </div>
        </div>
        <div className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
          {fileType === "image" ? "Hình ảnh" : "Tệp tin"}
        </div>
      </div>

      <Upload
        key={name}
        maxCount={maxCount}
        multiple={maxCount > 1}
        listType={fileType === "image" ? "picture-card" : "text"}
        showUploadList={false}
        beforeUpload={() => false}
        onChange={(info) => {
          devLog("info", info);
          handlerFileListChange(info.fileList);
          onChange?.(info.fileList, "local");
        }}
        fileList={fileList}
      >
        <div className={styles.dropZone} title="upload">
          <div className={styles.dropZoneContent}>
            <UploadOutlined className={styles.dropZoneIcon} />
            <div>
              <div className={styles.dropZoneText}>
                Chọn {fileType === "image" ? "ảnh" : "file"}
              </div>
              <div className={styles.dropZoneHint}>
                Kéo thả hoặc bấm để thêm mới
              </div>
            </div>
          </div>
        </div>
      </Upload>

      {totalFiles > 0 ? (
        <div className={styles.previewGrid}>
          {clientFileSources.slice(0, showing).map((src, i, arr) => {
            const onDelete = () => {
              if (fileList.length === clientFileSources.length) {
                const copyList = fileList.slice();
                copyList.splice(i, 1);
                // setFileList(copyList);
                handlerFileListChange(copyList);
                onChange?.(copyList, "local");
              } else {
                messageApi?.error("Xóa file không thành công!");
              }
            };
            if (fileType === "image") {
              return (
                <div key={`client-${i}`} className={styles.imgWrap}>
                  <DeletableImage
                    width={140}
                    height={140}
                    src={appendDomain(src, ASSET_URL)}
                    onDelete={onDelete}
                    listSrc={arr}
                    currentIndex={i}
                    badge={
                      <PlusSquareOutlined
                        className={`${styles.btnIcon} text-blue-700`}
                      />
                    }
                  />
                </div>
              );
            }
            return (
              <div key={`client-${i}`} className={styles.previewItem}>
                <span className={styles.previewFileName}>{src}</span>
                <Popconfirm title="Xác nhận xóa" onConfirm={onDelete}>
                  <Button icon={<DeleteOutlined />} type="text" />
                </Popconfirm>
              </div>
            );
          })}

          {serverSources
            .slice(0, Math.max(0, showing - clientFileSources.length))
            .map((src, i, arr) => {
              const onDelete = function () {
                const curr = new Set<string>(markedForDelete);
                curr.add(src);
                setMarkedForDelete(curr);
                onChange?.(curr, "server");
              };
              return (
                <div key={`server-${src}`} className={styles.imgWrap}>
                  {fileType === "image" ? (
                    <DeletableImage
                      width={140}
                      height={140}
                      className="object-contain"
                      src={appendDomain(src, ASSET_URL)}
                      onDelete={onDelete}
                      listSrc={arr}
                      currentIndex={i}
                      badge={
                        markedForDelete.has(src) ? (
                          <CloseOutlined className={styles.btnIcon} />
                        ) : undefined
                      }
                    />
                  ) : (
                    <div className={styles.previewItem}>
                      <span className={styles.previewFileName}>{src}</span>
                      <Popconfirm title="Xác nhận xóa" onConfirm={onDelete}>
                        <Button icon={<DeleteOutlined />} type="text" />
                      </Popconfirm>
                    </div>
                  )}
                </div>
              );
            })}

          {nMore > 0 && (
            <div className={styles.previewItem}>
              <span className={styles.previewFileName}>+{nMore} mục khác</span>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <UploadOutlined />
          <span>Chưa có file nào được chọn.</span>
        </div>
      )}
    </div>
  );
}
