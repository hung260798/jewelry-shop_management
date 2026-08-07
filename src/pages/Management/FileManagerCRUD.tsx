import React, { useState, useMemo } from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  Empty,
  Spin,
  message,
  Flex,
  Tag,
  Image as AntImage,
  Divider,
  Card,
} from "antd";
import {
  DeleteOutlined,
  DownloadOutlined,
  FileOutlined,
  FileImageOutlined,
  FileTextOutlined,
  FileZipOutlined,
  ReloadOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import { useGCSFiles } from "@/hooks/useGCSFiles";
import { axiosClientJson } from "@/libraries/axiosClient";
import { GCS_BASE_URL, GCS_BUCKET_NAME } from "@/utils/constants/URLS";
import "./filemanager.css";
import { ColumnsType } from "antd/es/table";

interface FileRecord {
  key: string;
  name: string;
  extension: string;
  type: "image" | "video" | "document" | "archive" | "other";
  url: string;
}

const IMAGE_REGEX = /\.(jpg|jpeg|png|gif|webp)$/i;
const VIDEO_REGEX = /\.(mp4|mov|avi|mkv|webm)$/i;
const DOCUMENT_REGEX = /\.(pdf|doc|docx|txt|xlsx|xls)$/i;
const ARCHIVE_REGEX = /\.(zip|rar|7z|tar|gz)$/i;

function getFileType(filename: string): FileRecord["type"] {
  if (IMAGE_REGEX.test(filename)) return "image";
  if (VIDEO_REGEX.test(filename)) return "video";
  if (DOCUMENT_REGEX.test(filename)) return "document";
  if (ARCHIVE_REGEX.test(filename)) return "archive";
  return "other";
}

function getFileIcon(type: FileRecord["type"], size = 24) {
  const iconProps = { style: { fontSize: size } };
  switch (type) {
    case "image":
      return <FileImageOutlined {...iconProps} />;
    case "video":
      return <FileOutlined {...iconProps} />;
    case "document":
      return <FileTextOutlined {...iconProps} />;
    case "archive":
      return <FileZipOutlined {...iconProps} />;
    default:
      return <FileOutlined {...iconProps} />;
  }
}

function getFileExtension(filename: string): string {
  const match = filename.match(/\.([^.]+)$/);
  return match ? match[1].toUpperCase() : "FILE";
}

function buildGCSUrl(filename: string): string {
  return `https://storage.googleapis.com/${GCS_BUCKET_NAME}/${filename}`;
}

interface FileManagerCRUDProps {
  type?: "all" | "image";
}

/**
 * File Manager page for Google Cloud Storage.
 * Displays files in a table with preview, download, and delete capabilities.
 */
export default function FileManagerCRUD({
  type = "all",
}: FileManagerCRUDProps) {
  const {
    files,
    isLoading,
    error,
    hasMore,
    currentPageToken,
    goToNextPage,
    goToPreviousPage,
    refetch,
  } = useGCSFiles({ type, limit: 20 });

  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const tableData: FileRecord[] = useMemo(
    () =>
      files.map((filename) => ({
        key: filename,
        name: filename,
        extension: getFileExtension(filename),
        type: getFileType(filename),
        url: buildGCSUrl(filename),
      })),
    [files]
  );

  const handleDeleteSingle = async (filename: string) => {
    try {
      await axiosClientJson.delete(`/gcs/${filename}`);
      message.success(`Đã xóa ${filename}`);
      refetch();
    } catch (err) {
      message.error(`Xóa không thành công ${filename}`);
      console.error(err);
    }
  };

  const handleDeleteBulk = async () => {
    if (selectedRowKeys.length === 0) return;

    setIsDeleting(true);
    try {
      await axiosClientJson.post("/gcs/bulk-removal", {
        files: selectedRowKeys,
      });
      message.success(`Đã xóa ${selectedRowKeys.length} tệp`);
      setSelectedRowKeys([]);
      refetch();
    } catch (err) {
      message.error("Xóa tệp không thành công");
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = (filename: string) => {
    const link = document.createElement("a");
    link.href = `/gcs/${filename}`;
    link.download = filename.split("/").pop() || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: ColumnsType<FileRecord> = [
    {
      title: "Xem trước",
      key: "preview",
      width: 80,
      align: "center" as const,
      render: (_, record) => {
        if (record.type === "image") {
          return (
            <AntImage
              src={record.url}
              alt={record.name}
              preview
              className="file-preview-image"
              style={{ width: 60, height: 60, objectFit: "cover" }}
            />
          );
        }
        return (
          <div style={{ display: "flex", justifyContent: "center" }}>
            {getFileIcon(record.type, 32)}
          </div>
        );
      },
    },
    {
      title: "Tên tệp",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <div className="file-name-cell" title={text}>
          {text}
        </div>
      ),
    },
    {
      title: "Loại",
      key: "type",
      width: 100,
      render: (_, record) => {
        const colorMap: Record<FileRecord["type"], string> = {
          image: "blue",
          video: "cyan",
          document: "orange",
          archive: "purple",
          other: "default",
        };
        return (
          <Tag color={colorMap[record.type]} className="file-type-tag">
            {record.extension}
          </Tag>
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      width: 120,
      align: "center" as const,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<DownloadOutlined />}
            size="small"
            onClick={() => handleDownload(record.name)}
            title="Tải xuống"
            className="file-action-button"
          />
          <Popconfirm
            title="Xóa tệp"
            description={`Bạn có chắc chắn muốn xóa "${record.name}"?`}
            onConfirm={() => handleDeleteSingle(record.name)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              title="Xóa"
              className="file-action-button"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as string[]),
  };

  if (error) {
    return (
      <div className="file-manager-container">
        <div className="file-manager-header">
          <h2>
            <FolderOutlined />
            Quản lý tệp
          </h2>
        </div>
        <div className="file-manager-content">
          <Empty description="Lỗi khi tải tệp" style={{ marginTop: 50 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="file-manager-container">
      {/* Header */}
      <div className="file-manager-header">
        <h2>
          <FolderOutlined />
          Quản lý tệp
        </h2>
        {tableData.length > 0 && (
          <div className="file-manager-stats">
            <div className="file-manager-stat-item">
              <span className="file-manager-stat-label">Tổng tệp</span>
              <span className="file-manager-stat-value">
                {tableData.length}
              </span>
            </div>
            {selectedRowKeys.length > 0 && (
              <div className="file-manager-stat-item">
                <span className="file-manager-stat-label">Đã chọn</span>
                <span className="file-manager-stat-value">
                  {selectedRowKeys.length}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="file-manager-toolbar">
        <div className="file-manager-toolbar-actions">
          {selectedRowKeys.length > 0 && (
            <Popconfirm
              title="Xóa nhiều tệp"
              description={`Xóa ${selectedRowKeys.length} tệp được chọn?`}
              onConfirm={handleDeleteBulk}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button danger loading={isDeleting} icon={<DeleteOutlined />}>
                Xóa {selectedRowKeys.length} tệp
              </Button>
            </Popconfirm>
          )}
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            loading={isLoading}
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="file-manager-content">
        <Spin spinning={isLoading}>
          {tableData.length === 0 && !isLoading ? (
            <Empty
              description="Không tìm thấy tệp"
              className="file-manager-empty"
            />
          ) : (
            <div className="file-manager-table-wrapper">
              <Table<FileRecord>
                columns={columns}
                dataSource={tableData}
                pagination={false}
                rowSelection={rowSelection}
                scroll={{ x: 800 }}
                size="middle"
                bordered
              />
            </div>
          )}
        </Spin>

        {/* Pagination Controls */}
        {tableData.length > 0 && (
          <div className="file-manager-pagination">
            <Button
              disabled={!currentPageToken}
              onClick={goToPreviousPage}
              size="large"
            >
              ← Trước
            </Button>
            <span className="file-manager-pagination-info">
              {currentPageToken ? "Trang N" : "Trang 1"}
            </span>
            <Button
              disabled={!hasMore}
              onClick={goToNextPage}
              size="large"
              type={hasMore ? "primary" : "default"}
            >
              Tiếp →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
