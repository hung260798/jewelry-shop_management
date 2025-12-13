import { useModalForm } from "@/components/Forms/ModalForm";
import { useAuthStore } from "@/hooks/useAuthStore";
import { axiosClientJson } from "@/libraries/axiosClient";
import CRUD from "@/templates/CRUD";
import { GetManyData } from "@/utils/mutationFn";
import { EditOutlined, SendOutlined } from "@ant-design/icons";
import { Order, OrderLine, WithId } from "@repo/utils/types";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import Search from "antd/es/input/Search";
import { ColumnsType } from "antd/es/table";
import ProductDrawer from "components/drawers/ProductDrawer";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import useMyQuery from "hooks/useMyQuery";
import _ from "lodash";
import numeral from "numeral";
import { useState } from "react";
// import { FormProps } from "utils/types/Form";
dayjs.extend(customParseFormat);

function OrderCRUD() {
  const {
    searchParams,
    setSearchParams,
    searchItems,
    query: { data: ordersData, isFetching, refetch, isLoading, error },
  } = useMyQuery<GetManyData<WithId<Order>>>({
    url: "/orders",
    queryKey: ["get_orders"],
    initParams: { active: "true" },
    placeholderData: { results: [], amountResults: 0 },
  });
  const [selectedOrder, setSelectedOrder] = useState<WithId<Order>>();
  const [isAddingProducts, setIsAddingProducts] = useState<boolean>(false);

  //Setting column
  const columns: ColumnsType<WithId<Order>> = [
    {
      title: "Mã",
      dataIndex: "_id",
      key: "_id",
      render: (text, record, index) => {
        return <strong title={record._id}>{index}</strong>;
      },
      filterDropdown: () => {
        return (
          <div style={{ padding: 8 }}>
            <Input.Search
              allowClear
              placeholder="Enter Order Id"
              onSearch={(e) => {
                const searchValue = { type: "orderId", value: e };
                searchItems(searchValue);
              }}
              style={{ width: 200 }}
            />
          </div>
        );
      },
    },
    {
      title: "Ngày đặt hàng",
      dataIndex: "createdDate",
      render(date: string) {
        const d: Date = new Date(date);
        return (
          <>
            <span>{d.toLocaleDateString()}</span>
            <br />
            <span>{d.toLocaleTimeString()}</span>
          </>
        );
      },
      sorter: true,
    },
    {
      title: "Ngày giao hàng",
      dataIndex: "shippedDate",
      render(date: string) {
        const d: Date = new Date(date);
        return (
          <>
            <span>{d.toLocaleDateString()}</span>
            <br />
            <span>{d.toLocaleTimeString()}</span>
          </>
        );
      },
      sorter: true,
    },
    {
      title: "Khách hàng",
      dataIndex: "customer.firstName",
      key: "customer",
      render: (text, record) => {
        return `${record.customer?.firstName ?? ""} ${
          record.customer?.lastName ?? ""
        }`;
      },
      filterDropdown: () => {
        return (
          <div style={{ width: "150px" }}>
            <Search
              allowClear
              style={{ width: "100%" }}
              placeholder="Select one"
              onSearch={(e) => {
                const searchValue = { type: "firstName", value: e };
                searchItems(searchValue);
              }}
            />
          </div>
        );
      },
      sorter: true,
    },
    {
      title: "Hình thức thanh toán",
      dataIndex: "paymentType",
      key: "paymentType",
      filterDropdown: () => {
        return (
          <Select
            allowClear
            showSearch
            style={{ width: "100%" }}
            placeholder="Select a product"
            optionFilterProp="children"
            onChange={(e) => {
              const searchValue = { type: "methodPay", value: e };
              searchItems(searchValue);
            }}
            filterOption={(input, option) =>
              (option?.label ?? "")
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0
            }
            options={[
              { label: "CASH", value: "CASH" },
              { label: "MOMO", value: "MOMO" },
              { label: "VNPAY", value: "VNPAY" },
            ]}
          />
        );
      },
      sorter: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      sorter: true,
      render: (text) => {
        const cn: Record<string, string> = {
          WAITING: "gold",
          ECONFIRMED: "blue",
          COMPLETED: "green",
          CANCELLED: "red",
        };
        return <Tag color={cn[text] ?? "blue"}>{text}</Tag>;
      },
      filterDropdown: () => {
        return (
          <div style={{ width: "150px" }}>
            <Select
              allowClear
              showSearch
              style={{ width: "100%" }}
              placeholder="Select a product"
              optionFilterProp="children"
              onChange={(e) => {
                const searchValue = { type: "status", value: e };
                searchItems(searchValue);
              }}
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .indexOf(input.toLowerCase()) >= 0
              }
              options={[
                { label: "WAITING", value: "WAITING" },
                { label: "ECONFIRMED", value: "ECONFIRMED" },
                { label: "COMPLETED", value: "COMPLETED" },
                { label: "CANCELED", value: "CANCELED" },
              ]}
            />
          </div>
        );
      },
    },
    {
      width: "20%",
      title: "Địa chỉ giao hàng",
      dataIndex: "shippingAddress",
      key: "shippingAddress",
      sorter: true,
    },

    {
      width: "10%",
      title: "Nhân viên",
      dataIndex: "employee",
      key: "employee",
      render: (text, record) => {
        return (
          <strong>
            {record.employee?.firstName} {record.employee?.lastName}
          </strong>
        );
      },
      sorter: true,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalMoney",
      key: "totalMoney",
      render: (text, record) => {
        const { orderDetails } = record;
        let total = 0;
        orderDetails?.forEach((od) => {
          const sum = od.quantity * od.product?.total;
          total = total + sum;
        });
        return (
          <strong>
            {total.toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </strong>
        );
      },
    },

    //Function
    // {
    //   title: "Function",
    //   dataIndex: "function",
    //   key: "function",
    //   render: (text, record) => {
    //     const id = record._id;
    //     return (
    //       <Space>
    //         <Button
    //           onClick={() => {
    //             setSelectedOrder(record);
    //             console.log("order:", record);
    //           }}
    //           shape="circle"
    //           icon={<SearchOutlined />}
    //         />
    //         <Popconfirm
    //           okText="Delete"
    //           okType="danger"
    //           onConfirm={() => cancelOrder(id)}
    //           title={"Bạn chắc chắn sẽ hủy đơn hàng?"}
    //         >
    //           <Button
    //             title="Cancel Order"
    //             danger
    //             icon={<RestOutlined />}
    //           ></Button>
    //         </Popconfirm>
    //         {record.status === "WAITING" && (
    //           <Popconfirm
    //             okText="Confirm"
    //             okType="danger"
    //             title={"Are you sure to Confirm it?"}
    //             onConfirm={() => confirmOrder(id)}
    //           >
    //             <Button
    //               title="Confirm Order"
    //               danger
    //               icon={<SendOutlined />}
    //             ></Button>
    //           </Popconfirm>
    //         )}
    //       </Space>
    //     );
    //   },
    //   fixed: "right",
    // },
  ];

  const formTitle = "orders";

  const setFormValues = useModalForm((s) => s.setFormValues);
  const setShowingForm = useModalForm((s) => s.setTitle);
  const crudJSX = (
    <CRUD
      collectionName="orders"
      columns={columns}
      searchParams={searchParams}
      setSearchParams={setSearchParams}
      dataSource={ordersData?.results || []}
      totalAmount={ordersData?.amountResults || 0}
      loading={isLoading || isFetching}
      // FormFn={OrderDetailModal}
      form={{
        customComponent: OrderDetailModal,
      }}
      functionColumn={{
        edit: (record) => {
          return (
            <Button
              icon={<EditOutlined />}
              title="Update"
              type="dashed"
              onClick={() => {
                setFormValues({
                  selectedOrder: record,
                  functions: { setAddProducts: setIsAddingProducts, refetch },
                });
                setShowingForm(formTitle);
                setSelectedOrder(record);
              }}
            />
          );
        },
      }}
      fetchError={error}
    />
  );

  // KEEP UPDATE ID:
  // useEffect(() => {
  //   // Check if the selected order exists in the updated dataResource
  //   const orders = ordersData?.results || [];
  //   const updatedSelectedOrder = orders.find(
  //     (order) => order._id === selectedOrder?._id
  //   );
  //   setSelectedOrder(updatedSelectedOrder);
  // }, [ordersData?.results]);
  // return null;
  return (
    <>
      {crudJSX}
      <ProductDrawer
        addProducts={isAddingProducts}
        setAddProducts={setIsAddingProducts}
        selectedOrder={selectedOrder}
        refetch={refetch}
      />
    </>
  );
}

