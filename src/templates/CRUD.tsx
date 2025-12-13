import FileUploadBox, { useFileUploadBox } from "@/components/Modals/UploadBox";
import { axiosClientJson } from "@/libraries/axiosClient";
import {
  ClearOutlined,
  DeleteOutlined,
  EditOutlined,
  FilterOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { WithId } from "@repo/utils/types";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Flex, Grid, message, Popconfirm, Table } from "antd";
import { ColumnsType, ColumnType, TableProps } from "antd/es/table";
import { FormOfCollection, useModalForm } from "@/components/Forms/ModalForm";
import React, { memo, ReactNode, useEffect, useState } from "react";
import { SetURLSearchParams } from "react-router-dom";
import { FileField, FormControl, FormProps } from "utils/types/Form";
import cssStyles from "./crud.module.css";
// import ErrorPage from "@/components/fallbacks/Error";
import { devLog } from "@/utils/logger";

const MemoForm = memo(FormOfCollection, (oldProps, newProps) => {
  return (
    oldProps.collectionName === newProps.collectionName &&
    oldProps.title === newProps.title
  );
});

export type CRUDFunctions = {
  handleDelete?: (record: {
    _id: string;
    [k: string]: unknown;
  }) => void | Promise<void>;
  handlePageChange?: (current: number, pageSize: number) => void;
  clearParams?: () => void;
};

export interface CRUDProps<T> {
  collectionName: string;
  columns: ColumnsType<T>;
  dataSource?: T[];
  functions?: CRUDFunctions;
  dataChangeButtons?: JSX.Element[];
  fileFields?: FileField[];
  searchParams?: URLSearchParams;
  setSearchParams?: SetURLSearchParams;
  totalAmount?: number;
  refetch?: () => void;
  form?: {
    controls?: FormControl[];
    title?: string;
    submitFn?: (values: unknown) => void;
    customComponent?: React.FC<
      Omit<FormProps, "submitFn" | "formControls" | "title" | "formValues">
    >;
  };
  convertToFormValues?: (record: T) => unknown;
  functionColumn?: {
    edit?: (record: T) => JSX.Element;
    extraFunctions?: ((record: T) => JSX.Element)[];
  };
  loading?: boolean;
  layout?: (...parts: ReactNode[]) => JSX.Element;
  fetchError?: unknown;
}

export const PERPAGE_SIZE = 10;

/**
 * A reusable CRUD (Create, Read, Update, Delete) component for managing data in a table format.
 * @param props CRUDProps<DataType>
 * @returns
 */
