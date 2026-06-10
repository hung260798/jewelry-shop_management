// import { createFormInputs } from "@/components/Forms/FormInputs/Product";
import MyCkeditorFormInput from "@/components/Inputs/MyCkeditorFormInput";
import useMyQuery, { GetOneOrMany } from "@/hooks/useMyQuery";
import useWindowWidth from "@/hooks/useWidth";
import { axiosClientJson } from "@/libraries/axiosClient";
import CRUD, { CRUDProps } from "@/components/CRUD";
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
import {
  CheckOutlined,
  ClearOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
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
import SmartImage from "@/components/Images/Lazy/SmartImage";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
// import { devLog } from "@/utils/logger";
import { DataSelect, DataSelectProps } from "@/components/Inputs/Select";
import { appendDomain, getSortOrder } from "@/utils/stringUtils";
import React from "react";
import { useFileUploadBox } from "@/components/Modals/UploadBox";
import { useSearchParams } from "react-router-dom";
import { useModalForm } from "@/components/Forms/ModalForm";
import { IdAndNameWise } from "@/components/Modals/UploadBox/useFileUploadBox";

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

const formControls: FormControl[] = [
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
    component: <InputNumber max={75} />,
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
    defaultValue: [],
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
  {
    label: "Hình ảnh",
    component: function ImageButton() {
      const setUploadBoxContent = useFileUploadBox((s) => s.setBoxContent);
      const setUploaderQueryKey = useFileUploadBox((s) => s.setQueryKey);
      const setOpenUploadBox = useFileUploadBox((s) => s.setOpen);
      const record = useModalForm((s) => s.formValues as Product);
      const [searchParams] = useSearchParams();
      return (
        <Button
          icon={<UploadOutlined />}
          title="Tải tệp lên"
          onClick={function () {
            setUploadBoxContent({
              collection: "products",
              item: record as unknown as IdAndNameWise,
            });
            const qk: string[][] = [];
            for (const pair of searchParams?.entries() ?? []) {
              qk.push(pair);
            }
            setUploaderQueryKey?.(qk);
            setOpenUploadBox(true);
          }}
        />
      );
    },
    method: "patch",
  },
];

dayjs.extend(customParseFormat);
type Product = WithId<Partial<Base & Active>>;
type Col = ColumnType<Product>;

const IMG_SIZES: [number, number][] = [[200, 200]];
const dateFormat = "DD/MM/YYYY";

export default function ProductCRUD() {
  const queryResult = useMyQuery<GetOneOrMany<Product>>({
    url: "/products",
    queryKey: ["get_products"],
  });

  const { searchParams, searchItems } = queryResult;

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
      title: () => <div className="secondary">No</div>,
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
            placeholder="Nhẫn kim cương"
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
          className={searchParams.get("active") ? "text-danger" : "secondary"}
        >
          Trạng thái
        </div>
      ),
      dataIndex: "active",
      key: "active",
      render: (active: string) => {
        let content = <Tag color="green">Đang hoạt động</Tag>;
        if (!active) {
          content = <Tag color="gold">Tạm ẩn</Tag>;
        }
        return content;
      },
      filterDropdown: () => {
        return (
          <Select
            allowClear
            onClear={() => {
              searchItems([{ type: "active", value: "" }]);
            }}
            style={{ width: "125px" }}
            placeholder="Chọn trạng thái"
            optionFilterProp="children"
            showSearch
            onChange={(e) => {
              if (e === "active") {
                searchItems([{ type: "active", value: "true" }], {
                  replace: true,
                });
              } else if (e === "inActive") {
                searchItems([{ type: "active", value: "false" }], {
                  replace: true,
                });
              }
            }}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={[
              {
                value: "active",
                label: "Hoạt động",
              },
              {
                value: "inActive",
                label: "Tạm ẩn",
              },
            ]}
          />
        );
      },
      width: "120px",
      responsive: ["xl"],
    },
    // Is Deleted
    {
      title: (
        <div
          className={
            searchParams.get("isDeleted") ? "text-danger" : "secondary"
          }
        >
          Đã xóa?
        </div>
      ),
      dataIndex: "isDeleted",
      key: "isDeleted",
      render: (isDeleted: boolean) => {
        return (
          <Flex justify={"center"} align={"center"}>
            {isDeleted ? <CheckOutlined /> : null}
          </Flex>
        );
      },
      filterDropdown: () => {
        return (
          <Select
            allowClear
            onClear={() => {
              searchItems([{ type: "isDeleted", value: "" }]);
            }}
            placeholder="Chọn trạng thái"
            optionFilterProp="children"
            showSearch
            onChange={(e) => {
              if (e === "isDeleted") {
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
                value: "nonDeleted",
                label: "Chưa xóa",
              },
              {
                value: "isDeleted",
                label: "Đã xóa",
              },
            ]}
          />
        );
      },
      width: "100px",
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
                fallback="/placeholder-image.jpg"
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
        return (
          <div
            className={
              searchParams.get("supplierId[]") ? "text-danger" : "secondary"
            }
          >
            Nhà cung cấp
          </div>
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
            onChange={(val: string) => {
              searchItems(
                {
                  type: "supplierId[]",
                  value: val,
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
    // Price
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
          >
            <Space
              direction={width > 896 ? "horizontal" : "vertical"}
              size={"small"}
            >
              <Form.Item
                // hasFeedback
                label="Giá từ"
                name="fromPrice"
              >
                <InputNumber<string | number>
                  placeholder="100.000"
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
              <Form.Item label="đến" name="toPrice">
                <InputNumber<string | number>
                  placeholder="100.000.000"
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
    // Sold
    {
      width: "100px",
      title: () => {
        return (
          <div
            className={
              searchParams.get("fromStock") || searchParams.get("toStock")
                ? "text-danger"
                : "secondary"
            }
          >
            Doanh số
          </div>
        );
      },
      dataIndex: "sold",
      key: "sold",
      filterDropdown: () => {
        return (
          <Form
            name="infoStock"
            onFinish={(e) => {
              searchItems(
                [
                  { type: "fromSold", value: e.fromStock },
                  { type: "toSold", value: e.toStock },
                ],
                { resetSkip: true }
              );
            }}
            className=" px-2 py-2 h-12"
          >
            <Space>
              <Form.Item
                // hasFeedback
                label="Từ"
                name="fromSold"
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
              <Form.Item label="đến" name="toSold">
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
                {searchParams.get("fromSold") || searchParams.get("toSold") ? (
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => {
                        searchItems(
                          [
                            { type: "fromSold", value: "" },
                            { type: "toSold", value: "" },
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
      sortOrder: getSortOrder(searchParams.toString(), "sold"),
    },
    // Stock
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
            className=" px-2 py-2 h-12"
          >
            <Space>
              <Form.Item
                // hasFeedback
                label="Từ"
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
              <Form.Item label="đến" name="toStock">
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
    // Discount
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
            onFinish={(values) => {
              const valueSearch = [
                { type: "fromDiscount", value: values.fromDiscount },
                { type: "toDiscount", value: values.toDiscount },
              ];
              valueSearch.map((item) => searchItems(item));
            }}
            className=" px-2 py-2 h-12"
          >
            <Space>
              <Form.Item label="Từ" name="fromDiscount">
                <InputNumber<number>
                  placeholder="Enter From"
                  min={1}
                  className="w-28"
                />
              </Form.Item>
              <Form.Item label="đến" name="toDiscount">
                <InputNumber<number>
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
      sortOrder: getSortOrder(searchParams.toString(), "discount"),
    },
    // Note
    {
      title: "Lưu ý",
      dataIndex: "note",
      key: "note",
      width: "100px",
    },
    // Average Rating
    {
      title: "Đánh giá",
      dataIndex: "averageRate",
      key: "averageRate",
      width: "100px",
      render: (averageRating: number) => {
        return averageRating ? averageRating.toFixed(1) : "0.0";
      },
    },
    // CreatedDate
    {
      title: (
        <div
          className={
            searchParams.get("createdDateFrom") ||
            searchParams.get("createdDateTo")
              ? "text-danger"
              : "secondary"
          }
        >
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
    // CreatedBy
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
    // UpdatedDate
    {
      title: (
        <div
          className={
            searchParams.get("createdDateFrom") ||
            searchParams.get("createdDateTo")
              ? "text-danger"
              : "secondary"
          }
        >
          Chỉnh sửa gần nhất
        </div>
      ),
      dataIndex: "updatedDate",
      key: "updatedDate",
      width: "160px",
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "updatedDate"),
      render: (updatedDate: string) => {
        return (
          <div>
            <div>{dayjs(updatedDate).format("DD/MM/YYYY")}</div>
            <div>{dayjs(updatedDate).format("HH:mm")}</div>
          </div>
        );
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
                  { type: "updatedDateFrom", value: undefined },
                  { type: "updatedDateTo", value: undefined },
                ];
                const data = e?.map((date) => dayjs(date).format("YYYY/MM/DD"));
                if (data) {
                  searchValues[0] = {
                    type: "updatedDateFrom",
                    value: data[0],
                  };
                  searchValues[1] = { type: "updatedDateTo", value: data[1] };
                }
                searchItems(searchValues, { resetSkip: true });
              }}
            />
          </div>
        );
      },
    },
    // functionColumn,
  ];

  const activeParam = searchParams.get("active");
  const isDeletedParam = searchParams.get("isDeleted");
  const showingInActive = !activeParam || activeParam == "false";
  const showingDeleted = !isDeletedParam || isDeletedParam == "true";
  const filterButtons = (
    <>
      <Button
        key={1}
        style={{ width: "13em" }}
        onClick={async () => {
          searchItems([
            { type: "active", value: showingInActive ? "true" : "" },
            { type: "skip", value: "0" },
          ]);
        }}
      >
        {showingInActive ? "Ẩn" : "Hiện"} không hoạt động
      </Button>
      <Button
        key={2}
        style={{ width: "8em" }}
        onClick={async () => {
          searchItems([
            {
              type: "isDeleted",
              value: showingDeleted ? "false" : "",
            },
            { type: "skip", value: "0" },
          ]);
        }}
      >
        {showingDeleted ? "Ẩn" : "Hiện"} đã xóa
      </Button>
    </>
  );
  const crudProps: CRUDProps<Product> = {
    columns: columns,
    collectionName: "products",
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
    // filterButtons: filterButtons,
    // refetch: () => refetch(),
    form: {
      controls: formControls,
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
            {filterButtons}
            {selectOperations}
          </Flex>
          {tablePart}
          {formRender}
          {fileUploadPart}
        </div>
      );
    },
    // loading: loadingProd,
    // fetchError: error,
    query: queryResult,
  };

  return <CRUD {...crudProps} />;
}
