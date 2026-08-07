import { ModalForm, useModalForm } from "@/components/Forms/ModalForm";
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
  ReloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Empty, Flex, Grid, Popconfirm, Table } from "antd";
import { ColumnsType, ColumnType, TableProps } from "antd/es/table";
import React, { ReactNode, useEffect, useState } from "react";
import { GetOneOrMany, IdWise, WithId } from "utils/types/Entities";
import { FileField, FormControl, FormProps } from "utils/types/Form";
import cssStyles from "./crud.module.css";
// import ErrorPage from "@/components/fallbacks/Error";
import { ModalFormProps } from "@/components/Forms/ModalForm/ModalForm";
import useFileUploadBox, {
  IdAndNameWise,
} from "@/components/Modals/UploadBox/useFileUploadBox";
import {
  extractArrayFromGetOneOrMany,
  MyQueryReturnType,
} from "@/hooks/useMyQuery";
import usePopupMessage from "@/hooks/usePopupMessage";
import { devLog, getErrorMessage } from "@/utils/logger";

export type CRUDFunctions = {
  handleDelete?: (record: IdWise) => void | Promise<void>;
  handlePageChange?: (current: number, pageSize: number) => void;
  clearParams?: () => void;
};

export interface CRUDProps<T> {
  collectionName: string;
  columns: ColumnsType<T>;
  functions?: CRUDFunctions;
  filterButtons?: ReactNode;
  fileFields?: FileField[];
  uploadModalTitle?: string | ((record: T) => string);
  form?: {
    controls?: FormControl[];
    title?: string;
    submitFn?: (values: unknown) => Promise<void>;
    customComponent?: React.FC<
      Omit<FormProps, "submitFn" | "formControls" | "modalTitle" | "formValues">
    >;
    modalProps?: ModalFormProps["modalProps"];
  };
  createFormValues?: (record: T) => unknown;
  functionColumn?: {
    extraFunctions?: ((record: T) => ReactNode)[];
    override?: (record: T) => ReactNode;
  };
  layout?: (...parts: ReactNode[]) => JSX.Element;
  query: MyQueryReturnType<GetOneOrMany<T>>;
}

export const PERPAGE_SIZE = 10;

const collectionTitleMap: Record<string, string> = {
  categories: "Danh mục",
  collections: "Bộ sưu tập",
  customers: "Khách hàng",
  employees: "Nhân viên",
  features: "Tính năng",
  orders: "Đơn hàng",
  products: "Sản phẩm",
  slides: "Slides",
  suppliers: "Nguồn cung",
};

/**
 * A reusable CRUD (Create, Read, Update, Delete) component for managing data in a table format.
 * @param props CRUDProps<DataType>
 * @returns
 */
