import SmartImage from "@/components/images/Lazy/SmartImage";
import useMyQuery from "@/hooks/useMyQuery";
import CRUD from "@/templates/CRUD";
import { GetManyData } from "@/utils/mutationFn";
import { UploadOutlined } from "@ant-design/icons";
import { Button, Input, InputNumber, Select, Space, Switch, Tag } from "antd";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import { UploadInput } from "components/Inputs/FileUpload";
import { API_URL } from "utils/constants/URLS";

const formFields = [
  {
    label: "Id",
    name: "_id",
    component: <Input />,
    className: "hidden",
  },

  {
    label: "Tiêu đề",
    name: "title",
    rules: [{ required: true, message: "Tiêu đề không được để trống" }],
    component: <Input />,
  },
  {
    label: "Tóm tắt",
    name: "summary",
    rules: [{ required: true, message: "Tóm tắt không được để  trống" }],
    component: <Input />,
  },
  {
    label: "URL",
    name: "url",
    rules: [{ required: true, message: "URL không được để trống" }],
    component: <Input />,
  },
  {
    label: "Vị trí",
    name: "sortOrder",
    rules: [{ required: true, message: "Vị trí không được để trống" }],
    component: <InputNumber />,
  },
  {
    label: "Đang hoạt động",
    name: "active",
    component: <Switch />,
  },
  {
    label: "Ghi chú",
    name: "note",
    component: <Input />,
  },
  {
    label: "Ảnh",
    name: ["files", "imageUrl"],
    component: (
      <UploadInput maxCount={1}>
        <Button icon={<UploadOutlined />} />
      </UploadInput>
    ),
  },
];

interface Feature {
  _id: string;
  title: string;
  summary: string;
  imageUrl: string;
  note: string;
  active: boolean;
  isDeleted: boolean;
}

const imageUrlSizes: [number, number][] = [[80, 80]];

function FeaturesCRUD() {
  const {
    query: { data: featuresData, refetch, isLoading, error },
    searchItems,
    searchParams,
    setSearchParams,
  } = useMyQuery<GetManyData<Feature>>({
    queryKey: ["get_features"],
    url: "/features",
  });

  //Setting column
  const columns: ColumnsType<Feature> = [
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
      key: "_id",
      render: (text: string, record, index) => {
        return (
          <Space>
            {index + 1}
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
          <>
            <div>
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
                onChange={(e) => {
                  const searchValue = { type: "active", value: "true" };
                  if (e === "active") {
                    searchValue.type = "active";
                    searchValue.value = "true";
                  }
                  if (e === "unActive") {
                    searchValue.type = "active";
                    searchValue.value = "false";
                  }
                  if (e === "isDeleted") {
                    searchValue.type = "isDeleted";
                    searchValue.value = "true";
                  }
                  searchItems(searchValue);
                }}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={[
                  {
                    value: "false",
                    label: "Active",
                  },

                  {
                    value: "true",
                    label: "Deleted",
                  },
                ]}
              />
            </div>
          </>
        );
      },
      width: 140,
      responsive: ["xl"],
    },
    //IMAGE
    {
      width: "10%",
      title: "Picture",
      key: "imageUrl",
      dataIndex: "imageUrl",
      render: (text: string, record) => {
        return (
          <div className="w-[100px] h-[100px]">
            {record.imageUrl && (
              <SmartImage
                src={`${API_URL}${record.imageUrl}`}
                smallSizes={imageUrlSizes}
                // style={{ height: 60 }}
                alt="record.imageUrl"
              />
            )}
          </div>
        );
      },
    },
    //Title
    {
      title: () => {
        return (
          <div>
            {searchParams.get("title") ? (
              <div className="text-danger">Title</div>
            ) : (
              <div className="secondary">Title</div>
            )}
          </div>
        );
      },
      dataIndex: "title",
      key: "title",
      filterDropdown: () => {
        return (
          <div style={{ padding: 8 }}>
            <Search
              allowClear
              onSearch={(e) => {
                const valueSearch = { type: "title", value: e };
                searchItems(valueSearch);
              }}
              placeholder="input search text"
              style={{ width: 200 }}
            />
          </div>
        );
      },
    },
    //Summary
    {
      title: () => {
        return (
          <div>
            {searchParams.get("summary") ? (
              <div className="text-danger">Summary</div>
            ) : (
              <div className="secondary">Summary</div>
            )}
          </div>
        );
      },
      dataIndex: "summary",
      key: "summary",
      filterDropdown: () => {
        return (
          <div style={{ padding: 8 }}>
            <Search
              allowClear
              placeholder="input search text"
              onSearch={(e) => {
                const valueSearch = { type: "summary", value: e };
                searchItems(valueSearch);
              }}
              style={{ width: 200 }}
            />
          </div>
        );
      },
    },

    //Note
    { title: "Note", dataIndex: "note", key: "note", width: "10%" },
  ];
  const dataSource = featuresData?.results || [];

  return (
    <CRUD<Feature>
      {...{
        columns,
        dataSource,
        totalAmount: featuresData?.amountResults || 0,
        searchParams,
        setSearchParams,
        collectionName: "features",
        // FormFn,
        form: {
          controls: formFields,
          title: "Tính năng",
        },
        loading: isLoading,
        fetchError: error,
        fileFields: [
          {
            name: "imageUrl",
            label: "Ảnh",
            fileType: "image",
            maxCount: 1,
            sizes: imageUrlSizes,
          },
        ],
      }}
    />
  );
}

// function FormFn(props: Omit<FormProps, "formControls" | "submitFn" | "title">) {
//   return (
//     <ModalFormOfCollection
//       {...props}
//       formControls={[]}
//       collectionName="features"
//       title="feature"
//     />
//   );
// }

export default FeaturesCRUD;
