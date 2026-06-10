import CRUD from "@/components/CRUD";
import { appendDomain, getSortOrder } from "@/utils/stringUtils";
import { FormControl } from "@/utils/types/Form";
import { DatePicker, Input, Select, Space, Switch, Tag } from "antd";
import locale from "antd/es/date-picker/locale/en_US";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import SmartImage from "@/components/Images/Lazy/SmartImage";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useGetListQuery } from "hooks/useMyQuery";
import { ASSET_URL } from "utils/constants/URLS";
import { Active, Customer, WithId } from "utils/types/Entities";

const formItems: FormControl[] = [
  {
    label: "Id",
    name: "_id",
    className: "hidden",
    component: <Input disabled readOnly />,
    defaultValue: "",
  },
  {
    label: "Email",
    name: "email",
    rules: [{ required: true, message: "Please input Email!" }],
    component: <Input />,
    defaultValue: "",
  },
  {
    label: "Tên",
    name: "firstName",
    rules: [{ required: true, message: "Please input First name!" }],
    component: <Input />,
    defaultValue: "",
  },
  {
    label: "Họ",
    name: "lastName",
    rules: [{ required: true, message: "Please input Last name!" }],
    component: <Input />,
    defaultValue: "",
  },
  {
    label: "Số điện thoại",
    name: "phoneNumber",
    rules: [{ required: true, message: "Please input Phone number!" }],
    component: <Input />,
    defaultValue: "",
  },
  // {
  //   label: "Mật khẩu",
  //   name: "password",
  //   rules: {
  //     add: [
  //       {
  //         required: true,
  //         message: "Please input password!",
  //       },
  //     ],
  //     update: [],
  //   },
  //   component: <Input.Password />,
  //   defaultValue: "",
  // },
  {
    label: "Địa chỉ",
    name: "address",
    rules: [{ required: true, message: "Please input Address!" }],
    component: <Input />,
    defaultValue: "",
  },
  {
    label: "Bị khóa",
    name: "Locked",
    component: <Switch />,
    valuePropName: "checked",
    defaultValue: false,
  },
  {
    label: "Ghi chú",
    name: "note",
    component: <Input />,
    defaultValue: "",
  },
  {
    label: "Ngày sinh",
    name: "birthday",
    rules: [{ required: true, message: "Please input Birthday!" }],
    component: (
      <DatePicker
        size="middle"
        placement="bottomLeft"
        format="YYYY-MM-DD"
        locale={locale}
      />
    ),
    getValueProps: (value) => {
      return {
        value: value ? dayjs(value, { format: "YYYY-MM-DD" }) : undefined,
      };
    },
    // getValueFromEvent: (date) => {
    //   console.log("get from event")
    //   return date ? date.format("YYYY-MM-DD") : null;
    // },
    // onSubmit: (date) => {
    //   return date ? dayjs(date).format("YYYY-MM-DD") : null;
    // },
    normalize: (date) => {
      return date ? dayjs(date).format("YYYY-MM-DD") : null;
    },
    defaultValue: dayjs(Date(), { format: "YYYY-MM-DD" }),
  },
];

const { RangePicker } = DatePicker;
dayjs.extend(customParseFormat);
const dateFormat = "DD/MM/YYYY";

type CustomerWithId = WithId<Customer> & Active & { Locked: boolean };