export default function CRUD<DataType extends WithId<object>>(
  props: CRUDProps<DataType>
) {
  const {
    columns,
    functions = {},
    filterButtons: dataChangeButtons = null,
    fileFields,
    collectionName,
    form,
    createFormValues = (record) => record,
    query: queryResults,
  } = props;

  const { searchParams, setSearchParams, query } = queryResults ?? {};
  const {
    data,
    isLoading,
    error: fetchError,
    isFetching,
    refetch,
  } = query ?? {};
  const { dataSource, amountResults: totalAmount } =
    extractArrayFromGetOneOrMany(data);
  const tableLoading = isLoading || isFetching;

  const [messageApi, , key] = usePopupMessage() || [];
  const screens = Grid.useBreakpoint();
  const queryClient = useQueryClient();
  const openModal = useModalForm((s) => s.openModal);
  const setUploadBoxContent = useFileUploadBox((s) => s.setBoxContent);
  const setUploaderQueryKey = useFileUploadBox((s) => s.setQueryKey);
  const setOpenUploadBox = useFileUploadBox((s) => s.setOpen);

  const [currentPage, setCurrentPage] = useState(1);
  const [cachedData, setCachedData] = useState<{
    dataSource: DataType[];
    totalAmount: number;
  }>({
    dataSource: dataSource,
    totalAmount: totalAmount,
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const hasSelected = selectedRowKeys.length > 0;
  const title = collectionTitleMap[collectionName] ?? collectionName;

  // Update cachedData only when not loading and dataSource changes
  useEffect(() => {
    if (!tableLoading && dataSource && dataSource.length > 0 && totalAmount) {
      setCachedData({ dataSource, totalAmount });
    }
  }, [dataSource, totalAmount, tableLoading]);

  useEffect(() => {
    if (fetchError) {
      if (messageApi && key) {
        messageApi.open({
          content: getErrorMessage(fetchError),
          key,
          type: "error",
        });
      }
      // or: messageApi?.error(getErrorMessage(fetchError));
      devLog(fetchError);
    }
  }, [fetchError]);

  useEffect(() => {
    try {
      let skip: string | number | null = searchParams?.get("skip") ?? null;
      skip = skip ? +skip : 0;
      setCurrentPage(skip / PERPAGE_SIZE + 1);
    } catch (err) {
      console.error(err);
    }
  }, [searchParams?.get("skip")]);

  // End of hooks, start of functions
  async function defaultHandleDelete({ _id }: IdWise) {
    if (collectionName) {
      try {
        await axiosClientJson.delete(`/${collectionName}/${_id}`);
        messageApi?.success("Delete success", 1);
        await queryClient.invalidateQueries({
          queryKey: [`${collectionName}`],
        });
      } catch (error) {
        const errorName = error instanceof Error ? error.name : "Unknown error";
        messageApi?.error(`Delete fail: ${errorName}`, 1);
      }
    }
  }

  async function defaultClearParams() {
    if (setSearchParams && searchParams) {
      setSearchParams(new URLSearchParams("skip=0&limit=10"));
    }
  }

  const {
    handleDelete = defaultHandleDelete,
    clearParams = defaultClearParams,
  } = functions;

  const handleTableChange: TableProps["onChange"] = (
    pagination,
    filters,
    sorter
  ) => {
    if (!searchParams || !setSearchParams) return;
    const params = new URLSearchParams(searchParams);
    const { current, pageSize } = pagination;
    if (typeof current === "number" && typeof pageSize === "number") {
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
      const { extraFunctions, override } = props.functionColumn ?? {};
      return (
        <Flex gap={8} wrap className={cssStyles.rowActions}>
          {override ? (
            override(record)
          ) : (
            <>
              <Button
                icon={<EditOutlined />}
                title="Chỉnh sửa"
                type="text"
                className={cssStyles.iconButton}
                onClick={() => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  openModal(
                    createFormValues(record) as any,
                    collectionName,
                    queryResults.queryKey
                  );
                }}
              />
              <Popconfirm
                title="Xác nhận xóa"
                okType="danger"
                onConfirm={() => {
                  handleDelete(record);
                }}
                cancelText="Hủy"
              >
                <Button
                  title="Xóa"
                  type="text"
                  danger
                  className={cssStyles.iconButton}
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </>
          )}
          {fileFields && collectionName && (
            <Button
              icon={<UploadOutlined />}
              title="Tải tệp lên"
              type="text"
              className={cssStyles.iconButton}
              onClick={function () {
                setUploadBoxContent({
                  collection: collectionName,
                  item: record as unknown as IdAndNameWise,
                });
                // const queryKey: string[][] = [];
                // for (const pair of searchParams?.entries() ?? []) {
                //   queryKey.push(pair);
                // }
                setUploaderQueryKey?.([
                  Object.fromEntries(searchParams?.entries() ?? []),
                ]);
                setOpenUploadBox(true);
              }}
            />
          )}
          {extraFunctions?.map((elem) => elem(record))}
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
              openModal(undefined, collectionName, queryResults.queryKey);
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
                Xóa đã chọn
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
        messageApi?.warning(
          `${failureCount} delete failed, ${
            selectedRowKeys.length - failureCount
          } success`
        );
      } else {
        messageApi?.success(`All delete success`);
      }
      if (successCount) {
        queryClient.invalidateQueries({ queryKey: [`${collectionName}`] });
      }
    } catch (error) {
      messageApi?.error((error as Error).message);
    }
  }

  const formJSX: ReactNode = form?.customComponent
    ? (() => {
        const CustomForm = form.customComponent;
        return <CustomForm />;
      })()
    : form
      ? (() => {
          const { controls = [], submitFn, modalProps } = form;
          return (
            <ModalForm
              formControls={controls}
              submitFn={submitFn}
              modalTitle={
                (props.uploadModalTitle as (
                  formValues: unknown
                ) => string | string) || collectionName
              }
              refetch={refetch}
              collectionName={collectionName}
              fileFields={fileFields}
              modalProps={modalProps ?? {}}
            />
          );
        })()
      : null;

  let isFiltering = false;
  if (searchParams) {
    for (const key of searchParams.keys()) {
      if (!["skip", "limit", "sortBy", "sortOrder"].includes(key)) {
        isFiltering = true;
        break;
      }
    }
  }

  const addBtnJSX = (
    <>
      <Button
        type="primary"
        className={cssStyles.primaryAction}
        onClick={() => {
          // setFormValues(undefined);
          // setOpen(true);
          openModal(undefined, collectionName, queryResults.queryKey);
          // setFieldsChange(false);
        }}
        icon={<PlusOutlined />}
      >
        Thêm
      </Button>
      <Button
        onClick={() => defaultClearParams()}
        disabled={!isFiltering}
        icon={<FilterOutlined />}
        className={cssStyles.secondaryAction}
      >
        Xóa bộ lọc
      </Button>
      <Button
        onClick={() => {
          query.refetch();
        }}
        icon={<ReloadOutlined />}
        className={cssStyles.secondaryAction}
        disabled={isLoading || isFetching}
      >
        Làm mới
      </Button>
    </>
  );

  const finalDataSource = fetchError
    ? cachedData.dataSource || []
    : tableLoading
      ? cachedData.dataSource
      : dataSource;

  const tableJSX = (
    <Table<DataType>
      columns={[...columns, functionColumn]}
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
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              isFiltering
                ? "Không có dữ liệu phù hợp với bộ lọc"
                : "Chưa có dữ liệu"
            }
          />
        ),
      }}
      rowSelection={{
        selectedRowKeys,
        onChange: (newSelectedRowKeys: React.Key[]) => {
          setSelectedRowKeys(newSelectedRowKeys);
        },
        fixed: true,
      }}
      className={cssStyles.crudTable}
      size={screens.xl ? "middle" : "small"}
      sticky={{ offsetHeader: 64 }}
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
      okText="Xóa"
    >
      <Button
        danger
        disabled={!hasSelected}
        icon={<DeleteOutlined />}
        className={cssStyles.dangerAction}
      >
        Xóa đã chọn
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
      <div className={cssStyles.crudPage}>
        <div className={cssStyles.crudPanel}>
          <Flex
            className={cssStyles.toolbar}
            justify="space-between"
            align="center"
            gap={12}
            wrap
          >
            <div className={cssStyles.heading}>
              <h1>{title}</h1>
              <span>
                {tableLoading
                  ? "Đang cập nhật dữ liệu"
                  : `${totalAmount ?? 0} bản ghi`}
                {hasSelected ? `, ${selectedRowKeys.length} đã chọn` : ""}
              </span>
            </div>
            <Flex className={cssStyles.toolbarActions} gap={8} wrap>
              {addBtn}
              {dataChangeButtons}
              {selectOperations}
            </Flex>
          </Flex>
          <div className={cssStyles.tableSurface}>{tablePart}</div>
        </div>
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
