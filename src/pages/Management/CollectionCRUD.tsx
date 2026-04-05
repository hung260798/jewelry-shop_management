import { UploadInput } from "@/components/Inputs/FileUpload";
import SmartImage from "@/components/images/Lazy/SmartImage";
import { useGetList } from "@/hooks/useMyQuery";
import { axiosClientJson } from "@/libraries/axiosClient";
import CRUD from "@/templates/CRUD";
import { ASSET_URL } from "@/utils/constants/URLS";
import { devLog } from "@/utils/logger";
import { appendDomain, getSortOrder } from "@/utils/stringUtils";
import {
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Flex, Input, List, Modal, Switch, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import { AxiosResponse } from "axios";
import SearchBox, {
  useSearchProducts,
} from "components/Inputs/Searchbox/index";
import { memo, useEffect, useMemo, useState } from "react";
import {
  Active,
  Collection as Collection0,
  GetOne,
  Product as Product0,
  WithId,
} from "utils/types/Entities";
import { FormProps } from "utils/types/Form";

type DataRecord = WithId<Collection0 & Active>;
type Product = WithId<Product0>;

const MemoSearchBox = memo(SearchBox);

const imageSmallSizes: [number, number][] = [[200, 200]];

export default function CollectionCRUD() {
  const {
    query: { data: collectionsData, isLoading, error, isFetching },
    searchParams,
    setSearchParams,
    searchItems,
  } = useGetList<DataRecord>({
    url: "/collections",
    queryKey: ["get_collections"],
  });
  const columns: ColumnsType<DataRecord> = useMemo<
    ColumnsType<DataRecord>
  >(() => {
    return [
      {
        title: "No",
        key: "no",
        render(value, record, index) {
          return index + 1;
        },
      },
      {
        title: (
          <div
            className={searchParams.get("name") ? "text-danger" : "secondary"}>
            Tên bộ sưu tập
          </div>
        ),
        dataIndex: "name",
        sorter: true,
        sortOrder: getSortOrder(searchParams.toString(), "name"),
        filterDropdown: () => {
          return (
            <Input.Search
              allowClear
              placeholder="input search text"
              onSearch={(e) => {
                searchItems(
                  [
                    {
                      type: "name",
                      value: e,
                    },
                  ],
                  { resetSkip: true }
                );
              }}
              defaultValue={searchParams.get("name") ?? ""}
              style={{ width: 200 }}
            />
          );
        },
      },
      {
        title: (
          <div
            className={
              searchParams.get("description") ? "text-danger" : "secondary"
            }>
            Mô tả
          </div>
        ),
        dataIndex: "description",
        sorter: true,
        sortOrder: getSortOrder(searchParams.toString(), "description"),
        filterDropdown: () => {
          return (
            <Input.Search
              allowClear
              placeholder="input search text"
              onSearch={(e) => {
                searchItems(
                  [
                    {
                      type: "description",
                      value: e,
                    },
                  ],
                  { resetSkip: true }
                );
              }}
              defaultValue={searchParams.get("description") ?? ""}
              style={{ width: 200 }}
            />
          );
        },
      },
      {
        title: "Ngày tạo",
        dataIndex: "createdDate",
        sorter: true,
        sortOrder: getSortOrder(searchParams.toString(), "createdDate"),
        render(date: string | undefined) {
          if (!date) return "";
          const d: Date = new Date(date);
          return (
            <>
              <span>{d.toLocaleDateString()}</span>
              <br />
              <span>{d.toLocaleTimeString()}</span>
            </>
          );
        },
      },
      {
        title: "Chỉnh sửa lần cuối",
        dataIndex: "modifiedDate",
        sorter: true,
        sortOrder: getSortOrder(searchParams.toString(), "modifiedDate"),
        render(date: string | undefined) {
          if (!date) return "";
          const d: Date = new Date(date);
          return (
            <>
              <span>{d.toLocaleDateString()}</span>
              <br />
              <span>{d.toLocaleTimeString()}</span>
            </>
          );
        },
      },
      {
        dataIndex: "status",
        key: "status",
        title: "Trạng thái",
        render: (status: string | undefined) => {
          return (
            <Tag color="blue">{status ? status.toUpperCase() : "INACTIVE"}</Tag>
          );
        },
        sorter: true,
      },
      {
        title: "Ảnh  BST",
        dataIndex: "image",
        render(src: string) {
          if (typeof src !== "string") return null;
          return (
            <SmartImage
              src={appendDomain(src, ASSET_URL)}
              width={200}
              height={200}
              smallSizes={imageSmallSizes}
              // preview={true}
            />
          );
        },
        width: 240,
      },
      {
        title: "Ảnh bìa BST",
        dataIndex: "coverImage",
        render(src: string) {
          if (typeof src !== "string") return null;
          return (
            <SmartImage
              src={appendDomain(src, ASSET_URL)}
              width={350}
              height={100}
              smallSizes={[[350, 100]]}
              style={{ width: "350px", height: "100px" }}
            />
          );
        },
        width: 240,
      },
    ];
  }, [searchItems, searchParams]);
  const dataSource = collectionsData
    ? "results" in collectionsData
      ? collectionsData.results
      : [collectionsData.result]
    : [];
  const totalAmount = collectionsData
    ? "results" in collectionsData
      ? collectionsData.amountResults
      : 1
    : 0;
  const [showProductList, setShowProductList] = useState<DataRecord | null>(
    null
  );

  const converRecordToFormValues = (record: Collection0) => {
    return {
      ...record,
      files: {
        image: { fileList: [] },
        coverImage: { fileList: [] },
      },
    };
  };

  return (
    <>
      <CRUD<DataRecord>
        columns={columns}
        dataSource={dataSource}
        totalAmount={totalAmount}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        collectionName="collections"
        form={{
          title: "Bộ sưu tập",
          controls: formControls,
        }}
        fileFields={[
          {
            name: "image",
            maxCount: 1,
            fileType: "image",
            sizes: imageSmallSizes,
          },
          {
            name: "coverImage",
            maxCount: 1,
            fileType: "image",
            sizes: [[350, 100]],
          },
        ]}
        functionColumn={{
          extraFunctions: [
            (record) => (
              <Button
                key={1}
                icon={<PlusOutlined />}
                onClick={() => {
                  setShowProductList(record);
                }}
              />
            ),
          ],
        }}
        loading={isLoading || isFetching}
        fetchError={error}
        convertToFormValues={converRecordToFormValues}
      />
      <AddProductBox
        isOpen={showProductList}
        close={() => setShowProductList(null)}
      />
    </>
  );
}

const formControls: FormProps["formControls"] = [
  {
    label: "Id",
    name: "_id",
    className: "hidden",
    component: <Input />,
    defaultValue: "",
  },
  {
    name: "name",
    label: "Tên bộ sưu tập",
    component: <Input />,
    valuePropName: "value",
    defaultValue: "",
  },
  {
    name: "description",
    label: "Mô tả",
    component: <Input />,
    valuePropName: "value",
    defaultValue: "",
  },
  {
    name: "active",
    label: "Kích hoạt",
    component: <Switch />,
    valuePropName: "checked",
    defaultValue: true,
  },
  {
    label: "Ảnh BST",
    name: ["files", "image"],
    valuePropName: "value",
    component: (
      <UploadInput>
        <Button icon={<UploadOutlined />} />
      </UploadInput>
    ),
  },
  {
    label: "Ảnh bìa",
    name: ["files", "coverImage"],
    valuePropName: "value",
    component: (
      <UploadInput maxCount={1}>
        <Button icon={<UploadOutlined />} />
      </UploadInput>
    ),
  },
];

function AddProductBox({
  isOpen: collection,
  close,
}: // refetch,
{
  isOpen: DataRecord | null;
  close: () => void;
  refetch?: () => void;
}) {
  const queryClient = useQueryClient();
  const modalProps = {
    open: collection !== null,
    onOk: async () => {
      try {
        if (collection !== null) {
          await axiosClientJson.patch(`/collections/${collection._id}`, {
            products: added,
          });
          queryClient.setQueryData<AxiosResponse<GetOne<DataRecord>>>(
            ["get_collections", { _id: collectionId }],
            (prev) => {
              const response = prev;
              if (response)
                return {
                  ...response,
                  data: {
                    ...response.data,
                    result: { ...response.data.result, products: added },
                  },
                };
              return undefined;
            }
          );
        }
      } catch (error) {
        // logError(error);
        devLog(error);
      } finally {
        close();
      }
    },
    onCancel: () => close(),
  };
  const collectionId = collection?._id;
  const [added, setAdded] = useState<Product[]>([]);
  const { data: response } = useQuery({
    queryFn: async () => {
      return collectionId
        ? axiosClientJson.get<GetOne<DataRecord>>(
            `/collections/${collectionId}`
          )
        : null;
    },
    queryKey: ["get_collections", { _id: collectionId }],
  });

  useEffect(() => {
    const products = response?.data.result.products;
    setAdded(products ?? []);
  }, [collection, response]);

  return (
    <Modal
      {...modalProps}
      className="relative"
      width={"60rem"}
      height={"45rem"}>
      <Flex className="relative min-h-52 h-full w-full flex-col" gap={"1rem"}>
        <div>
          BST: <strong>{collection?.name}</strong>
        </div>
        <MemoSearchBox
          useSearch={useSearchProducts}
          renderItem={(item, context) => {
            const product = item as Product;
            const isExisted = added.some((p) => p._id === product._id);
            return (
              <Flex
                className="px-3 w-full text-[0.8rem]"
                justify="space-between"
                align="center">
                <Flex align="center">
                  <SmartImage
                    src={appendDomain(product.imageUrl, ASSET_URL)}
                    width={"2rem"}
                    height={"2rem"}
                  />
                  {product.name}
                </Flex>
                <Button
                  onClick={() => {
                    setAdded((prev) => {
                      const currentProducts = prev as Product[];
                      const newArr = [...currentProducts, product];
                      return [
                        ...new Map(newArr.map((p) => [p._id, p])).values(),
                      ];
                    });
                    context?.clearTerm?.();
                  }}
                  size="small"
                  className="text-[.8rem]"
                  icon={<PlusOutlined />}
                  disabled={isExisted}>
                  {isExisted ? "Đã thêm" : "Thêm"}
                </Button>
              </Flex>
            );
          }}
        />
        <div className="max-h-64 overflow-auto">
          <h6>Sản phẩm hiện tại:</h6>
          <List size="small">
            {added.map((item) => {
              const { _id } = item;
              return (
                <List.Item key={_id} className="text-[.8rem]">
                  <Flex
                    justify="space-between"
                    align="center"
                    className="w-full">
                    <Flex align="center">
                      <SmartImage
                        src={appendDomain(item.imageUrl, ASSET_URL)}
                        width={"2rem"}
                        height={"2rem"}
                      />
                      {item.name}
                    </Flex>
                    <Button
                      onClick={() => {
                        setAdded((prev) => {
                          const i = prev.findIndex((elem) => elem._id === _id);
                          if (i >= 0) {
                            const newArr = prev.slice();
                            newArr.splice(i, 1);
                            return newArr;
                          }
                          return prev;
                        });
                      }}
                      size="small"
                      icon={<DeleteOutlined />}
                      danger
                      type="dashed">
                      Xóa
                    </Button>
                  </Flex>
                </List.Item>
              );
            })}
          </List>
        </div>
      </Flex>
    </Modal>
  );
}
