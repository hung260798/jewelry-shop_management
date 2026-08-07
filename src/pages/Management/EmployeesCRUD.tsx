import CRUD from "@/components/CRUD";
// import { LazyFadeImage } from "@repo/components/src/images";
import { useModalForm } from "@/components/Forms/ModalForm/useModalForm";
import useFileUploadBox, {
  IdAndNameWise,
} from "@/components/Modals/UploadBox/useFileUploadBox";
import { appendDomain, getSortOrder } from "@/utils/stringUtils";
import { FormControl } from "@/utils/types/Form";
import { UploadOutlined } from "@ant-design/icons";
import { Button, DatePicker, Input, Select, Switch, Tag } from "antd";
import locale from "antd/es/date-picker/locale/en_US";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import SmartImage from "@/components/Images/Lazy/SmartImage";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useGetListQuery } from "hooks/useMyQuery";
import { useSearchParams } from "react-router-dom";
import { ASSET_URL } from "utils/constants/URLS";
import { Active, User, WithId } from "utils/types/Entities";

const { RangePicker } = DatePicker;
const dateFormat = "DD/MM/YYYY";
dayjs.extend(customParseFormat);

type Data = WithId<User> & Active & { Locked: boolean };

const imageSizes: [number, number][] = [[80, 120]];

export default function EmployeeCRUD() {
  const queryResult = useGetListQuery<Data>({
    url: "/employees",
    queryKey: ["employees"],
  });

  const { searchParams, searchItems } = queryResult;

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
              searchItems([
                { type: "Locked", value: e },
                { type: "skip", value: "0" },
              ]);
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
      width: 110,
      title: "Ảnh hồ sơ",
      key: "imageUrl",
      dataIndex: "imageUrl",
      render: (text: string, record) => {
        return (
          <div className="flex flex-1 justify-center items-center">
            {record.imageUrl && (
              <SmartImage
                src={appendDomain(record.imageUrl, ASSET_URL)}
                smallSizes={imageSizes}
                alt="record.imageUrl"
                fallback="/placeholder-user.jpg"
                width={100}
                height={100}
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
          <div className="p-2">
            <Search
              allowClear
              placeholder="Enter first name"
              onSearch={(e) => {
                const searchValue = { type: "firstName", value: e };
                searchItems([searchValue, { type: "skip", value: "0" }]);
              }}
              style={{ width: 200 }}
            />
          </div>
        );
      },
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "firstName"),
    },
    //Last Name
    {
      title: () => renderTitle("lastName", "Họ đệm"),
      dataIndex: "lastName",
      key: "lastName",
      filterDropdown: () => {
        return (
          <div className="p-2">
            <Search
              allowClear
              onSearch={(e) => {
                const searchValue = { type: "lastName", value: e };
                searchItems([searchValue, { type: "skip", value: "0" }]);
              }}
              placeholder="Enter last name"
              style={{ width: 200 }}
            />
          </div>
        );
      },
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "lastName"),
    },
    //Email
    {
      title: () => renderTitle("email", "Email"),
      dataIndex: "email",
      key: "email",
      filterDropdown: () => {
        return (
          <div className="p-2">
            <Search
              allowClear
              onSearch={(e) => {
                const searchValue = { type: "email", value: e };
                searchItems([searchValue, { type: "skip", value: "0" }]);
              }}
              placeholder="Enter email"
              style={{ width: 200 }}
            />
          </div>
        );
      },
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "email"),
    },
    //Phone number
    {
      title: () => renderTitle("phoneNumber", "Số điện thoại"),
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      filterDropdown: () => {
        return (
          <div className="p-2">
            <Search
              onSearch={(e) => {
                const searchValue = { type: "phoneNumber", value: e };
                searchItems([searchValue, { type: "skip", value: "0" }]);
              }}
              allowClear
              placeholder="Nhập số điện thoại"
              style={{ width: 200 }}
            />
          </div>
        );
      },
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "phoneNumber"),
    },
    //Address
    {
      title: () => renderTitle("address", "Địa chỉ"),
      dataIndex: "address",
      key: "address",
      filterDropdown: () => {
        return (
          <div className="p-2">
            <Search
              allowClear
              onSearch={(e) => {
                const searchValue = { type: "address", value: e };
                searchItems([searchValue, { type: "skip", value: "0" }]);
              }}
              placeholder="Enter address"
              style={{ width: 200 }}
            />
          </div>
        );
      },
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "address"),
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
        const formattedBirthday = dayjs(birthday).format(dateFormat);
        return <span>{formattedBirthday}</span>;
      },
      filterDropdown: () => {
        const birthdayFrom: string | dayjs.Dayjs = dayjs(
          searchParams.get("birthdayFrom") ?? "01/01/1900"
        );
        const birthdayTo: string | dayjs.Dayjs = dayjs(
          searchParams.get("birthdayTo") ?? "01/01/2023"
        );

        return (
          <div className="p-2">
            <RangePicker
              allowClear
              value={[
                dayjs(birthdayFrom, dateFormat),
                dayjs(birthdayTo, dateFormat),
              ]}
              format={dateFormat}
              onChange={async (e) => {
                const data = e?.map((date) => dayjs(date).format("YYYY/MM/DD"));
                if (data) {
                  searchItems([
                    { type: "birthdayFrom", value: data[0] },
                    { type: "birthdayTo", value: data[1] },
                    { type: "skip", value: "0" },
                  ]);
                }
              }}
            />
          </div>
        );
      },
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "birthday"),
    },
    //Note
    { title: "Ghi chú", dataIndex: "note", key: "note", width: "10%" },
    // Created date
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "createdDate"),
      render(date: string | undefined) {
        if (!date) return "";
        const d: Date = new Date(date);
        return (
          <>
            <span>{d.toLocaleDateString()}</span>
            <br />
            <span>{d.toLocaleTimeString()}</span>
          </>
        );
      },
    },
  ];

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
      // dataSource={dataSource}
      // totalAmount={amountResults}
      // searchParams={searchParams}
      // setSearchParams={setSearchParams}
      collectionName={"employees"}
      // loading={isLoading || isFetching}
      form={{
        controls: formControls,
        title: "Nhân viên",
      }}
      fileFields={[
        {
          name: "imageUrl",
          fileType: "image",
          label: "Image",
          maxCount: 1,
          sizes: imageSizes,
        },
      ]}
      // fetchError={error}
      createFormValues={converRecordToFormValues}
      uploadModalTitle={(employee) =>
        `${employee?.firstName} ${employee?.lastName}`
      }
      query={queryResult}
    />
  );
}

