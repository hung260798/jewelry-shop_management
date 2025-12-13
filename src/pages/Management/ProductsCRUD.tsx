// import { createFormInputs } from "@/components/Forms/FormInputs/Product";
import MyCkeditorFormInput from "@/components/Inputs/MyCkeditorFormInput";
import useMyQuery, { GetOneOrMany } from "@/hooks/useMyQuery";
import useWindowWidth from "@/hooks/useWidth";
import { axiosClientJson } from "@/libraries/axiosClient";
import CRUD, { CRUDProps } from "@/templates/CRUD";
import { API_URL } from "@/utils/constants/URLS";
import { GetManyData } from "@/utils/mutationFn";
import {
  Active,
  Product as Base,
  Category,
  Supplier,
  WithId,
} from "@/utils/types/Entities";
import { FormControl } from "@/utils/types/Form";
import { ClearOutlined, SearchOutlined } from "@ant-design/icons";
import { GetMany, GetOne } from "@repo/utils/types";
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  Flex,
  Form,
  Input,
  InputNumber,
  Select,
  Skeleton,
  Space,
  Switch,
  Tag,
} from "antd";
import Search from "antd/es/input/Search";
import { ColumnType } from "antd/es/table";
import "ckeditor5-premium-features/ckeditor5-premium-features.css";
import "ckeditor5/ckeditor5.css";
import SmartImage from "components/images/Lazy/SmartImage";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useMemo } from "react";
// import { devLog } from "@/utils/logger";
import { AxiosResponse } from "axios";
import React, { useState } from "react";

export function createFormInputs(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  categories: WithId<Category>[] = [],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  suppliers: WithId<Supplier>[] = []
): FormControl[] {
  return [
    {
      label: "Id",
      name: "_id",
      className: "hidden",
      component: <Input />,
    },
    {
      label: "Danh mục",
      name: "categoryId",
      rules: [
        {
          required: true,
          message: "Please enter Category Name",
        },
      ],
      // component: (
      //   <Select<string, { label: string; value: string }>
      //     showSearch
      //     placeholder="Select a category"
      //     optionFilterProp="children"
      //     filterOption={(input, option) =>
      //       (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
      //     }
      //     options={categories.map((item) => {
      //       return {
      //         label: item.name,
      //         value: item._id,
      //       };
      //     })}
      //   />
      // ),
      flex: "basis-[364px] grow-0",
      component: <CategorySelect />,
    },
    {
      label: "Nhà cung cấp",
      name: "supplierId",
      rules: [
        {
          required: true,
          message: "Please enter Supplier Name",
        },
      ],
      // component: (
      //   <Select
      //     showSearch
      //     placeholder="Select a supplier"
      //     optionFilterProp="children"
      //     filterOption={(input, option) =>
      //       (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
      //     }
      //     options={suppliers.map((item) => {
      //       return {
      //         label: `${item.name}`,
      //         value: item._id,
      //       };
      //     })}
      //   />
      // ),
      flex: `grow-0`,
      component: <SupplierSelect />,
    },
    {
      label: "Tên sản phẩm",
      name: "name",
      rules: [
        {
          required: true,
          message: "Please en100%ter Product Name",
        },
      ],
      component: <Input />,
      flex: "grow-0 basis-[100%]",
    },
    {
      label: "Giá",
      name: "price",
      rules: [
        {
          required: true,
          message: "Please enter Price",
        },
      ],
      component: (
        <InputNumber<number>
          style={{ width: "100%" }}
          min={1}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
          }
          parser={(value) =>
            +(value?.replace(/\s?d|(\.*)/g, "").replace(/\./g, "") || 0)
          }
        />
      ),
      flex: `basis-[33%] grow-0`,
    },
    {
      label: "Giảm giá",
      name: "discount",
      rules: [
        {
          required: true,
          message: "Nhập mức giảm giá (%)",
        },
        {
          type: "integer",
          min: 0,
          message: "Phần trăm giảm giá phải là số nguyên không âm",
        },
      ],
      component: <InputNumber min={1} max={75} />,
      flex: `basis-[30%] grow-0`,
    },
    {
      label: "Số lượng",
      name: "stock",
      rules: [
        {
          required: true,
          message: "Nhập số lượng hàng",
        },
        {
          type: "integer",
          min: 0,
          message: "Số lượng hàng phải là số nguyên không âm",
        },
      ],
      component: <InputNumber min={1} />,
      flex: `basis-[30%] grow-0`,
    },
    {
      label: "Đang hoạt động",
      name: "active",
      component: <Switch />,
      valuePropName: "checked",
      flex: "basis-[30%] grow-0",
    },
    {
      label: "Đã xóa",
      name: "isDeleted",
      component: <Switch />,
      valuePropName: "checked",
      flex: "basis-[30%] grow-0",
    },
    {
      label: "Vị trí quảng bá",
      name: "promotionPosition",
      component: (
        <Select
          mode="multiple"
          allowClear
          showSearch
          placeholder="Select promotion"
          optionFilterProp="children"
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          options={[
            {
              value: "TOP-MONTH",
              label: "TOP-MONTH",
            },
            {
              value: "DEAL",
              label: "DEAL",
            },
          ]}
        />
      ),
      flex: "basis-[364px] grow-0",
    },
    {
      label: "Ghi chú",
      name: "note",
      component: <Input />,
      flex: "basis-[364px] grow-0",
    },
    {
      label: "Mô tả",
      name: "description",
      component: <MyCkeditorFormInput />,
      flex: "basis-[364px] grow-0",
    },
  ];
}

