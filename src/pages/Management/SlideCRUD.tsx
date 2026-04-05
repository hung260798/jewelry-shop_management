import useMyQuery from "@/hooks/useMyQuery";
import CRUD from "@/templates/CRUD";
import { Slide } from "@/utils/types/Entities";
// import { LazyFadeImage } from "@repo/components/src/images";
import SmartImage from "@/components/images/Lazy/SmartImage";
import { appendDomain } from "@/utils/stringUtils";
import { Input, InputNumber, Select, Space, Switch, Tag } from "antd";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import { ASSET_URL } from "utils/constants/URLS";
import { Active, GetMany, WithId } from "utils/types/Entities";

type Slide2 = WithId<Slide> & Active;

export const formFields = [
  {
    label: "Id",
    name: "_id",
    component: <Input />,
    className: "hidden",
    defaultValue: "",
  },
  {
    label: "Tiêu đề",
    name: "title",
    rules: [{ required: true, message: "Please input Title!" }],
    component: <Input />,
    defaultValue: "",
  },
  {
    label: "Tóm tắt",
    name: "summary",
    rules: [{ required: true, message: "Please input Summary!" }],
    component: <Input />,
    defaultValue: "",
  },
  {
    label: "Đường dẫn đến trang",
    name: "url",
    rules: [{ required: true, message: "Please input URL!" }],
    component: <Input />,
    defaultValue: "",
  },
  {
    label: "Ảnh",
    name: "imageUrl",
    rules: [{ required: true, message: "Please input Image Url!" }],
    component: <Input />,
    defaultValue: "",
  },
  {
    label: "Vị trí hiển thị",
    name: "sortOrder",
    rules: [{ required: true, message: "Please input Sort Order!" }],
    component: <InputNumber />,
    defaultValue: "",
  },
  {
    label: "Đang hoạt động",
    name: "active",
    component: <Switch />,
    defaultValue: true,
  },
  {
    label: "Ghi chú",
    name: "note",
    component: <Input />,
    defaultValue: "",
  },
];

function SlidesCRUD() {
  const {
    query: { data: slidesData, refetch, isLoading, error },
    searchParams,
    setSearchParams,
    searchItems,
  } = useMyQuery<GetMany<Slide2>>({
    queryKey: ["get_slides"],
    url: "/slides",
    placeholderData: { results: [], amountResults: 0 },
  });

  //Setting column
  const columns: ColumnsType<Slide2> = [
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
                  const searchValue = { type: "", value: "" };
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
                  searchItems(searchValue, { resetSkip: true });
                }}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={[
                  {
                    value: "true",
                    label: "Active",
                  },

                  {
                    value: "false",
                    label: "Deleted",
                  },
                ]}
              />
            </div>
          </>
        );
      },
      width: "80px",
    },
    //IMAGE
    {
      width: "350px",
      title: "Ảnh",
      key: "imageUrl",
      dataIndex: "imageUrl",
      render: (imageUrl) => {
        if (typeof imageUrl !== "string") return null;
        const url = new URL(appendDomain(imageUrl, ASSET_URL));
        const filename = url.pathname.split("/").pop() || "";
        const imgNameNoExt = filename.split(".")[0];
        const newImgNameNoExt = imgNameNoExt ? `${imgNameNoExt}_300x100` : "";
        const newImgUrl = imageUrl.replace(imgNameNoExt, newImgNameNoExt);
        return (
          <div>
            {imageUrl && (
              <SmartImage
                src={appendDomain(newImgUrl, ASSET_URL)}
                style={{ height: 100 }}
                // smallSizes={[]}
                // alt={imageUrl}
                preview={{
                  destroyOnHidden: true,
                  src: appendDomain(imageUrl, ASSET_URL),
                }}
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
              <div className="text-danger">Tiêu đề</div>
            ) : (
              <div className="secondary">Tiêu đề</div>
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
                searchItems(valueSearch, { resetSkip: true });
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
              <div className="text-danger">Tóm tắt</div>
            ) : (
              <div className="secondary">Tóm tắt</div>
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
                searchItems(valueSearch, { resetSkip: true });
              }}
              style={{ width: 200 }}
            />
          </div>
        );
      },
    },
    //URL
    { title: "URL", dataIndex: "url", key: "url", width: "10%" },
    //Note
    { title: "Lưu ý", dataIndex: "note", key: "note", width: "10%" },
  ];

  const dataSource = slidesData?.results;

  return (
    <CRUD<WithId<Slide & Active>>
      columns={columns}
      dataSource={dataSource}
      totalAmount={slidesData?.amountResults || 0}
      searchParams={searchParams}
      setSearchParams={setSearchParams}
      collectionName="slides"
      form={{
        controls: formFields,
        title: "Slide",
      }}
      fileFields={[
        {
          name: "imageUrl",
          fileType: "image",
          label: "Image",
          maxCount: 1,
          sizes: [[300, 100]],
        },
      ]}
      loading={isLoading}
      fetchError={error}
    />
  );
}

export default SlidesCRUD;
