import SmartImage from "@/components/Images/Lazy/SmartImage";
import {
  useGetListQuery,
  extractArrayFromGetOneOrMany,
} from "@/hooks/useMyQuery";
import CRUD from "@/components/CRUD";
import { appendDomain, getSortOrder } from "@/utils/stringUtils";
import { Active, Category, WithId } from "@/utils/types/Entities";
import { FormControl } from "@/utils/types/Form";
import { Select, Space, Tag } from "antd";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import { useMemo, useState, useEffect } from "react";
import { UploadInput } from "@/components/Inputs/FileUpload";
import { UploadOutlined } from "@ant-design/icons";
import { Button, Checkbox, Input, InputNumber } from "antd";
import { ASSET_URL } from "@/utils/constants/URLS";
import dayjs from "dayjs";

type Entity = WithId<Category> & Active;

const imageSizes = [
  [80, 80],
  [120, 120],
];

type CategoryOption = {
  value: string;
  label: string;
};

const coverImageSizes = [
  [240, 80],
  [300, 100],
];

const getControls = (categoryOptions: CategoryOption[]): FormControl[] => [
  {
    label: "Id",
    name: "_id",
    className: "hidden",
    component: <Input />,
    defaultValue: "",
  },
  {
    label: "Tên",
    name: "name",
    rules: [{ required: true, message: "Please input Name!" }],
    component: <Input />,
    className: "texxt basis-full",
    defaultValue: "",
  },
  {
    label: "Mô tả",
    name: "description",
    rules: [{ required: true, message: "Please input Description!" }],
    component: <Input />,
    className: "basis-full",
    defaultValue: "",
  },
  // {
  //   label: "Hình đại diện",
  //   name: "coverImageUrl",
  //   rules: [{ required: true, message: "Please input coverImageUrl!" }],
  //   component: <Input />,
  // },
  {
    label: "Danh mục cha",
    name: "parentCategory",
    component: (
      <Select
        allowClear
        showSearch
        placeholder="Select parent category"
        optionFilterProp="label"
        filterOption={(input, option) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
        }
        options={categoryOptions}
      />
    ),
    className: "basis-full",
    defaultValue: "",
  },
  {
    label: "Promotion",
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
    className: "basis-full",
    defaultValue: [],
  },
  {
    label: "Vị trí sắp xếp",
    name: "sortOrder",
    component: <InputNumber min={1} />,
    className: "basis-1/3",
    defaultValue: "",
  },
  {
    label: "Hoạt động",
    name: "active",
    valuePropName: "checked",
    component: <Checkbox />,
    className: "basis-1/3",
    defaultValue: true,
  },
  {
    label: "Đã xóa",
    name: "isDeleted",
    valuePropName: "checked",
    component: <Checkbox />,
    className: "basis-1/3",
    defaultValue: false,
  },
  {
    label: "Ghi chú",
    name: "note",
    component: <Input />,
    defaultValue: "",
  },
  {
    label: "Image",
    name: ["files", "imageUrl"],
    component: (
      <UploadInput maxCount={1}>
        <Button icon={<UploadOutlined />} />
      </UploadInput>
    ),
    valuePropName: "value",
  },
  {
    label: "Cover Image",
    name: ["files", "coverImageUrl"],
    component: (
      <UploadInput maxCount={1}>
        <Button icon={<UploadOutlined />} />
      </UploadInput>
    ),
    valuePropName: "value",
  },
];