export default function CustomerCRUD() {
  const queryProps = {
    url: "/customers",
    queryKey: ["get_customers"],
    // initData: { results: [], amountResults: 0 },
  };
  // const queryHook = useMyQuery<GetManyData<CustomerWithId>>;
  // const queryHook = useGetList<CustomerWithId>;
  const queryResult = useGetListQuery<CustomerWithId>(queryProps);

  const { searchItems, searchParams } = queryResult;

  const renderTitle = (paramKey: string, label: string) => (
    <div className={searchParams.get(paramKey) ? "text-danger" : "secondary"}>
      {label}
    </div>
  );

  //Setting column
  const columns: ColumnsType<CustomerWithId> = [
    //NO
    {
      title: () => {
        return (
          <div>
            {searchParams.get("Locked") ? (
              <div className="text-danger">No</div>
            ) : (
              <div className="secondary">No</div>
            )}
          </div>
        );
      },
      dataIndex: "id",
      key: "id",
      render: (text: string, record, index: number) => {
        return (
          <div>
            <Space>
              {index + 1}
              {!record.Locked && (
                <span style={{ fontSize: "16px", color: "#08c" }}>
                  {/* <CheckCircleOutlined /> Active */}
                  <Tag color="green">ACTIVE</Tag>
                </span>
              )}
              {record.Locked === true && (
                <span style={{ fontSize: "16px", color: "#dc3545" }}>
                  {/* <CheckCircleOutlined /> Locked */}
                  <Tag color="gold">LOCKED</Tag>
                </span>
              )}
            </Space>
          </div>
        );
      },
      filterDropdown: () => {
        return (
          <>
            <div>
              <Select
                allowClear
                style={{ width: "125px" }}
                placeholder="Select a supplier"
                optionFilterProp="children"
                showSearch
                onChange={(e) => {
                  const searchValue = { type: "Locked", value: e };
                  searchItems(searchValue, { resetSkip: true });
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
                    label: "Locked",
                  },
                ]}
              />
            </div>
          </>
        );
      },
      width: 60,
      responsive: ["xl", "xxl"],
    },
    //IMAGE
    {
      width: 90,
      title: "Ảnh đại diện",
      key: "imageUrl",
      dataIndex: "imageUrl",
      render: (text, record) => {
        return (
          <div className="flex justify-center items-center  w-27.5">
            {record.imageUrl && (
              <SmartImage
                src={appendDomain(record.imageUrl, ASSET_URL)}
                smallSizes={[[100, 150]]}
                alt="record.imageUrl"
                fallback="/placeholder-user.jpg"
                width={100}
                height={100}
                style={{ width: "100px", height: "100px" }}
              />
            )}
          </div>
        );
      },
      responsive: ["md"],
    },
    //Email
    {
      title: () => renderTitle("email", "Email"),
      dataIndex: "email",
      key: "email",
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "email"),
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
      width: 160,
      responsive: ["lg", "xl"],
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
              placeholder="Enter phone number"
              style={{ width: 200 }}
            />
          </div>
        );
      },
      responsive: ["lg"],
      width: 120,
    },
    //First Name
    {
      title: () => renderTitle("firstName", "Tên khách hàng"),
      dataIndex: "firstName",
      key: "firstName",
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "firstName"),
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
      width: 160,
    },
    //Last Name
    {
      title: () => renderTitle("lastName", "Họ đệm"),
      dataIndex: "lastName",
      key: "lastName",
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "lastName"),
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
      width: 160,
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
      render: (birthday) => {
        const formattedBirthday = dayjs(birthday).format("DD/MM/YYYY");
        return <span>{formattedBirthday}</span>;
      },
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "birthday"),
      filterDropdown: () => {
        return (
          <div style={{ padding: 8 }}>
            <RangePicker
              allowClear
              defaultValue={[
                dayjs("01/01/1900", dateFormat),
                dayjs("01/01/2023", dateFormat),
              ]}
              format={dateFormat}
              onChange={async (e) => {
                const searchValues: { type: string; value?: string }[] = [
                  { type: "birthdayFrom", value: undefined },
                  { type: "birthdayTo", value: undefined },
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
      responsive: ["lg"],
      width: 80,
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
      responsive: ["xl"],
      width: 180,
    },
    //Note
    // {
    //   title: "Ghi chú",
    //   dataIndex: "note",
    //   key: "note",
    //   width: 100,
    //   responsive: ["xl"],
    // },
    // Created date
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
          Ngày đăng ký
        </div>
      ),
      dataIndex: "createdDate",
      key: "createdDate",
      width: 100,
      responsive: ["xl"],
      render: (createdDate) => {
        const formattedDate = dayjs(createdDate).format("DD/MM/YYYY");
        return <span>{formattedDate}</span>;
      },
      filterDropdown: () => {
        return (
          <div style={{ padding: 8 }}>
            <RangePicker
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
                  searchValues[0] = { type: "createdDateFrom", value: data[0] };
                  searchValues[1] = { type: "createdDateTo", value: data[1] };
                }
                searchItems(searchValues, { resetSkip: true });
              }}
            />
          </div>
        );
      },
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "createdDate"),
    },
    // Số đơn hàng
    {
      title: () => renderTitle("orderCount", "Số đơn hàng"),
      dataIndex: "orderCount",
      key: "orderCount",
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "orderCount"),
      width: 100,
      responsive: ["xl"],
      render: (orderCount) => {
        return <span>{orderCount ?? 0}</span>;
      },
    },
  ];

  return (
    <CRUD
      columns={columns}
      collectionName="customers"
      form={{ controls: formItems, title: "Khách hàng" }}
      fileFields={[
        {
          name: "imageUrl",
          fileType: "image",
          label: "Image",
          maxCount: 1,
          sizes: [[100, 150]],
        },
      ]}
      query={queryResult}
    />
  );
}
