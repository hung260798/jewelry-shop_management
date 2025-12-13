import CRUD from "@/templates/CRUD";
// import { LazyFadeImage } from "@repo/components/src/images";
import { UploadInput } from "@/components/Inputs/FileUpload";
import { UploadOutlined } from "@ant-design/icons";
import { Active, User, WithId } from "@repo/utils/types";
import { Button, DatePicker, Input, Select, Switch, Tag } from "antd";
import locale from "antd/es/date-picker/locale/vi_VN";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import LazyFadeImage from "components/images/Lazy/SmartImage";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useGetList } from "hooks/useMyQuery";
import { API_URL } from "utils/constants/URLS";

const { RangePicker } = DatePicker;
const dateFormat = "DD/MM/YYYY";
dayjs.extend(customParseFormat);

type Data = WithId<User> & Active & { Locked: boolean };

export default function EmployeeCRUD() {
  const {
    query: { data: employeesResponse, isLoading, error, isFetching },
    searchParams,
    setSearchParams,
    searchItems,
  } = useGetList<Data>({
    url: "/employees",
    queryKey: ["get_employees"],
    placeholderData: { results: [], amountResults: 0 },
  });

  //Setting column
  const renderTitle = (paramKey: string, label: string) => (
    <div className={searchParams.get(paramKey) ? "text-danger" : "secondary"}>
      {label}
    </div>
  );

  const columns: ColumnsType<Data> = [
    //NO
    {
      title: () => {
        return (
          <div
            className={searchParams.get("Locked") ? "text-danger" : "secondary"}
          >
            No
          </div>
        );
      },
      dataIndex: "id",
      key: "id",
      render: (text: string, record, index: number) => index + 1,
      responsive: ["xl"],
    },
    {
      title: "Trạng thái",
      // dataIndex: "id",
      key: "state_combine",
      render: (text: string, record) => {
        const { Locked, isDeleted } = record;
        let tagColor: string = "green",
          txt: string = "ACTIVE";
        if (Locked) {
          tagColor = "gold";
          txt = "LOCKED";
        }
        if (isDeleted) {
          tagColor = "red";
          txt = "DELETED";
        }
        return <Tag color={tagColor}>{txt}</Tag>;
      },
      filterDropdown: () => {
        return (
          <Select
            allowClear
            style={{ width: "125px" }}
            placeholder="Select a supplier"
            optionFilterProp="children"
            showSearch
            onChange={(e) => {
              searchItems({ type: "Locked", value: e }, { resetSkip: true });
            }}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={[
              {
                value: "false",
                label: "Active",
              },

              {
                value: "true",
                label: "Locked",
              },
            ]}
          />
        );
      },
      width: 60,
      responsive: ["xl"],
    },
    //IMAGE
    {
      width: "10%",
      title: "Ảnh hồ sơ",
      key: "imageUrl",
      dataIndex: "imageUrl",
      render: (text: string, record) => {
        return (
          <div className="flex flex-1 justify-center items-center h-[160px] w-[110px]">
            {record.imageUrl && (
              <LazyFadeImage
                src={`${API_URL}${record.imageUrl}`}
                // fallbackSources={[`${API_URL}${record.imageUrl}`]}
                smallSizes={[[80, 120]]}
                // style={{ height: 60 }}
                // preview={{
                //   destroyOnHidden: true,
                //   src: `${API_URL}${record.imageUrl}`,
                // }}
                alt="record.imageUrl"
              />
            )}
          </div>
        );
      },
    },
    //First Name
    {
      title: () => renderTitle("firstName", "Tên nhân viên"),
      dataIndex: "firstName",
      key: "firstName",
      filterDropdown: () => {
        return (
          <div style={{ padding: 8 }}>
            <Search
              allowClear
              placeholder="Enter first name"
              onSearch={(e) => {
                const searchValue = { type: "firstName", value: e };
                searchItems(searchValue, { resetSkip: true });
              }}
              style={{ width: 200 }}
            />
          </div>
        );
      },
      sorter: true,
    },
    //Last Name
    {
      title: () => renderTitle("lastName", "Họ đệm"),
      dataIndex: "lastName",
      key: "lastName",
      filterDropdown: () => {
        return (
          <div style={{ padding: 8 }}>
            <Search
              allowClear
              onSearch={(e) => {
                const searchValue = { type: "lastName", value: e };
                searchItems(searchValue, { resetSkip: true });
              }}
              placeholder="Enter last name"
              style={{ width: 200 }}
            />
          </div>
        );
      },
      sorter: true,
    },
    //Email
    {
      title: () => renderTitle("email", "Email"),
      dataIndex: "email",
      key: "email",
      filterDropdown: () => {
        return (
          <div style={{ padding: 8 }}>
            <Search
              allowClear
              onSearch={(e) => {
                const searchValue = { type: "email", value: e };
                searchItems(searchValue, { resetSkip: true });
              }}
              placeholder="Enter email"
              style={{ width: 200 }}
            />
          </div>
        );
      },
      sorter: true,
    },
    //Phone number
    {
      title: () => renderTitle("phoneNumber", "Số điện thoại"),
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      filterDropdown: () => {
        return (
          <div style={{ padding: 8 }}>
            <Search
              onSearch={(e) => {
                const searchValue = { type: "phoneNumber", value: e };
                searchItems(searchValue, { resetSkip: true });
              }}
              allowClear
              placeholder="Nhập số điện thoại"
              style={{ width: 200 }}
            />
          </div>
        );
      },
      sorter: true,
    },
    //Address
    {
      title: () => renderTitle("address", "Địa chỉ"),
      dataIndex: "address",
      key: "address",
      filterDropdown: () => {
        return (
          <div style={{ padding: 8 }}>
            <Search
              allowClear
              onSearch={(e) => {
                const searchValue = { type: "address", value: e };
                searchItems(searchValue, { resetSkip: true });
              }}
              placeholder="Enter address"
              style={{ width: 200 }}
            />
          </div>
        );
      },
      sorter: true,
    },
    //Birthday
    {
      title: () => {
        return (
          <div>
            {searchParams.get("birthdayFrom") ||
            searchParams.get("birthdayTo") ? (
              <div className="text-danger">Ngày sinh</div>
            ) : (
              <div className="secondary">Ngày sinh</div>
            )}
          </div>
        );
      },
      dataIndex: "birthday",
      key: "birthday",
      render: (birthday: string) => {
        const formattedBirthday = dayjs(birthday).format("DD/MM/YYYY");
        return <span>{formattedBirthday}</span>;
      },
      filterDropdown: () => {
        const birthdayFrom: string | dayjs.Dayjs =
          searchParams.get("birthdayFrom") ?? "01/01/1900";
        const birthdayTo: string | dayjs.Dayjs =
          searchParams.get("birthdayTo") ?? "01/01/2023";

        return (
          <div style={{ padding: 8 }}>
            <RangePicker
              allowClear
              value={[
                dayjs(birthdayFrom, dateFormat),
                dayjs(birthdayTo, dateFormat),
              ]}
              format={dateFormat}
              onChange={async (e) => {
                const searchValues: { type: string; value?: string }[] = [
                  { type: "birthdayFrom", value: birthdayFrom },
                  { type: "birthdayTo", value: birthdayTo },
                ];
                const data = e?.map((date) => dayjs(date).format("YYYY/MM/DD"));
                if (data) {
                  searchValues[0] = { type: "birthdayFrom", value: data[0] };
                  searchValues[1] = { type: "birthdayTo", value: data[1] };
                }
                searchItems(searchValues, { resetSkip: true });
              }}
            />
          </div>
        );
      },
      sorter: true,
    },
    //Note
    { title: "Ghi chú", dataIndex: "note", key: "note", width: "10%" },
  ];
  const dataSource = employeesResponse?.results;

  const converRecordToFormValues = (record: Data) => {
    return {
      ...record,
      files: {
        imageUrl: { fileList: [] },
      },
    };
  };

  return (
    <CRUD
      columns={columns}
      dataSource={dataSource}
      totalAmount={employeesResponse?.amountResults || 0}
      searchParams={searchParams}
      setSearchParams={setSearchParams}
      collectionName={"employees"}
      loading={isLoading || isFetching}
      form={{
        controls: formControls,
        title: "Employee",
      }}
      fileFields={[
        {
          name: "imageUrl",
          fileType: "image",
          label: "Image",
          maxCount: 1,
          sizes: [[80, 120]],
        },
      ]}
      fetchError={error}
      convertToFormValues={converRecordToFormValues}
    />
  );
}

