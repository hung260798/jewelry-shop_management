import { ModalForm } from "@/components/Forms/ModalForm";
import { useModalForm } from "@/components/Forms/ModalForm/useModalForm";
import FileUploadBox from "@/components/Modals/UploadBox";
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
import { useQueryClient } from "@tanstack/react-query";
import { Button, Flex, Grid, message, Popconfirm, Table } from "antd";
import { ColumnsType, ColumnType, TableProps } from "antd/es/table";
import React, { ReactNode, useEffect, useState } from "react";
import { SetURLSearchParams } from "react-router-dom";
import { WithId } from "utils/types/Entities";
import { FileField, FormControl, FormProps } from "utils/types/Form";
import cssStyles from "./crud.module.css";
// import ErrorPage from "@/components/fallbacks/Error";
import useFileUploadBox, {
  IdAndName,
} from "@/components/Modals/UploadBox/useFileUploadBox";
import { devLog, getErrorMessage } from "@/utils/logger";

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
  uploadModalTitle?: string | ((record: T) => string);
  searchParams?: URLSearchParams;
  setSearchParams?: SetURLSearchParams;
  totalAmount?: number;
  refetch?: () => void;
  form?: {
    controls?: FormControl[];
    title?: string;
    submitFn?: (values: unknown) => Promise<void>;
    customComponent?: React.FC<
      Omit<FormProps, "submitFn" | "formControls" | "title" | "formValues">
    >;
  };
  convertToFormValues?: (record: T) => unknown;
  functionColumn?: {
    edit?: (record: T) => ReactNode;
    extraFunctions?: ((record: T) => ReactNode)[];
    override?: (record: T) => ReactNode;
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
  const [messageApi, contextHolder] = message.useMessage();
  const screens = Grid.useBreakpoint();
  const queryClient = useQueryClient();

  const setOpen = useModalForm((s) => s.setOpen);
  const setFormValues = useModalForm((s) => s.setFormValues);
  // const setFieldsChange = useModalForm((s) => s.setFieldsChange);
  const setUploaderPayload = useFileUploadBox((s) => s.setPayload);
  const setUploaderQueryKey = useFileUploadBox((s) => s.setQueryKey);
  const setOpenUploadBox = useFileUploadBox((s) => s.setOpen);

  async function defaultHandleDelete({ _id }: { _id: string }) {
    if (collectionName) {
      try {
        await axiosClientJson.delete(`/${collectionName}/${_id}`);
        messageApi.success("Delete success", 1);
        queryClient.invalidateQueries({
          queryKey: [`get_${collectionName}`],
        });
      } catch (error) {
        const errorName = error instanceof Error ? error.name : "Unknown error";
        messageApi.error(`Delete fail: ${errorName}`, 1);
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
    dataIndex: "_id",
    render: (_id, record) => {
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
                // messageApi.open({
                //   key: "open-detail",
                //   content: "Đang tải dữ liệu",
                //   type: "loading",
                // });
                // axiosClientJson
                //   .get<GetOne<DataType>>(`${collectionName}/${_id}`)
                //   .then((response) => {
                //     setFormValues(convertToFormValues(response.data.result));
                //     setOpen(true);
                //     messageApi.destroy("open-detail");
                //   })
                //   .catch((error) => {
                //     messageApi.open({
                //       key: "open-detail",
                //       content: "Không thể tải dữ liệu",
                //       type: "error",
                //       duration: 1,
                //     });
                //     devLog(error);
                //   });
                setFormValues(convertToFormValues(record));
                setOpen(true);
              }}
            />
          )}
          <Popconfirm
            title="Xác nhận xóa"
            okType="danger"
            onConfirm={() => {
              handleDelete(record);
            }}
            cancelText="Hủy">
            <Button
              title="Xóa"
              type="dashed"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
          {fileFields && collectionName && (
            <Button
              icon={<UploadOutlined />}
              title="Tải tệp lên"
              onClick={function () {
                setUploaderPayload({
                  collection: collectionName,
                  id: record._id,
                  item: record as unknown as IdAndName,
                });
                const qk: string[][] = [];
                for (const pair of searchParams?.entries() ?? []) {
                  qk.push(pair);
                }
                setUploaderQueryKey?.(qk);
                setOpenUploadBox(true);
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
            type="text">
            Xóa bộ lọc
          </Button>
          {/* Add */}
          <Button
            style={{ width: "150px", height: "40px" }}
            onClick={() => {
              close();
              setFormValues(undefined);
              setOpen(true);
              // setFieldsChange(false);
            }}
            icon={<PlusCircleOutlined />}
            type="text">
            Thêm
          </Button>
          {hasSelected && (
            <Popconfirm
              title="Xac nhan"
              description="Xoa cac phan tu da chon?"
              icon={<QuestionCircleOutlined style={{ color: "red" }} />}
              onConfirm={() => deleteSelectedRows()}>
              <Button
                style={{ width: "150px", height: "40px" }}
                title="delete"
                type="text"
                danger
                icon={<DeleteOutlined />}>
                Xoa da chon
              </Button>
            </Popconfirm>
          )}
        </div>
      );
    },
    fixed: window.innerWidth > 768 ? "right" : undefined,
  };

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
        messageApi.warning(
          `${failureCount} delete failed, ${
            selectedRowKeys.length - failureCount
          } success`
        );
      } else {
        messageApi.success(`All delete success`);
      }
      if (successCount) {
        queryClient.invalidateQueries({ queryKey: [`get_${collectionName}`] });
      }
    } catch (error) {
      messageApi.error((error as Error).message);
    }
  }

  const cols = [...columns, functionColumn];

  let formJSX: ReactNode = null;
  if (form?.customComponent) {
    const CustomForm = form.customComponent;
    formJSX = <CustomForm />;
  } else if (form) {
    const { controls = [], title = collectionName, submitFn } = form;
    formJSX = (
      <ModalForm
        formControls={controls}
        submitFn={submitFn}
        title={title}
        refetch={refetch}
        collectionName={collectionName}
        fileFields={fileFields}
      />
    );
  }

  let isFiltering = false;
  if (searchParams) {
    for (const key of searchParams.keys()) {
      if (!["skip", "limit", "sortBy", "sortOrder"].includes(key)) {
        isFiltering = true;
        break;
      }
    }
  }

  const clearParamBtn = (
    <Button
      onClick={() => defaultClearParams()}
      disabled={!isFiltering}
      icon={<FilterOutlined />}>
      Xóa bộ lọc
    </Button>
  );

  const addBtnJSX = (
    <>
      <Button
        type="primary"
        onClick={() => {
          setFormValues(undefined);
          setOpen(true);
          // setFieldsChange(false);
        }}
        icon={<PlusOutlined />}>
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
      messageApi.error(getErrorMessage(fetchError));
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
        size: "default",
      }}
      onChange={handleTableChange}
      scroll={{ x: "max-content" }}
      loading={{
        spinning: tableLoading,
        size: "large",
      }}
      rowSelection={{ ...rowSelection }}
      className={`${cssStyles["custom-header-table"]} shadow-2xl`}
      size={screens.xl ? "middle" : "small"}
    />
  );

  const fileUploadJSX = fileFields && collectionName && (
    <FileUploadBox
      fields={fileFields}
      uploadTo="/upload/gcs-upload"
      modalTitle={
        props.uploadModalTitle as
          | string
          | ((record: unknown) => string)
          | undefined
      }
    />
  );

  const selectOperationsJSX = (
    <Popconfirm
      title="Xác nhận"
      description="Bạn muốn xóa các bản ghi đã chọn?"
      onConfirm={() => deleteSelectedRows()}
      cancelText="Hủy"
      okText="Xóa">
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
        {contextHolder}
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
