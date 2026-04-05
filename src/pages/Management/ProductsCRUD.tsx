// import { createFormInputs } from "@/components/Forms/FormInputs/Product";
import MyCkeditorFormInput from "@/components/Inputs/MyCkeditorFormInput";
import useMyQuery, { GetOneOrMany } from "@/hooks/useMyQuery";
import useWindowWidth from "@/hooks/useWidth";
import { axiosClientJson } from "@/libraries/axiosClient";
import CRUD, { CRUDProps } from "@/templates/CRUD";
import { ASSET_URL } from "@/utils/constants/URLS";
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
import { useQuery } from "@tanstack/react-query";
import {
  Button,
  DatePicker,
  Flex,
  Form,
  Image,
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
import { GetMany, GetOne } from "utils/types/Entities";
// import { devLog } from "@/utils/logger";
import { DataSelect, DataSelectProps } from "@/components/Inputs/Select";
import { appendDomain, getSortOrder } from "@/utils/stringUtils";
import React from "react";

interface CustomSelectProps {
  value?: string;
  onChange?: (value: string) => void;
}

const CategorySelect: React.FC<CustomSelectProps> = (props) => {
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

const SupplierSelect: React.FC<CustomSelectProps> = (props) => {
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

const inputs: FormControl[] = [
  {
    label: "Id",
    name: "_id",
    className: "hidden",
    component: <Input />,
    defaultValue: "",
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
    flex: "basis-[364px] grow-0",
    component: <CategorySelect />,
    defaultValue: "",
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
    flex: `grow-0`,
    component: <SupplierSelect />,
    defaultValue: "",
  },
  {
    label: "Tên sản phẩm",
    name: "name",
    rules: [
      {
        required: true,
        message: "Please enter Product Name",
      },
    ],
    component: <Input />,
    flex: "grow-0 basis-[100%]",
    defaultValue: "",
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
        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
        parser={(value) =>
          +(value?.replace(/\s?d|(\.*)/g, "").replace(/\./g, "") || 0)
        }
      />
    ),
    flex: `basis-[33%] grow-0`,
    defaultValue: "",
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
    defaultValue: "",
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
    defaultValue: "",
  },
  {
    label: "Đang hoạt động",
    name: "active",
    component: <Switch />,
    valuePropName: "checked",
    flex: "basis-[30%] grow-0",
    defaultValue: true,
  },
  {
    label: "Đã xóa",
    name: "isDeleted",
    component: <Switch />,
    valuePropName: "checked",
    flex: "basis-[30%] grow-0",
    defaultValue: false,
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
    defaultValue: "",
  },
  {
    label: "Ghi chú",
    name: "note",
    component: <Input />,
    flex: "basis-[364px] grow-0",
    defaultValue: "",
  },
  {
    label: "Mô tả",
    name: "description",
    component: <MyCkeditorFormInput />,
    flex: "basis-[364px] grow-0",
    defaultValue: "",
  },
];

dayjs.extend(customParseFormat);
type Product = WithId<Partial<Base & Active>>;
type Col = ColumnType<Product>;

const IMG_SIZES: [number, number][] = [[200, 200]];
const dateFormat = "DD/MM/YYYY";

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
  const columns: Col[] = [
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
        return (
          <Space className="text-center">
            {+(searchParams.get("skip") ?? 0) + index + 1}
          </Space>
        );
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
      sortOrder: getSortOrder(searchParams.toString(), "name"),
    },
    // State
    {
      title: (
        <div
          className={
            searchParams.get("active") || searchParams.get("isDeleted")
              ? "text-danger"
              : "secondary"
          }>
          Trạng thái
        </div>
      ),
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
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
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
    // ImageUrl
    {
      width: "40px",
      title: <div className="max-w-10 truncate">Ảnh sản phẩm</div>,
      key: "imageUrl",
      dataIndex: "imageUrl",
      render: (url, record) => {
        if (!url) return null;
        return (
          <div className=" flex flex-row justify-between items-center">
            <Image.PreviewGroup items={[url, ...(record?.images || [])]}>
              <SmartImage
                src={appendDomain(url, ASSET_URL)}
                smallSizes={IMG_SIZES}
                width={80}
                height={80}
              />
            </Image.PreviewGroup>
          </div>
        );
      },
    },
    // Category
    {
      width: "100px",
      title: () => {
        return searchParams.get("categoryId[]") ? (
          <div className="text-danger">Danh mục</div>
        ) : (
          <div className="secondary">Danh mục</div>
        );
      },
      // title: "Danh mục",
      dataIndex: "categoryId",
      key: "category",
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "categoryId"),
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
        return searchParams.get("supplierId[]") ? (
          <div className="text-danger">Nhà cung cấp</div>
        ) : (
          <div className="secondary">Nhà cung cấp</div>
        );
      },
      dataIndex: "supplierId",
      render: (supId, record) => record.supplier?.name,
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "supplierId"),
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
        return <div className={cls}>Giá (VND)</div>;
      },
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "price"),
      // title: () => {
      //   return "Giá";
      // },
      dataIndex: "price",
      key: "price",
      render: (ogPrice: number, product) => {
        const reducePrice = ogPrice * (1 - (product.discount ?? 0) / 100);
        const formattedPrice = reducePrice.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        });
        return (
          <div>
            <span className="line-through">
              {ogPrice.toLocaleString("vi-VN", {
                style: "currency",
                currency: "VND",
              })}
            </span>
            <br />
            <span className="font-semibold text-lg text-amber-600">
              {formattedPrice}
            </span>
          </div>
        );
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
            className=" px-2 py-2 h-fit">
            <Space
              direction={width > 896 ? "horizontal" : "vertical"}
              size={"small"}>
              <Form.Item
                // hasFeedback
                label="from"
                name="fromPrice">
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
    },
    {
      width: "100px",
      title: () => {
        return searchParams.get("fromStock") || searchParams.get("toStock") ? (
          <div className="text-danger">Còn lại</div>
        ) : (
          <div className="secondary">Còn lại</div>
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
            className=" px-2 py-2 h-12">
            <Space>
              <Form.Item
                // hasFeedback
                label="from"
                name="fromStock">
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
      sortOrder: getSortOrder(searchParams.toString(), "stock"),
    },
    {
      width: "90px",
      title: () => {
        return searchParams.get("fromDiscount") ||
          searchParams.get("toDiscount") ? (
          <div className="text-danger">Mức KM</div>
        ) : (
          <div className="secondary">Mức KM</div>
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
            className=" px-2 py-2 h-12">
            <Space>
              <Form.Item label="from" name="fromDiscount">
                <InputNumber
                  placeholder="Enter From"
                  min={1}
                  className="w-28"
                />
              </Form.Item>
              <Form.Item label="to" name="toDiscount">
                <InputNumber placeholder="Enter to" min={1} className="w-28" />
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
      sortOrder: getSortOrder(searchParams.toString(), "discount"),
    },
    // {
    //   title: "Lưu ý",
    //   dataIndex: "note",
    //   key: "note",
    //   width: "100px",
    // },
    {
      title: (
        <div
          className={
            searchParams.get("createdDateFrom") ||
            searchParams.get("createdDateTo")
              ? "text-danger"
              : "secondary"
          }>
          Tạo vào lúc
        </div>
      ),
      dataIndex: "createdDate",
      key: "createdDate",
      width: "100px",
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "createdDate"),
      render: (createdDate: string) => {
        return dayjs(createdDate).format("DD/MM/YYYY HH:mm");
      },
      filterDropdown: () => {
        return (
          <div style={{ padding: 8 }}>
            <DatePicker.RangePicker
              allowClear
              defaultValue={[
                dayjs("01/01/1900", dateFormat),
                dayjs("01/01/2023", dateFormat),
              ]}
              format={dateFormat}
              onChange={async (e) => {
                const searchValues: { type: string; value?: string }[] = [
                  { type: "createdDateFrom", value: undefined },
                  { type: "createdDateTo", value: undefined },
                ];
                const data = e?.map((date) => dayjs(date).format("YYYY/MM/DD"));
                if (data) {
                  searchValues[0] = {
                    type: "createdDateFrom",
                    value: data[0],
                  };
                  searchValues[1] = { type: "createdDateTo", value: data[1] };
                }
                searchItems(searchValues, { resetSkip: true });
              }}
            />
          </div>
        );
      },
    },
    {
      title: "Tạo bởi",
      dataIndex: "createdBy",
      key: "createdBy",
      width: "100px",
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "createdBy"),
      render: (createdBy: string) => {
        return createdBy || "";
      },
    },
    // functionColumn,
  ];

  let dataSource = productsData
    ? ((productsData as GetMany<Product>).results ??
      (productsData as GetOne<Product>).result)
    : [];
  const totalAmount = productsData
    ? ((productsData as GetMany<Product>).amountResults ?? 1)
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
      }}>
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
      }}>
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
      controls: inputs,
      title: "Sản phẩm",
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