const formControls = [
  {
    label: "Id",
    name: "_id",
    className: "hidden ",
    component: <Input />,
  },
  {
    label: "Email",
    name: "email",
    rules: [{ required: true, message: "Please input Email!" }],
    component: <Input />,
    className: "order-2 basis-1/2",
  },
  {
    label: "Tên",
    name: "firstName",
    rules: [{ required: true, message: "Please input First name!" }],
    component: <Input />,
    className: "order-1 basis-1/2",
  },
  {
    label: "Họ đệm",
    name: "lastName",
    rules: [{ required: true, message: "Please input Last name!" }],
    component: <Input />,
    className: "order-1 basis-1/2",
  },
  {
    label: "Số điện thoại",
    name: "phoneNumber",
    rules: [{ required: true, message: "Please input Phone number!" }],
    component: <Input />,
    className: "order-2 basis-1/2",
  },
  {
    label: "Mật khẩu",
    name: "password",
    rules: {
      add: [{ required: true, message: "Please input Pass word!" }],
      update: [],
    },
    component: <Input.Password />,
    className: "order-3 basis-full",
  },
  {
    label: "Địa chỉ",
    name: "address",
    rules: [{ required: true, message: "Please input Address!" }],
    component: <Input />,
    className: "order-4 basis-1/2",
  },
  {
    label: "Bị khóa",
    name: "Locked",
    component: <Switch />,
    valuePropName: "checked",
    className: "order-5 basis-1/2",
  },
  {
    label: "Ghi chú",
    name: "note",
    component: <Input />,
    className: "order-6 basis-full",
  },
  {
    label: "Ngày sinh",
    name: "birthday",
    rules: [{ required: true, message: "Please input Birthday!" }],
    component: (
      <DatePicker
        size="middle"
        placement="bottomLeft"
        format="DD/MM/YYYY"
        locale={locale}
      />
    ),
    className: "order-4 basis-1/2",
    getValueProps: (value: string) => ({ value: value && dayjs(value) }),
    // normalize: (value: string) => {
    //   dayjs(10)
    //   return value && `${dayjs(value).valueOf()}`;
    // },
  },
  {
    label: "Ảnh hồ sơ",
    name: ["files", "imageUrl"],
    component: (
      <UploadInput maxCount={1}>
        <Button icon={<UploadOutlined />} />
      </UploadInput>
    ),
  },
];