const formControls: FormControl[] = [
  {
    label: "Id",
    name: "_id",
    className: "hidden ",
    component: <Input />,
    defaultValue: "",
  },
  {
    label: "Email",
    name: "email",
    rules: [{ required: true, message: "Please input Email!" }],
    component: <Input placeholder="JohnDoe@gmail.com" />,
    className: "order-2 basis-1/2",
    defaultValue: "",
  },
  {
    label: "Tên",
    name: "firstName",
    rules: [{ required: true, message: "Phải nhập tên!" }],
    component: <Input placeholder="Hoàng" />,
    className: "order-1 basis-1/2",
    defaultValue: "",
  },
  {
    label: "Họ đệm",
    name: "lastName",
    rules: [{ required: true, message: "Phải nhập họ!" }],
    component: <Input placeholder="Nguyễn Văn" />,
    className: "order-1 basis-1/2",
    defaultValue: "",
  },
  {
    label: "Số điện thoại",
    name: "phoneNumber",
    rules: [{ required: true, message: "Phải có số điện thoại!" }],
    component: <Input autoComplete="none" />,
    className: "order-2 basis-1/2",
    defaultValue: "",
  },
  {
    label: "Mật khẩu",
    name: "password",
    rules: {
      add: [{ required: true, message: "Phải có mật khẩu!" }],
      update: [],
    },
    component: (
      <Input.Password
        readOnly
        onFocus={(e) => e.target.removeAttribute("readonly")}
        onBlur={(e) => e.target.setAttribute("readonly", "true")}
        autoComplete="off"
      />
    ),
    defaultValue: "",
    className: "order-3 basis-full",
  },
  {
    label: "Địa chỉ",
    name: "address",
    rules: [{ required: true, message: "Please input Address!" }],
    component: <Input />,
    className: "order-4 basis-1/2",
    defaultValue: "",
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
    className: "order-4 basis-1/2",
    getValueProps: (value: string | undefined) => {
      try {
        return {
          value: value ? dayjs(value, { format: "YYYY-MM-DD" }) : undefined,
        };
      } catch {
        return { value: dayjs().format("YYYY-MM-DD") };
      }
    },
    normalize: (value: string | undefined) => {
      try {
        return value ? dayjs(value).format("YYYY-MM-DD") : undefined;
      } catch {
        return dayjs().format("YYYY-MM-DD");
      }
    },
    defaultValue: dayjs(Date(), { format: "YYYY-MM-DD" }),
  },
  // {
  //   label: "Ảnh hồ sơ",
  //   name: ["files", "imageUrl"],
  //   component: (
  //     <UploadInput maxCount={1}>
  //       <Button icon={<UploadOutlined />} />
  //     </UploadInput>
  //   ),
  // },
  {
    label: "Ảnh hồ sơ",
    component: function ImageButton() {
      const setUploadBoxContent = useFileUploadBox((s) => s.setBoxContent);
      const setUploaderQueryKey = useFileUploadBox((s) => s.setQueryKey);
      const setOpenUploadBox = useFileUploadBox((s) => s.setOpen);
      const record = useModalForm((s) => s.formValues as Data);
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
            // const qk: string[][] = [];
            // for (const pair of searchParams?.entries() ?? []) {
            //   qk.push(pair);
            // }
            setUploaderQueryKey?.([
              Object.fromEntries(searchParams?.entries() ?? []),
            ]);
            setOpenUploadBox(true);
          }}
        />
      );
    },
  },
];