function CategoryCRUD() {
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);

  const queryResults = useGetListQuery<Entity>({
    queryKey: ["get_categories"],
    url: "/categories",
  });

  // Build category options for the parent category select
  useEffect(() => {
    const { dataSource } = extractArrayFromGetOneOrMany(
      queryResults.query.data
    );
    const options: CategoryOption[] = (dataSource as Entity[])
      .filter((cat: Entity) => !cat.isDeleted)
      .map((cat: Entity) => ({
        value: cat._id,
        label: cat.name,
      }));
    setCategoryOptions(options);
  }, [queryResults.query.data]);

  const {
    query: { refetch },
    searchItems,
    searchParams,
  } = queryResults;

  //Setting column
  const columns = useMemo(() => {
    return [
      //NO
      {
        title: () => {
          const isFiltering =
            searchParams.has("active") || searchParams.has("isDeleted");
          return (
            <div className={isFiltering ? "text-danger" : "secondary"}>No</div>
          );
        },
        dataIndex: "_id",
        key: "id",
        render: (text: string, record, index) => {
          return <Space>{index + 1}</Space>;
        },
        // width: "3%",
        responsive: ["xl"],
      },
      // State
      {
        title: () => {
          const isFiltering =
            searchParams.has("active") || searchParams.has("isDeleted");
          return (
            <div className={isFiltering ? "text-danger" : "secondary"}>
              Trạng thái
            </div>
          );
        },
        dataIndex: "active",
        key: "status",
        render: (active: boolean, record) => {
          return (
            <Space style={{ width: "100%" }}>
              {active === true && !record.isDeleted && (
                <Tag color="green">ACTIVE</Tag>
              )}
              {active === false && !record.isDeleted && (
                <Tag color="yellow">INACTIVE</Tag>
              )}
              {record.isDeleted === true && <Tag color="red">DELETED</Tag>}
            </Space>
          );
        },
        filterDropdown: () => {
          return (
            <Select
              allowClear
              onClear={() => {
                searchParams.delete("active");
                searchParams.delete("isDeleted");
                refetch();
              }}
              style={{ width: "125px" }}
              placeholder="Select a supplier"
              optionFilterProp="children"
              showSearch
              onChange={(value) => {
                switch (value) {
                  case "active":
                    searchItems(
                      [
                        { type: "active", value: "true" },
                        { type: "isDeleted", value: undefined },
                      ],
                      { resetSkip: true }
                    );
                    break;
                  case "inActive":
                    searchItems(
                      [
                        { type: "active", value: "false" },
                        { type: "isDeleted", value: undefined },
                      ],
                      { resetSkip: true }
                    );
                    break;
                  case "isDeleted":
                    searchItems(
                      [
                        { type: "isDeleted", value: "true" },
                        { type: "active", value: undefined },
                      ],
                      { resetSkip: true }
                    );
                    break;
                  default:
                    searchItems([
                      { type: "active", value: undefined },
                      { type: "isDeleted", value: undefined },
                    ]);
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
                  value: "inActive",
                  label: "Inactive",
                },
                {
                  value: "isDeleted",
                  label: "Deleted",
                },
              ]}
            />
          );
        },
        // width: "10%",
        responsive: ["xl"],
      },
      //Name
      {
        title: (
          <div
            className={searchParams.get("name") ? "text-danger" : "secondary"}
          >
            Tên danh mục
          </div>
        ),
        dataIndex: "name",
        key: "name",
        sorter: true,
        sortOrder: getSortOrder(searchParams.toString(), "name"),
        filterDropdown: () => {
          return (
            <div style={{ padding: 8 }}>
              <Search
                allowClear
                placeholder="Enter name"
                onSearch={(e) => {
                  searchItems({ type: "name", value: e }, { resetSkip: true });
                }}
                style={{ width: 200 }}
              />
            </div>
          );
        },
        // width: "10%",
      },
      //IMAGE
      {
        width: "100px",
        title: "Ảnh danh mục",
        key: "imageUrl",
        dataIndex: "imageUrl",
        render: (text, record) => {
          const imageSrc = appendDomain(record.imageUrl, ASSET_URL);
          return (
            <div className="flex justify-center items-center gap-2 ">
              {imageSrc && (
                <SmartImage
                  src={`${imageSrc}`}
                  // style={{ width: "100px" }}
                  smallSizes={imageSizes as [number, number][]}
                  alt="record.imageUrl"
                  className="object-fill"
                  width={150}
                  height={150}
                  fallback="/placeholder-image.jpg"
                />
              )}
            </div>
          );
        },
      },
      // BIG COVER IMAGE
      {
        width: "200px",
        title: "Ảnh bìa danh mục",
        key: "coverImageUrl",
        dataIndex: "coverImageUrl",
        render: (coverImageUrl: string | undefined) => {
          return (
            <div className="flex justify-center items-center gap-2">
              {coverImageUrl && (
                <SmartImage
                  src={appendDomain(coverImageUrl, ASSET_URL)}
                  // style={{ width: "100px" }}
                  smallSizes={coverImageSizes as [number, number][]}
                  alt="coverImage"
                  className="object-fill"
                  fallback="/placeholder-image.jpg"
                />
              )}
            </div>
          );
        },
      },
      //Desciption
      {
        title: () => (
          <div
            className={searchParams.has("description") ? "danger" : "secondary"}
          >
            Mô tả
          </div>
        ),
        dataIndex: "description",
        key: "description",
        sorter: true,
        sortOrder: getSortOrder(searchParams.toString(), "description"),
        filterDropdown: () => {
          return (
            <div style={{ padding: 8 }}>
              <Search
                allowClear
                placeholder="Enter description"
                onSearch={(value) => {
                  searchItems(
                    { type: "description", value: value },
                    { resetSkip: true }
                  );
                }}
                style={{ width: 200 }}
              />
            </div>
          );
        },
      },
      // Thứ tự xuất hiện
      {
        title: () => <div>Thứ tự xuất hiện</div>,
        dataIndex: "sortOrder",
        key: "sortOrder",
        sorter: true,
        sortOrder: getSortOrder(searchParams.toString(), "sortOrder"),
      },
      // Parent Category
      {
        title: "Danh mục cha",
        dataIndex: ["parentCategory", "name"],
        key: "parentCategory",
        render: (text: string, record: Entity) => {
          if (!record.parentCategory) {
            return <span className="text-gray-400">-</span>;
          }
          const parentCategoryName =
            typeof record.parentCategory === "object"
              ? record.parentCategory.name
              : record.parentCategory;
          return <span>{parentCategoryName}</span>;
        },
      },
      //Note
      {
        title: "Lưu ý",
        dataIndex: "note",
        key: "note",
        sorter: true,
        sortOrder: getSortOrder(searchParams.toString(), "note"),
        // width: "8%",
      },
      {
        title: "Chỉnh sửa lần cuối",
        dataIndex: "updatedDate",
        key: "updatedDate",
        sorter: true,
        sortOrder: getSortOrder(searchParams.toString(), "updatedDate"),
        // width: "150px",
        render: (updatedDate: string) => {
          const d = dayjs(updatedDate);
          return (
            <div>
              <div>{d.format("DD-MM-YYYY")}</div>
              <div>{d.format("HH:mm")}</div>
            </div>
          );
        },
      },
    ] as ColumnsType<WithId<Category> & Active>;
  }, [searchItems, searchParams]);

  const converRecordToFormValues = (record: Entity) => {
    return {
      ...record,
      files: {
        imageUrl: { fileList: [] },
        coverImageUrl: { fileList: [] },
      },
    };
  };

  const controls = getControls(categoryOptions);

  return (
    <CRUD
      columns={columns}
      query={queryResults}
      collectionName="categories"
      form={{
        title: "Danh mục sản phẩm",
        controls: controls,
      }}
      fileFields={[
        {
          name: "imageUrl",
          fileType: "image",
          label: "Image",
          maxCount: 1,
          sizes: imageSizes as [number, number][],
        },
        {
          name: "coverImageUrl",
          fileType: "image",
          label: "Cover Image",
          maxCount: 1,
          sizes: coverImageSizes as [number, number][],
        },
      ]}
      convertToFormValues={converRecordToFormValues}
    />
  );
}

export default CategoryCRUD;