interface CategorySelectProps {
  value?: string;
  onChange?: (value: string) => void;
}

const CategorySelect: React.FC<CategorySelectProps> = (props) => {
  return (
    <>
      <DataSelect
        queryOpts={
          {
            queryKey: ["get_categories"],
            queryFn: () => {
              return axiosClientJson.get<GetManyData<WithId<Category>>>(
                `/categories`
              );
            },
            retry: false,
            refetchInterval: 3 * 60 * 1000,
          } as DataSelectProps["queryOpts"]
        }
        value={props.value}
        onChange={props.onChange}
      />
    </>
  );
};

const SupplierSelect: React.FC<CategorySelectProps> = (props) => {
  return (
    <>
      <DataSelect
        queryOpts={
          {
            queryKey: ["get_suppliers"],
            queryFn: () => {
              return axiosClientJson.get<GetManyData<WithId<Supplier>>>(
                `/suppliers`
              );
            },
            retry: false,
            refetchInterval: 3 * 60 * 1000,
          } as DataSelectProps["queryOpts"]
        }
        value={props.value}
        onChange={props.onChange}
      />
    </>
  );
};

interface DataSelectProps<T = unknown> {
  options?: T[];
  value?: string;
  onChange?: (value: string) => void;
  queryOpts: {
    queryFn: () => Promise<AxiosResponse>;
    queryKey: unknown[];
  };
}

const DataSelect = (props: DataSelectProps) => {
  const { data: response, isLoading, error } = useQuery(props.queryOpts);
  const options = response?.data.results;
  const [value, setValue] = useState<string | null>(null);
  // devLog("categories input controls", categories);
  if (isLoading) {
    return <>Loading...</>;
  }
  if (error) {
    return <>Load error</>;
  }
  if (!Array.isArray(options)) {
    return <>Null</>;
  }
  return (
    <Select<string, { label: string; value: string }>
      showSearch
      placeholder="Select a category"
      optionFilterProp="children"
      filterOption={(input, option) =>
        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
      }
      options={options.map((item) => {
        return {
          label: item.name,
          value: item._id,
        };
      })}
      value={props.value ?? value}
      onChange={(value) => {
        setValue(value);
        props.onChange?.(value);
      }}
    />
  );
};

