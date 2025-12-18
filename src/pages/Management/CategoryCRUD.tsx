import LazyFadeImage from "@/components/images/Lazy/SmartImage";
import { useGetList } from "@/hooks/useMyQuery";
import CRUD from "@/templates/CRUD";
import { appendDomain } from "@/utils/stringUtils";
import { Active, Category, WithId } from "@/utils/types/Entities";
import { FormControl } from "@/utils/types/Form";
import { Select, Space, Tag } from "antd";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import { useMemo } from "react";

import { UploadInput } from "@/components/Inputs/FileUpload";
import { UploadOutlined } from "@ant-design/icons";
import { Button, Checkbox, Input, InputNumber } from "antd";
import { ASSET_URL } from "@/utils/constants/URLS";

const formItems = [
  {
    label: "Id",
    name: "_id",
    className: "hidden",
    component: <Input />,
  },
  {
    label: "Tên",
    name: "name",
    rules: [{ required: true, message: "Please input Name!" }],
    component: <Input />,
    className: "texxt basis-full",
  },
  {
    label: "Mô tả",
    name: "description",
    rules: [{ required: true, message: "Please input Description!" }],
    component: <Input />,
    className: "basis-full",
  },
  // {
  //   label: "Hình đại diện",
  //   name: "coverImageUrl",
  //   rules: [{ required: true, message: "Please input coverImageUrl!" }],
  //   component: <Input />,
  // },
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
  },
  {
    label: "Vị trí sắp xếp",
    name: "sortOrder",
    component: <InputNumber min={1} />,
    className: "basis-1/3",
  },
  {
    label: "Hoạt động",
    name: "active",
    valuePropName: "checked",
    component: <Checkbox />,
    className: "basis-1/3",
  },
  {
    label: "Đã xóa",
    name: "isDeleted",
    valuePropName: "checked",
    component: <Checkbox />,
    className: "basis-1/3",
  },
  {
    label: "Ghi chú",
    name: "note",
    component: <Input />,
  },
  {
    label: "Image",
    name: ["files", "imageUrl"],
    component: (
      <UploadInput>
        <Button icon={<UploadOutlined />} />
      </UploadInput>
    ),
    valuePropName: "value",
  },
  {
    label: "Cover Image",
    name: ["files", "coverImageUrl"],
    component: (
      <UploadInput>
        <Button icon={<UploadOutlined />} />
      </UploadInput>
    ),
    valuePropName: "value",
  },
];

type Entity = WithId<Category> & Active;

const imageSizes = [
  [80, 80],
  [120, 120],
];

const coverImageSizes = [
  [240, 80],
  [300, 100],
];

const controls: FormControl[] = formItems;

function CategoryCRUD() {
  const queryProps = {
    queryKey: ["get_categories"],
    url: "/categories",
    // initData: { results: [], amountResults: 0 },
  };
  const useQueryHook = useGetList<Entity>;

  const {
    query: { data: categoriesData, refetch, isLoading, error },
    searchItems,
    searchParams,
    setSearchParams,
  } = useQueryHook(queryProps);

  //Setting column
  const columns = useMemo(() => {
    return [
      //NO
      {
        title: () => {
          return (
            <div>
              {searchParams.get("active") || searchParams.get("isDeleted") ? (
                <div className="text-danger">No</div>
              ) : (
                <div className="secondary">No</div>
              )}
            </div>
          );
        },
        dataIndex: "_id",
        key: "id",
        render: (text: string, record, index) => {
          return (
            <Space>
              {index + 1}{" "}
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
        width: "11%",
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
      },
      //IMAGE
      {
        width: "200px",
        title: "Ảnh danh mục",
        key: "imageUrl",
        dataIndex: "imageUrl",
        render: (text, record) => {
          const imageSrc = appendDomain(record.imageUrl, ASSET_URL);
          return (
            <div className="flex justify-center items-center gap-2 h-[120px]">
              {imageSrc && (
                <LazyFadeImage
                  src={`${imageSrc}`}
                  // style={{ width: "100px" }}
                  smallSizes={imageSizes as [number, number][]}
                  alt="record.imageUrl"
                  className="object-fill"
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
                <LazyFadeImage
                  src={appendDomain(coverImageUrl, ASSET_URL)}
                  // style={{ width: "100px" }}
                  smallSizes={coverImageSizes as [number, number][]}
                  alt="coverImage"
                  className="object-fill"
                />
              )}
            </div>
          );
        },
      },
      //Desciption
      {
        title: () => {
          return searchParams.get("description") ? (
            <div className="text-danger">Mô tả</div>
          ) : (
            <div className="secondary">Mô tả</div>
          );
        },
        dataIndex: "description",
        key: "description",
        sorter: true,
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
      //Note
      {
        title: "Lưu ý",
        dataIndex: "note",
        key: "note",
        sorter: true,
        width: "10%",
      },
    ] as ColumnsType<WithId<Category> & Active>;
  }, [searchItems, searchParams]);

  const dataSource = categoriesData?.results;

  const converRecordToFormValues = (record: Entity) => {
    return {
      ...record,
      files: {
        imageUrl: { fileList: [] },
        coverImageUrl: { fileList: [] },
      },
    };
  };

  return (
    <CRUD
      columns={columns}
      dataSource={dataSource}
      searchParams={searchParams}
      setSearchParams={setSearchParams}
      collectionName="categories"
      totalAmount={categoriesData?.amountResults ?? 0}
      form={{
        title: "Category",
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
      loading={isLoading}
      fetchError={error}
      convertToFormValues={converRecordToFormValues}
    />
  );
}

export default CategoryCRUD;