export default OrderCRUD;

type OrderFormValues = {
  selectedOrder?: WithId<Order>;
  functions: {
    setAddProducts: (b: boolean) => void;
    refetch?: () => void;
  };
};

function OrderDetailModal() {
  // props: Omit<FormProps, "submitFn" | "title" | "formControls" | "formValues">
  const {
    title: showing,
    setTitle: setShowing,
    formValues,
  } = useModalForm((s) => s);
  const [statusDisabled, setStatusDisabled] = useState<boolean>(true);
  const [shippingAddressDisabled, setShippingAddressDisabled] =
    useState<boolean>(true);
  const { selectedOrder, functions } = (formValues ?? {}) as OrderFormValues;
  const { setAddProducts, refetch } = functions ?? {};
  const { updateStatus } = useConfirmOrder({ refetch: refetch }) ?? {};

  if (!selectedOrder || !functions || !updateStatus) {
    return null;
  }

  const { _id, status, customer, employee, orderDetails } = selectedOrder;

  async function removeProduct(productId: string) {
    try {
      await axiosClientJson.patch(`/orders/${_id}`, {
        orderDetails: orderDetails.filter(
          (line) => line.product._id !== productId
        ),
      });
    } catch {
      const msg = "Remove product failed";
      console.error(msg);
      message.error(msg, 1);
    }
  }

  // async function changeQuantity(product: WithId<Product>, amount: number) {
  //   const newOrderDetails = _.clone(orderDetails);
  //   const itemId = product._id;
  //   const foundIndex = orderDetails.findIndex(
  //     (elem) => elem.product._id === itemId
  //   );
  //   if (foundIndex < 0) {
  //     if (amount <= 0) return;
  //     newOrderDetails.push({
  //       quantity: amount,
  //       product: product,
  //     });
  //   } else {
  //     const found = orderDetails[foundIndex];
  //     const newQuantity = found.quantity + amount;
  //     if (newQuantity < 1) {
  //       newOrderDetails.splice(foundIndex, 1);
  //     } else {
  //       found.quantity = newQuantity;
  //     }
  //   }
  //   if (!selectedOrder) return;
  //   await axiosClientJson.patch("orders/" + selectedOrder._id, {
  //     orderDetails: newOrderDetails,
  //   });
  //   refetch?.();
  //   message.success("Thay đổi số lượng sản phẩm thành công", 1.5);
  // }

  // async function incQty(item: WithId<Product>) {
  //   await changeQuantity(item, 1);
  // }

  // async function decQty(item: WithId<Product>) {
  //   await changeQuantity(item, -1);
  // }

  const productColumns: ColumnsType<OrderLine> = [
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (num: number, record) => (
        <div className="d-flex justify-content-center">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={async () => {
              const foundIndex = orderDetails.findIndex(
                (x) => x.product._id === record.product._id
              );
              const newOrderDetails = _.clone(orderDetails);
              if (foundIndex >= 0) {
                newOrderDetails[foundIndex].quantity += 1;
              } else {
                newOrderDetails.push({
                  // productId: record.product._id,
                  quantity: 1,
                  product: record.product,
                });
              }

              await axiosClientJson.patch("orders/" + selectedOrder._id, {
                orderDetails: newOrderDetails,
              });
              // refetch?.();
              message.success("Plus a product sucessfully!!", 1.5);
            }}
          >
            +
          </button>
          <div className="border px-4 py-2 text-center align-self-center justify-content-center ">
            {num}
          </div>

          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={async () => {
              const newOrderDetails = _.clone(orderDetails);
              const foundIndex = orderDetails.findIndex(
                (x) => x.product._id === record.product._id
              );
              if (foundIndex < 0) return;
              const found = orderDetails[foundIndex];
              if (found.quantity === 1) {
                newOrderDetails.splice(foundIndex, 1);
              } else {
                newOrderDetails[foundIndex].quantity -= 1;
              }
              await axiosClientJson.patch("orders/" + selectedOrder._id, {
                orderDetails: newOrderDetails,
              });
              refetch?.();
              message.success("Minus a product sucessfully!!", 1.5);
            }}
          >
            -
          </button>
        </div>
      ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "product.name",
      key: "product.name",
      render: (text, record) => {
        return <strong>{record?.product?.name}</strong>;
      },
    },
    {
      title: "Giá",
      dataIndex: "product.price",
      key: "product.price",
      render: (text, record) => {
        return (
          <div style={{ textAlign: "right" }}>
            {numeral(record?.product?.price).format("0,0$")}
          </div>
        );
      },
    },
    {
      title: "Giảm giá",
      dataIndex: "product.discount",
      key: "product.discount",
      render: (text, record) => {
        return (
          <div style={{ textAlign: "right" }}>
            {numeral(record?.product?.discount).format("0,0")}%
          </div>
        );
      },
    },
    {
      title: "",
      key: "actions",
      render: (text, record) => {
        return (
          <>
            <div>
              <Button
                danger
                type="dashed"
                onClick={() => removeProduct(record.product._id)}
              >
                Delete
              </Button>
            </div>
          </>
        );
      },
    },
  ];

  return (
    <Modal
      width={"100%"}
      onCancel={() => {
        setShowing(null);
      }}
      onOk={() => {
        setShowing(null);
      }}
      okType="dashed"
      open={showing === "orders"}
    >
      <Card title="Order Detail">
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Status">
            <Space>
              <Select
                disabled={statusDisabled}
                allowClear
                showSearch
                value={status}
                style={{ width: "100%" }}
                optionFilterProp="children"
                onChange={async (e) => {
                  message.loading("Changing status !!", 1.5);
                  updateStatus(_id, e);
                }}
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
                }
                options={[
                  { label: "WAITING", value: "WAITING" },
                  { label: "ECONFIRMED", value: "ECONFIRMED" },
                  { label: "COMPLETED", value: "COMPLETED" },
                  { label: "CANCELED", value: "CANCELED" },
                ]}
              />

              <Button
                danger={!statusDisabled}
                type="dashed"
                icon={<EditOutlined />}
                onClick={() => {
                  setStatusDisabled(!statusDisabled);
                }}
              />
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Customer">
            <Space>
              <Input
                disabled={true}
                placeholder={`${customer?.firstName} ${customer?.lastName}`}
              />
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Employee">
            <Space>
              {employee ? (
                <Input
                  disabled={true}
                  placeholder={`${employee?.firstName} ${employee?.lastName}`}
                />
              ) : (
                "Not confirm yet"
              )}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Shipping address">
            <Row gutter={10} className="py-2">
              <Col span={20}>
                <Input.Search
                  disabled={shippingAddressDisabled}
                  enterButton={<SendOutlined />}
                  placeholder={selectedOrder?.shippingAddress}
                  style={{ width: "100%" }}
                  onSearch={async (e) => {
                    message.loading("Changing Shipping Address !!", 1.5);
                    const req = await axiosClientJson.patch(`/orders/${_id}`, {
                      shippingAddress: e,
                    });
                    if (req.data) {
                      message.success(
                        `Change Shipping address to ${req.data.status} successfully!!`,
                        1.5
                      );
                      // setRefresh((f) => f + 1);
                      refetch?.();
                      setShippingAddressDisabled(!shippingAddressDisabled);
                    }
                  }}
                />
              </Col>

              <Col span={4}>
                <Button
                  danger={!shippingAddressDisabled}
                  type="dashed"
                  icon={<EditOutlined />}
                  onClick={() => {
                    setShippingAddressDisabled(!shippingAddressDisabled);
                  }}
                />
              </Col>
            </Row>
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* Table include product of orderDetails */}
        <Table
          bordered
          scroll={{ x: 200 }}
          rowKey="_id"
          dataSource={orderDetails}
          columns={productColumns}
        />

        <Button
          onClick={() => {
            setAddProducts(true);
          }}
        >
          Thêm sản phẩm
        </Button>
      </Card>
    </Modal>
  );
}

const useConfirmOrder = ({ refetch }: { refetch?: () => void }) => {
  const auth = useAuthStore((s) => s.auth);
  if (!auth?.user) {
    return;
  }
  const cancelOrder = async (id: string) => {
    return updateStatus(id, "CANCELED");
  };

  const confirmOrder = async (id: string) => {
    return updateStatus(id, "ECONFIRMED");
  };

  const updateStatus = async (id: string, status: string) => {
    const response = await axiosClientJson.patch(`/orders/${id}`, {
      status: status.toUpperCase(),
      employeeId: auth?.user?._id,
    });
    if (response?.data?._id) {
      message.success(`change order'S status successfully`);
      refetch?.();
    } else {
      message.error(`SYSTEM ERROR !!!`);
    }
  };

  return {
    confirm: confirmOrder,
    cancel: cancelOrder,
    updateStatus: updateStatus,
  };
};