dayjs.extend(customParseFormat);
type Product = WithId<Partial<Base & Active>>;
type Col = ColumnType<Product>;

const IMG_SIZES = [[200, 200]] as [number, number][];

export default function ProductCRUD() {
  const {
    query: { data: productsData, refetch, isLoading: loadingProd, error },
    searchParams,
    setSearchParams,
    searchItems,
  } = useMyQuery<GetOneOrMany<Product>>({
    url: "/products",
    queryKey: ["get_products"],
    placeholderData: { results: [], amountResults: 0 },
  });

  //GET CATEGORIES
  const { data: categoriesData, isLoading: loadingCat } = useQuery({
    queryKey: ["get_categories"],
    queryFn: () => {
      return axiosClientJson.get<GetManyData<WithId<Category>>>(`/categories`);
    },
    retry: false,
    refetchInterval: 3 * 60 * 1000,
  });

  //GET SUPPLIERS
  const { data: suppliersData, isLoading: loadingSup } = useQuery({
    queryKey: ["get_suppliers"],
    queryFn: () => {
      return axiosClientJson.get<GetManyData<WithId<Supplier>>>(`/suppliers`);
    },
    retry: false,
    refetchInterval: 3 * 60 * 1000,
  });

  const width = useWindowWidth();

  //Setting column
  const columns: Col[] = useMemo(() => {
    return [
      // NO
      {
        title: () => {
          return searchParams.get("active") || searchParams.get("isDeleted") ? (
            <div className="text-danger">No</div>
          ) : (
            <div className="secondary">No</div>
          );
        },
        // title: "No",
        dataIndex: "id",
        key: "id",
        render: (text: string, record: Product, index: number) => {
          return <Space>{+(searchParams.get("skip") ?? 0) + index + 1}</Space>;
        },
        width: "60px",
        responsive: ["xl"],
      },
      {
        // width: "5%",
        width: "250px",
        title: () => {
          const isSearched = searchParams.get("productName");
          return (
            <div className={isSearched ? "text-danger" : "secondary"}>
              Tên sản phẩm
            </div>
          );
        },
        // title: () => {
        //   return "Tên sản phẩm";
        // },
        dataIndex: "name",
        key: "name",
        filterDropdown: () => {
          return (
            <Search
              allowClear
              placeholder="input search text"
              onSearch={(e) => {
                searchItems(
                  [
                    {
                      type: "productName",
                      value: e,
                    },
                  ],
                  { resetSkip: true }
                );
              }}
              defaultValue={searchParams.get("productName") ?? ""}
              style={{ width: 200 }}
            />
          );
        },
        sorter: true,
      },
      // State
      {
        title: "Trạng thái",
        dataIndex: "active",
        key: "active",
        render: (text: string, record: Product) => {
          let content = <Tag color="green">ACTIVE</Tag>;
          if (record.active === false && !record.isDeleted) {
            content = <Tag color="gold">INACTIVE</Tag>;
          } else if (record.isDeleted) {
            content = <Tag color="red">DELETED</Tag>;
          }
          return content;
        },
        filterDropdown: () => {
          return (
            <Select
              allowClear
              onClear={() => {
                searchItems([
                  { type: "active", value: "" },
                  { type: "isDeleted", value: "" },
                ]);
              }}
              style={{ width: "125px" }}
              placeholder="Select "
              optionFilterProp="children"
              showSearch
              onChange={(e) => {
                if (e === "active") {
                  searchItems([{ type: "active", value: "true" }], {
                    replace: true,
                  });
                } else if (e === "unActive") {
                  searchItems([{ type: "active", value: "false" }], {
                    replace: true,
                  });
                } else if (e === "isDeleted") {
                  searchItems(
                    {
                      type: "isDeleted",
                      value: "true",
                    },
                    { replace: true }
                  );
                }
              }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={[
                {
                  value: "active",
                  label: "Active",
                },
                {
                  value: "unActive",
                  label: "Unactive",
                },
                {
                  value: "isDeleted",
                  label: "Deleted",
                },
              ]}
            />
          );
        },
        width: "120px",
        responsive: ["xl"],
      },
      {
        width: "90px",
        title: <div className="max-w-[90px] truncate">Ảnh sản phẩm</div>,
        key: "imageUrl",
        dataIndex: "imageUrl",
        render: (value: string) => {
          return (
            <div className=" flex flex-row justify-between items-center">
              <SmartImage
                src={`${API_URL}${value}`}
                style={{ height: 70, width: 70 }}
                smallSizes={IMG_SIZES}
              />
            </div>
          );
        },
      },
      // Category
      {
        width: "100px",
        title: () => {
          return searchParams.get("categoryId") ? (
            <div className="text-danger">Danh mục</div>
          ) : (
            <div className="secondary">Danh mục</div>
          );
        },
        // title: "Danh mục",
        dataIndex: "categoryId",
        key: "category",
        sorter: true,
        filterDropdown: () => {
          if (loadingCat) {
            return <Skeleton active />;
          }
          return (
            <Select
              allowClear
              showSearch
              style={{ width: "100%" }}
              placeholder="Chọn danh mục"
              onChange={(e) => {
                searchItems(
                  {
                    type: "categoryId[]",
                    value: e,
                  },
                  { resetSkip: true }
                );
              }}
              filterOption={(input, option) => {
                if (typeof option?.label !== "string") {
                  return false;
                }
                return (
                  (option?.label ?? "")
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                );
              }}
              options={
                categoriesData?.data?.results?.map((item) => ({
                  label: item.name,
                  value: item._id,
                })) || []
              }
            />
          );
        },
        render: (text, record) => record.category?.name,
      },
      // Supplier
      {
        width: "100px",
        title: () => {
          return searchParams.get("supplierId") ? (
            <div className="text-danger">Nhà cung cấp</div>
          ) : (
            <div className="secondary">Nhà cung cấp</div>
          );
        },
        dataIndex: ["supplier", "name"],
        sorter: true,
        key: "supplier",
        filterDropdown: () => {
          if (loadingSup) {
            return <Skeleton active />;
          }
          return (
            <Select
              allowClear
              style={{ width: "125px" }}
              placeholder="Chọn nhà cung cấp"
              onChange={(e: string) => {
                searchItems(
                  {
                    type: "supplierId[]",
                    value: e,
                  },
                  { resetSkip: true }
                );
              }}
              showSearch={true}
              filterOption={(input, option) => {
                if (typeof option?.label !== "string") {
                  return false;
                }
                return (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase());
              }}
              options={
                suppliersData?.data?.results?.map(
                  (item: { _id: string; name: string }) => {
                    return {
                      label: `${item.name}`,
                      value: item._id,
                    };
                  }
                ) || []
              }
            />
          );
        },
      },
      {
        width: "120px",
        title: () => {
          const cls =
            searchParams.get("fromPrice") || searchParams.get("toPrice")
              ? "text-danger"
              : "secondary";
          return <div className={cls}>Giá</div>;
        },
        // title: () => {
        //   return "Giá";
        // },
        dataIndex: "price",
        key: "price",
        render: (text: number) => {
          const formattedPrice = text.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          });
          return formattedPrice;
        },
        filterDropdown: () => {
          return (
            <Form
              name="inforPrice"
              onFinish={(e) => {
                const valueSearch = [
                  { type: "fromPrice", value: e.fromPrice },
                  { type: "toPrice", value: e.toPrice },
                ];
                searchItems(valueSearch, { resetSkip: true });
              }}
              className=" px-2 py-2 h-fit"
            >
              <Space
                direction={width > 896 ? "horizontal" : "vertical"}
                size={"small"}
              >
                <Form.Item
                  // hasFeedback
                  label="from"
                  name="fromPrice"
                >
                  <InputNumber<string | number>
                    placeholder="Enter From"
                    min={1}
                    className="w-28"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                    }
                    parser={(value) =>
                      value!.replace(/\s?d|(\.*)/g, "").replace(/\./g, "")
                    }
                  />
                </Form.Item>
                <Form.Item label="to" name="toPrice">
                  <InputNumber<string | number>
                    placeholder="Enter to"
                    min={1}
                    className="w-28"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                    }
                    parser={(value) =>
                      value!.replace(/\s?d|(\.*)/g, "").replace(/\./g, "")
                    }
                  />
                </Form.Item>
                <span>
                  <Form.Item>
                    <Button
                      // style={{ width: "30px", right: "-10px" }}
                      type="dashed"
                      htmlType="submit"
                      icon={<SearchOutlined />}
                    />
                  </Form.Item>
                </span>
                <span>
                  {searchParams.get("fromPrice") ||
                  searchParams.get("toPrice") ? (
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => {
                          searchItems(
                            [
                              { type: "fromPrice", value: "" },
                              { type: "toPrice", value: "" },
                            ],
                            { resetSkip: true }
                          );
                        }}
                        icon={<ClearOutlined />}
                      />
                    </Form.Item>
                  ) : (
                    ""
                  )}
                </span>
              </Space>
            </Form>
          );
        },
        sorter: true,
        // sortDirections: ["ascend", "descend", null],
      },
      {
        width: "100px",
        title: () => {
          return searchParams.get("fromStock") ||
            searchParams.get("toStock") ? (
            <div className="text-danger">Tồn kho</div>
          ) : (
            <div className="secondary">Tồn kho</div>
          );
        },
        dataIndex: "stock",
        key: "stock",
        filterDropdown: () => {
          return (
            <Form
              name="infoStock"
              onFinish={(e) => {
                searchItems(
                  [
                    { type: "fromStock", value: e.fromStock },
                    { type: "toStock", value: e.toStock },
                  ],
                  { resetSkip: true }
                );
              }}
              className=" px-2 py-2 h-12"
            >
              <Space>
                <Form.Item
                  // hasFeedback
                  label="from"
                  name="fromStock"
                >
                  <InputNumber<string | number>
                    placeholder="Enter From"
                    min={1}
                    className="w-28"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                    }
                    parser={(value) =>
                      value!.replace(/\s?d|(\.*)/g, "").replace(/\./g, "")
                    }
                  />
                </Form.Item>
                <Form.Item label="to" name="toStock">
                  <InputNumber<string | number>
                    placeholder="Enter to"
                    min={1}
                    className="w-28"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                    }
                    parser={(value) =>
                      value!.replace(/\s?d|(\.*)/g, "").replace(/\./g, "")
                    }
                  />
                </Form.Item>
                <span>
                  <Form.Item>
                    <Button
                      type="dashed"
                      htmlType="submit"
                      icon={<SearchOutlined />}
                    />
                  </Form.Item>
                </span>
                <span>
                  {searchParams.get("fromStock") ||
                  searchParams.get("toStock") ? (
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => {
                          searchItems(
                            [
                              { type: "fromStock", value: "" },
                              { type: "toStock", value: "" },
                            ],
                            { resetSkip: true }
                          );
                        }}
                        icon={<ClearOutlined />}
                      />
                    </Form.Item>
                  ) : (
                    ""
                  )}
                </span>
              </Space>
            </Form>
          );
        },
        sorter: true,
        sortDirections: ["ascend", "descend"],
      },
      {
        width: "90px",
        title: () => {
          return searchParams.get("fromDiscount") ||
            searchParams.get("toDiscount") ? (
            <div className="text-danger">KM</div>
          ) : (
            <div className="secondary">KM</div>
          );
        },
        dataIndex: "discount",
        key: "discount",
        filterDropdown: () => {
          return (
            <Form
              name="infoDiscount"
              onFinish={(e) => {
                const valueSearch = [
                  { type: "fromDiscount", value: e.fromDiscount },
                  { type: "toDiscount", value: e.toDiscount },
                ];
                valueSearch.map((item) => searchItems(item));
              }}
              className=" px-2 py-2 h-12"
            >
              <Space>
                <Form.Item label="from" name="fromDiscount">
                  <InputNumber
                    placeholder="Enter From"
                    min={1}
                    className="w-28"
                  />
                </Form.Item>
                <Form.Item label="to" name="toDiscount">
                  <InputNumber
                    placeholder="Enter to"
                    min={1}
                    className="w-28"
                  />
                </Form.Item>
                <span>
                  <Form.Item>
                    <Button
                      type="dashed"
                      htmlType="submit"
                      icon={<SearchOutlined />}
                    />
                  </Form.Item>
                </span>
                <span>
                  {searchParams.get("fromDiscount") ||
                  searchParams.get("toDiscount") ? (
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => {
                          searchItems(
                            [
                              { type: "fromDiscount", value: "" },
                              { type: "toDiscount", value: "" },
                            ],
                            { resetSkip: true }
                          );
                        }}
                        icon={<ClearOutlined />}
                      />
                    </Form.Item>
                  ) : (
                    ""
                  )}
                </span>
              </Space>
            </Form>
          );
        },
        sorter: true,
        sortDirections: ["ascend", "descend"],
      },
      {
        title: "Lưu ý",
        dataIndex: "note",
        key: "note",
        width: "100px",
      },
      // functionColumn,
    ];
  }, [searchParams, categoriesData, suppliersData]);

  let dataSource = productsData
    ? (productsData as GetMany<Product>).results ??
      (productsData as GetOne<Product>).result
    : [];
  const totalAmount = productsData
    ? (productsData as GetMany<Product>).amountResults ?? 1
    : 0;

  if (dataSource && !Array.isArray(dataSource)) {
    dataSource = [dataSource];
  }
  const paramActive = searchParams.get("active");
  const paramIsDeleted = searchParams.get("isDeleted");
  const extraButtons = [
    <Button
      key={1}
      style={{ width: "13em" }}
      onClick={async () => {
        searchItems([
          { type: "active", value: paramActive === null ? "true" : "" },
        ]);
      }}
    >
      {paramActive === null ? "Ẩn" : "Hiện"} không hoạt động
    </Button>,
    <Button
      key={2}
      style={{ width: "8em" }}
      onClick={async () => {
        searchItems([
          { type: "isDeleted", value: paramIsDeleted === null ? "false" : "" },
          { type: "skip", value: "0" },
        ]);
      }}
    >
      {paramIsDeleted === null ? "Ẩn" : "Hiện"} đã xóa
    </Button>,
  ];

  const crudProps: CRUDProps<Product> = {
    columns: columns,
    dataSource: dataSource,
    collectionName: "products",
    searchParams: searchParams,
    setSearchParams: setSearchParams,
    fileFields: [
      {
        name: "imageUrl",
        maxCount: 1,
        fileType: "image",
        label: "Avatar",
        sizes: IMG_SIZES,
      },
      {
        name: "images",
        maxCount: 5,
        fileType: "image",
        label: "Images",
        sizes: IMG_SIZES,
      },
    ],
    totalAmount: totalAmount,
    dataChangeButtons: extraButtons,
    refetch: () => refetch(),
    form: {
      controls: createFormInputs(
        categoriesData?.data.results,
        suppliersData?.data.results
      ),
      title: "Product",
    },
    layout: (
      addBtn,
      tablePart,
      formRender,
      fileUploadPart,
      selectOperations
    ) => {
      return (
        <div>
          <Flex className="my-2 mx-4" wrap gap={3}>
            {addBtn}
            {extraButtons}
            {selectOperations}
          </Flex>
          {tablePart}
          {formRender}
          {fileUploadPart}
        </div>
      );
    },
    loading: loadingProd,
    fetchError: error,
  };

  return <CRUD {...crudProps} />;
}
