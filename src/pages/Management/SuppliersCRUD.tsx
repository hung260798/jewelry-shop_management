import { extractArrayFromGetOneOrMany, useGetList } from "@/hooks/useMyQuery";
import CRUD from "@/templates/CRUD";
import * as Types from "utils/types/Entities";
import { Checkbox, Input, Select, Tag } from "antd";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import { getSortOrder } from "@/utils/stringUtils";

export const formItems = [
  {
    label: "Id",
    name: "_id",
    className: "hidden",
    component: <Input />,
  },
  {
    label: "Tên nhà cung cấp",
    name: "name",
    rules: [{ required: true, message: "Please input Name!" }],
    component: <Input />,
    className: "basis-1/2",
  },
  {
    label: "Email",
    name: "email",
    rules: [{ required: true, message: "Please input Email!" }],
    component: <Input />,
    className: "basis-1/2",
  },
  {
    label: "Số điện thoại",
    name: "phoneNumber",
    component: <Input />,
    className: "basis-1/2",
  },
  {
    label: "Địa chỉ",
    name: "address",
    rules: [{ required: true, message: "Please input Address!" }],
    component: <Input />,
    className: "basis-1/2",
  },
  {
    label: "Đang hoạt động",
    name: "active",
    component: <Checkbox />,
    valuePropName: "checked",
    className: "basis-1/2",
  },
  {
    label: "Đã xóa",
    name: "isDeleted",
    component: <Checkbox />,
    valuePropName: "checked",
    className: "basis-1/2",
  },
  {
    label: "Ghi chú",
    name: "note",
    component: <Input />,
    className: "basis-full",
  },
];

type Supplier = Types.WithId<Types.Supplier> & Types.Active;

function SupplierCRUD() {
  const {
    query: { data: suppliersData, refetch, error, isLoading },
    searchParams,
    setSearchParams,
    searchItems,
  } = useGetList<Supplier>({
    queryKey: ["get_suppliers"],
    url: "/suppliers",
    // placeholderData: { results: [], amountResults: 0 },
  });

  //Setting column
  const columns: ColumnsType<Supplier> = [
    //No
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
      dataIndex: "id",
      key: "id",
      render: (text: string, record, index: number) => {
        const { active, isDeleted } = record;
        let tagColor: string = "green",
          txt: string = "ACTIVE";
        if (active === false) {
          tagColor = "gold";
          txt = "LOCKED";
        }
        if (isDeleted) {
          tagColor = "red";
          txt = "DELETED";
        }
        return (
          <>
            {index + 1} <Tag color={tagColor}>{txt}</Tag>
          </>
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
                  const searchValue: { type: string; value: string } = {
                    type: "active",
                    value: "true",
                  };
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
                  console.log(`🚀🚀🚀!..e`, e);
                  searchItems(searchValue, { resetSkip: true });
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
                    value: "Deleted",
                    label: "Deleted",
                  },
                ]}
              />
            </div>
          </>
        );
      },
      width: "10%",
      responsive: ["xl"],
    },
    //Name
    {
      title: () => {
        return (
          <div
            className={searchParams.get("name") ? "text-danger" : "secondary"}>
            Tên nhà cung cấp
          </div>
        );
      },
      dataIndex: "name",
      key: "name",
      filterDropdown: () => {
        return (
          <Input.Search
            step="string"
            allowClear
            placeholder="Nhập tên"
            onSearch={(e) => {
              const valueSearch = { type: "name", value: e };
              searchItems(valueSearch, { resetSkip: true });
            }}
          />
          // <Select<string, { label: string; value: string }>
          //   allowClear
          //   style={{ width: "125px" }}
          //   placeholder="Chọn tên nhà cung cấp"
          //   optionFilterProp="children"
          //   onSearch={(e) => {
          //     const valueSearch = { type: "name", value: e };
          //     searchItems(valueSearch, { resetSkip: true });
          //   }}
          //   showSearch
          //   filterOption={(input, option) =>
          //     (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          //   }
          //   options={suppliersData?.results?.map((item) => {
          //     return {
          //       label: `${item.name}`,
          //       value: item.name,
          //     };
          //   })}
          // />
        );
      },
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "name"),
    },
    // Logo
    {
      title: "Logo",
      width: "130px",
      dataIndex: "logo",
      key: "logo",
    },
    //Email
    {
      title: () => {
        return (
          <div>
            {searchParams.get("email") ? (
              <div className="text-danger">Email</div>
            ) : (
              <div className="secondary">Email</div>
            )}
          </div>
        );
      },
      dataIndex: "email",
      key: "email",
      filterDropdown: () => {
        return (
          <div style={{ padding: 8 }}>
            <Search
              allowClear
              placeholder="Nhập email nhà cung cấp"
              onSearch={(e) => {
                const valueSearch = { type: "email", value: e };
                searchItems(valueSearch, { resetSkip: true });
              }}
              style={{ width: 200 }}
            />
          </div>
        );
      },
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "email"),
    },
    //Phone Number
    {
      title: () => (
        <div
          className={
            searchParams.get("phoneNumber") ? "text-danger" : "secondary"
          }>
          Điện thoại
        </div>
      ),
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      filterDropdown: () => {
        return (
          <div style={{ padding: 8 }}>
            <Input.Search
              step="string"
              allowClear
              placeholder="Nhập số điện thoại"
              onSearch={(e) => {
                const valueSearch = { type: "phoneNumber", value: e };
                searchItems(valueSearch, { resetSkip: true });
              }}
            />
          </div>
        );
      },
    },
    //Address
    {
      title: () => {
        return (
          <div
            className={
              searchParams.get("address") ? "text-danger" : "secondary"
            }>
            Địa chỉ nhà cung cấp
          </div>
        );
      },
      dataIndex: "address",
      key: "address",
      filterDropdown: () => {
        return (
          <div style={{ padding: 8 }}>
            <Search
              allowClear
              placeholder="Nhập địa chỉ"
              onSearch={(e) => {
                const valueSearch = { type: "address", value: e };
                searchItems(valueSearch, { resetSkip: true });
              }}
              style={{ width: 200 }}
            />
          </div>
        );
      },
      sorter: true,
      sortOrder: getSortOrder(searchParams.toString(), "address"),
    },
    //Note
    { title: "Ghi chú", dataIndex: "note", key: "note", width: "10%" },
  ];
  const { dataSource, amountResults } =
    extractArrayFromGetOneOrMany(suppliersData);

  return (
    <CRUD<Supplier>
      columns={columns}
      dataSource={dataSource}
      totalAmount={amountResults}
      // FormFn={SuppplierForm}
      collectionName="suppliers"
      searchParams={searchParams}
      setSearchParams={setSearchParams}
      form={{
        controls: formItems,
        title: "Supplier",
      }}
      fetchError={error}
      loading={isLoading}
    />
  );
}

// function SuppplierForm(
//   props: Omit<FormProps, "submitFn" | "formControls" | "title">
// ) {
//   return (
//     <ModalFormOfCollection
//       {...props}
//       collectionName="suppliers"
//       title="Supplier"
//       formControls={[]}
//     />
//   );
// }

export default SupplierCRUD;
