import { UploadInput } from "@/components/Inputs/FileUpload";
import SmartImage from "@/components/images/Lazy/SmartImage";
import { useGetList } from "@/hooks/useMyQuery";
import { axiosClientJson } from "@/libraries/axiosClient";
import CRUD from "@/templates/CRUD";
import { API_URL } from "@/utils/constants/URLS";
import { appendDomain } from "@/utils/stringUtils";
import {
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { logError } from "@repo/utils/log";
import {
  Active,
  Collection as Collection0,
  GetOne,
  Product as Product0,
  WithId,
} from "@repo/utils/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Flex, Input, List, Modal, Space, Switch, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import { AxiosResponse } from "axios";
import SearchBox, {
  useSearchProducts,
} from "components/Inputs/Searchbox/index";
import { memo, useEffect, useState } from "react";
import { FormProps } from "utils/types/Form";

type DataRecord = WithId<Collection0 & Active>;
type Product = WithId<Product0>;

const MemoSearchBox = memo(SearchBox);

const imageSmallSizes: [number, number][] = [[200, 200]];

export default function CollectionCRUD() {
  const columns: ColumnsType<DataRecord> = [
    {
      title: "No",
      key: "no",
      render(value, record, index) {
        return index + 1;
      },
    },
    {
      title: "Tên bộ sưu tập",
      dataIndex: "name",
      sorter: true,
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
      title: "Mô tả",
      dataIndex: "description",
      sorter: true,
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
      dataIndex: "activeState",
      key: "activeState",
      title: "Trạng thái",
      render: (text: string, record) => {
        return (
          <Space>
            {record.active === true && !record.isDeleted && (
              <Tag color="green">ACTIVE</Tag>
            )}
            {record.active === false && !record.isDeleted && (
              <Tag color="yellow">INACTIVE</Tag>
            )}
            {record.isDeleted === true && <Tag color="red">DELETED</Tag>}
          </Space>
        );
      },
    },
    {
      title: "Ảnh  BST",
      dataIndex: "image",
      render(src: string) {
        return (
          <SmartImage
            src={appendDomain(src, API_URL)}
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
        return (
          <SmartImage
            src={appendDomain(src, API_URL)}
            width={200}
            height={200}
            // preview={true}
            smallSizes={imageSmallSizes}
          />
        );
      },
      width: 240,
    },
  ];
  const {
    query: { data: collectionsData, isLoading, error },
    searchParams,
    setSearchParams,
    searchItems,
  } = useGetList<DataRecord>({
    url: "/collections",
    queryKey: ["get_collections"],
  });
  let dataSource: Array<DataRecord> = [];
  let amountResults: number = 0;
  if (collectionsData) {
    if ("results" in collectionsData) {
      dataSource = collectionsData.results;
      amountResults = collectionsData.amountResults;
    } else {
      dataSource = [collectionsData.result];
      amountResults = 1;
    }
  }
  const [showProductList, setShowProductList] = useState<DataRecord | null>(
    null
  );

  if (isLoading) {
    return null;
  }

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
      <CRUD
        columns={columns}
        dataSource={dataSource}
        totalAmount={amountResults}
        form={{
          title: "Bộ sưu tập",
          controls: formControls,
        }}
        collectionName="collections"
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
            sizes: imageSmallSizes,
          },
        ]}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
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
        convertToFormValues={converRecordToFormValues}
        fetchError={error}
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
  },
  {
    name: "name",
    label: "Tên bộ sưu tập",
    component: <Input />,
    valuePropName: "value",
  },
  {
    name: "description",
    label: "Mô tả",
    component: <Input />,
    valuePropName: "value",
  },
  {
    name: "active",
    label: "Kích hoạt",
    component: <Switch />,
    valuePropName: "checked",
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
            products: checked,
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
                    result: { ...response.data.result, products: checked },
                  },
                };
              return undefined;
            }
          );
        }
      } catch (error) {
        logError(error);
      } finally {
        close();
      }
    },
    onCancel: () => close(),
  };
  const collectionId = collection?._id;
  const [checked, setChecked] = useState<Product[]>([]);
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
    setChecked(products ?? []);
  }, [collection, response]);

  return (
    <Modal
      {...modalProps}
      className="relative"
      width={"60rem"}
      height={"45rem"}
    >
      <Flex className="relative min-h-52 h-full w-full flex-col" gap={"1rem"}>
        <div>Tìm sản phẩm</div>
        <MemoSearchBox
          useSearch={useSearchProducts}
          renderItem={(item, context) => {
            const product = item as Product;
            return (
              <Flex
                className="px-3 w-full text-[0.8rem]"
                justify="space-between"
                align="center"
              >
                <Flex align="center">
                  <SmartImage
                    src={appendDomain(product.imageUrl, API_URL)}
                    width={"2rem"}
                    height={"2rem"}
                  />
                  {product.name}
                </Flex>
                <Button
                  onClick={() => {
                    setChecked((prev) => {
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
                >
                  Thêm
                </Button>
              </Flex>
            );
          }}
        />
        <div>
          <h6>Sản phẩm hiện tại:</h6>
          <List size="small">
            {checked.map((item) => {
              const { _id } = item;
              return (
                <List.Item key={_id} className="text-[.8rem]">
                  <Flex
                    justify="space-between"
                    align="center"
                    className="w-full"
                  >
                    <Flex align="center">
                      <SmartImage
                        src={appendDomain(item.imageUrl, API_URL)}
                        width={"2rem"}
                        height={"2rem"}
                      />
                      {item.name}
                    </Flex>
                    <Button
                      onClick={() => {
                        setChecked((prev) => {
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
                    >
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