export default function CRUD<DataType extends WithId<object>>(
  props: CRUDProps<DataType>
) {
  async function defaultHandleDelete({ _id }: { _id: string }) {
    if (collectionName) {
      try {
        await axiosClientJson.delete(`/${collectionName}/${_id}`);
        message.success("Delete success", 1);
        queryClient.invalidateQueries({
          queryKey: [`get_${collectionName}`],
        });
      } catch (error) {
        const errorName = error instanceof Error ? error.name : "Unknown error";
        message.error(`Delete fail: ${errorName}`, 1);
      }
    }
  }

  async function defaultClearParams() {
    if (setSearchParams && searchParams) {
      setSearchParams(new URLSearchParams("skip=0&limit=10"));
      // searchParams.set("skip", "0");
      // searchParams.set("limit", "10");
      // await refetch();
    }
  }

  const screens = Grid.useBreakpoint();

  const {
    columns,
    dataSource = [],
    functions = {},
    dataChangeButtons = [],
    fileFields,
    collectionName,
    searchParams,
    setSearchParams,
    totalAmount = 0,
    form,
    refetch,
    loading: tableLoading,
    convertToFormValues = (d) => d,
    fetchError,
  } = props;
  const {
    handleDelete = defaultHandleDelete,
    clearParams = defaultClearParams,
  } = functions;
  const [currentPage, setCurrentPage] = useState(1);
  const [cachedData, setCachedData] = useState<{
    dataSource: DataType[];
    totalAmount: number;
  }>({
    dataSource: dataSource,
    totalAmount: totalAmount,
  });

  useEffect(() => {
    try {
      let skip: string | number | null = searchParams?.get("skip") ?? null;
      skip = skip ? +skip : 0;
      setCurrentPage(skip / PERPAGE_SIZE + 1);
    } catch (err) {
      console.error(err);
    }
  }, [searchParams?.get("skip")]);

  // Update cachedData only when not loading and dataSource changes
  useEffect(() => {
    if (!tableLoading && dataSource && dataSource.length > 0 && totalAmount) {
      setCachedData({ dataSource, totalAmount });
    }
  }, [dataSource, totalAmount, tableLoading]);

  const handleTableChange: TableProps["onChange"] = (
    pagination,
    filters,
    sorter
  ) => {
    if (!searchParams || !setSearchParams) return;
    devLog("handleTableChange:");
    devLog("pagination", pagination);
    devLog("sorter", sorter);
    const params = new URLSearchParams(searchParams);
    const { current, pageSize } = pagination;
    if (
      typeof current === "number" &&
      typeof pageSize === "number" &&
      current !== currentPage
    ) {
      setCurrentPage(current);
      params.set("skip", `${pageSize * (current - 1)}`);
      params.set("limit", `${pageSize}`);
    }
    if (!Array.isArray(sorter)) {
      const { order, field } = sorter;
      const isFieldDefined =
        field !== undefined && (!Array.isArray(field) || field.length > 0);
      if (order && isFieldDefined) {
        const sortBy = Array.isArray(field) ? field.join(".") : `${field}`;
        params.set("sortBy", sortBy);
        params.set("sortOrder", order === "ascend" ? "1" : "-1");
      } else {
        params.delete("sortBy");
        params.delete("sortOrder");
      }
    }
    setSearchParams(params);
  };

  const functionColumn: ColumnType<DataType> = {
    key: "functionCol",
    title: "Thao tác",
    width: "9rem",
    render: (value, record) => {
      return (
        <Flex gap={4} wrap>
          {props.functionColumn?.edit ? (
            props.functionColumn.edit(record)
          ) : (
            <Button
              icon={<EditOutlined />}
              title="Update"
              type="dashed"
              onClick={() => {
                setFormValues(convertToFormValues(record));
                setShowingForm(form?.title ?? null);
              }}
            />
          )}
          <Popconfirm
            title="Xác nhận xóa"
            okType="danger"
            onConfirm={() => {
              handleDelete(record);
            }}
            cancelText="Hủy"
          >
            <Button title="delete" danger icon={<DeleteOutlined />} />
          </Popconfirm>
          {fileFields && collectionName && (
            <Button
              icon={<UploadOutlined />}
              title="Upload"
              onClick={function () {
                setUploaderPayload({
                  collection: collectionName,
                  id: record._id,
                  item: record as any,
                });
                setUploaderQueryKey?.(searchParams?.entries()?.toArray());
              }}
            />
          )}
          {props.functionColumn?.extraFunctions?.map((elem) => elem(record))}
        </Flex>
      );
    },
    filterDropdown: (props) => {
      const { close } = props;
      return (
        <div className="flex flex-col">
          {/* Clear filter */}
          <Button
            style={{ width: "150px", height: "40px" }}
            onClick={() => {
              clearParams();
            }}
            icon={<ClearOutlined />}
            type="text"
          >
            Xóa bộ lọc
          </Button>
          {/* Add */}
          <Button
            style={{ width: "150px", height: "40px" }}
            onClick={() => {
              close();
              setShowingForm(form?.title ?? null);
              setFormValues(undefined);
            }}
            icon={<PlusCircleOutlined />}
            type="text"
          >
            Thêm
          </Button>
          {hasSelected && (
            <Popconfirm
              title="Xac nhan"
              description="Xoa cac phan tu da chon?"
              icon={<QuestionCircleOutlined style={{ color: "red" }} />}
              onConfirm={() => deleteSelectedRows()}
            >
              <Button
                style={{ width: "150px", height: "40px" }}
                title="delete"
                type="text"
                danger
                icon={<DeleteOutlined />}
              >
                Xoa da chon
              </Button>
            </Popconfirm>
          )}
        </div>
      );
    },
    fixed: window.innerWidth > 768 ? "right" : undefined,
  };

  const queryClient = useQueryClient();

  async function deleteSelectedRows() {
    try {
      const asyncResults = await Promise.allSettled(
        selectedRowKeys.map((_id) => handleDelete({ _id: _id as string }))
      );
      let failureCount = 0;
      let successCount = 0;
      const reasons = [];
      asyncResults.forEach((result, index) => {
        if (result.status === "rejected") {
          ++failureCount;
          reasons.push({
            index,
            reason: result.reason,
          });
        } else {
          ++successCount;
        }
      });
      if (failureCount) {
        message.warning(
          `${failureCount} delete failed, ${
            selectedRowKeys.length - failureCount
          } success`
        );
      } else {
        message.success(`All delete success`);
      }
      if (successCount) {
        queryClient.invalidateQueries({ queryKey: [`get_${collectionName}`] });
      }
    } catch (error) {
      message.error((error as Error).message);
    }
  }

  const cols = [...columns, functionColumn];
  const setShowingForm = useModalForm((s) => s.setTitle);
  const setFormValues = useModalForm((s) => s.setFormValues);
  const setUploaderPayload = useFileUploadBox((s) => s.setPayload);
  const setUploaderQueryKey = useFileUploadBox((s) => s.setQueryKey);

  let formJSX: ReactNode = null;
  if (form?.customComponent) {
    const CustomForm = form.customComponent;
    formJSX = <CustomForm />;
  } else if (form) {
    const { controls = [], title = collectionName, submitFn } = form;
    formJSX = (
      <MemoForm
        formControls={controls}
        submitFn={submitFn}
        title={title}
        refetch={refetch}
        collectionName={collectionName}
        fileFields={fileFields}
      />
    );
  }

  const isFiltering = searchParams?.entries().find((pair) => {
    const [key] = pair;
    return !["skip", "limit"].includes(key);
  });
  const clearParamBtn = (
    <Button
      onClick={() => defaultClearParams()}
      disabled={!isFiltering}
      icon={<FilterOutlined />}
    >
      Xóa bộ lọc
    </Button>
  );

  const addBtnJSX = (
    <>
      <Button
        type="primary"
        onClick={() => {
          setShowingForm(form?.title ?? null);
          setFormValues(undefined);
        }}
        icon={<PlusOutlined />}
      >
        Thêm
      </Button>
      {clearParamBtn}
    </>
  );

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  type TableRowSelection<T extends object = object> =
    TableProps<T>["rowSelection"];

  const hasSelected = selectedRowKeys.length > 0;
  const rowSelection: TableRowSelection<DataType> = {
    selectedRowKeys,
    onChange: onSelectChange,
    fixed: true,
  };

  useEffect(() => {
    if (fetchError) {
      if (fetchError instanceof Error) {
        message.error(fetchError.message, 1);
      } else {
        message.error("Lỗi khi truy cập danh sách", 1);
      }
      devLog(fetchError);
    }
  }, [fetchError]);

  // End of hooks

  const finalDataSource = fetchError
    ? cachedData.dataSource || []
    : tableLoading
    ? cachedData.dataSource
    : dataSource;

  const tableJSX = (
    <Table<DataType>
      bordered
      columns={cols}
      dataSource={finalDataSource}
      rowKey={"_id"}
      pagination={{
        pageSize: PERPAGE_SIZE,
        total: tableLoading ? cachedData.totalAmount : totalAmount,
        current: currentPage,
      }}
      onChange={handleTableChange}
      scroll={{ x: "max-content" }}
      loading={tableLoading}
      rowSelection={{ ...rowSelection }}
      className={`${cssStyles["custom-header-table"]} shadow-2xl`}
      size={screens.xl ? "middle" : "small"}
    />
  );

  const fileUploadJSX = fileFields && collectionName && (
    <FileUploadBox fields={fileFields} />
  );

  const selectOperationsJSX = (
    <Popconfirm
      title="Xác nhận"
      description="Bạn muốn xóa các bản ghi đã chọn?"
      onConfirm={() => deleteSelectedRows()}
      cancelText="Hủy"
      okText="Xóa"
    >
      <Button danger disabled={!hasSelected} icon={<DeleteOutlined />}>
        Xóa
      </Button>
    </Popconfirm>
  );

  const defaultLayoutFn: CRUDProps<DataType>["layout"] = (
    addBtn,
    tablePart,
    formRender,
    fileUploadPart,
    selectOperations
  ) => {
    return (
      <div>
        <Flex className="my-2 mx-4" gap={4} wrap>
          {addBtn}
          {dataChangeButtons}
          {selectOperations}
        </Flex>
        {tablePart}
        {formRender}
        {fileUploadPart}
      </div>
    );
  };

  const layoutFn = props.layout ?? defaultLayoutFn;

  return layoutFn(
    addBtnJSX,
    tableJSX,
    formJSX,
    fileUploadJSX,
    selectOperationsJSX
  );
}
