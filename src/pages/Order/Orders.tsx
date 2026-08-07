import CRUD from "@/components/CRUD";
import { useModalForm } from "@/components/Forms/ModalForm/useModalForm";
import usePopupMessage from "@/hooks/usePopupMessage";
import { axiosClientJson } from "@/libraries/axiosClient";
import { devLog } from "@/utils/logger";
import { GetManyData } from "@/utils/mutationFn";
import { capitalizeFirstLetter } from "@/utils/stringUtils";
import { CheckOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Input,
  message,
  Modal,
  Popconfirm,
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
import { useRef, useState } from "react";
import { Order, OrderLine, WithId } from "utils/types/Entities";
// import { FormProps } from "utils/types/Form";
dayjs.extend(customParseFormat);

const OrderCRUD: React.FC = () => {
  const queryResults = useMyQuery<GetManyData<WithId<Order>>>({
    url: "/orders",
    queryKey: ["orders"],
    initParams: { active: "true" },
  });
  const {
    searchItems,
    query: { refetch },
  } = queryResults;
  const [selectedOrder, setSelectedOrder] = useState<WithId<Order>>();
  const [isSelectingProducts, setIsSelectingProducts] =
    useState<boolean>(false);
  const [messageApi] = usePopupMessage() || [];
  const queryClient = useQueryClient();

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
          <div className="p-2">
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
      width: "120px",
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
      title: "Ngày giao",
      dataIndex: "shippedDate",
      render(date: string | undefined, record) {
        if (!date || record.status.toUpperCase() !== "COMPLETED") {
          return "";
        }
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
          <div className="w-37.5">
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
      width: "120px",
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
      width: "150px",
      dataIndex: "status",
      key: "status",
      sorter: true,
      render: (status) => {
        const colors: Record<string, string> = {
          WAITING: "gold",
          ECONFIRMED: "blue",
          COMPLETED: "green",
          CANCELED: "red",
        };
        const tagColor = colors[status] ?? "blue";
        return <Tag color={tagColor}>{status}</Tag>;
      },
      filterDropdown: () => {
        return (
          <div className="w-37.5">
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
      title: "Xác nhận bởi",
      dataIndex: "employee",
      key: "employee",
      render: (employee: Order["employee"] | undefined) => {
        return (
          <strong>
            {employee?.firstName} {employee?.lastName}
          </strong>
        );
      },
      sorter: true,
    },
    {
      title: "Tổng tiền",
      dataIndex: "total",
      key: "total",
      render: (total) => {
        return (
          <strong>
            {typeof +total !== "number"
              ? 0
              : (+total).toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
          </strong>
        );
      },
      sorter: true,
    },
  ];

  const setFormValues = useModalForm((s) => s.setFormValues);
  const setOpen = useModalForm((s) => s.setOpen);

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
      <CRUD
        collectionName="orders"
        columns={columns}
        query={queryResults}
        // searchParams={searchParams}
        // setSearchParams={setSearchParams}
        // dataSource={ordersData?.results || []}
        // totalAmount={ordersData?.amountResults || 0}
        // loading={isLoading || isFetching}
        form={{
          customComponent: OrderDetailModal,
        }}
        functionColumn={{
          override: (record) => (
            <>
              <Button
                icon={<EyeOutlined />}
                title="Xem"
                // type="dashed"
                onClick={() => {
                  setFormValues({
                    selectedOrder: record,
                    functions: {
                      setIsSelectingProducts,
                      refetch,
                    },
                  });
                  // setTitle("orders");
                  setSelectedOrder(record);
                  setOpen(true);
                }}
              />
              <Popconfirm
                title="Xác nhận xóa"
                okType="danger"
                onConfirm={() => {
                  async function defaultHandleDelete({ _id }: WithId<Order>) {
                    try {
                      await axiosClientJson.delete(`/orders/${_id}`);
                      messageApi?.success("Delete success", 1);
                      await queryClient.invalidateQueries({
                        queryKey: [`orders`],
                      });
                    } catch (error) {
                      const errorName =
                        error instanceof Error ? error.name : "Unknown error";
                      messageApi?.error(`Delete fail: ${errorName}`, 1);
                    }
                  }
                  defaultHandleDelete(record);
                }}
                cancelText="Hủy"
              >
                <Button
                  title="Xóa"
                  // type="dashed"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </>
          ),
          extraFunctions: [
            (order) =>
              order.status === "WAITING" && (
                <Button
                  icon={<CheckOutlined />}
                  onClick={() => {
                    messageApi?.open({
                      key: "confirmOrder",
                      type: "loading",
                      content: "Đang xác nhận đơn hàng",
                    });
                    axiosClientJson
                      .patch(`/orders/${order._id}`, { status: "ECONFIRMED" })
                      .then(() => {
                        messageApi?.open({
                          key: "confirmOrder",
                          type: "success",
                          content: "Đã xác nhận đơn hàng",
                          duration: 1,
                        });
                      })
                      .catch((reason) => {
                        devLog(reason);
                        messageApi?.open({
                          key: "confirmOrder",
                          type: "error",
                          content: "Xác nhận đơn hàng bị lỗi",
                          duration: 1,
                        });
                      })
                      .finally(() => {
                        refetch();
                      });
                  }}
                ></Button>
              ),
          ],
        }}
        // fetchError={error}
      />
      <ProductDrawer
        isSelectingProducts={isSelectingProducts}
        setIsSelectingProducts={setIsSelectingProducts}
        selectedOrder={selectedOrder}
        refetch={refetch}
      />
    </>
  );
};

export default OrderCRUD;

type OrderFormValues = {
  selectedOrder?: WithId<Order>;
  functions: {
    setIsSelectingProducts: (b: boolean) => void;
    refetch?: () => void;
  };
};

function OrderDetailModal() {
  // props: Omit<FormProps, "submitFn" | "title" | "formControls" | "formValues">
  const [messageApi, contextHolder] = message.useMessage();
  const formValues = useModalForm((s) => s.formValues);
  const open = useModalForm((s) => s.open);
  const setOpen = useModalForm((s) => s.setOpen);
  const { selectedOrder, functions } = (formValues ?? {}) as OrderFormValues;
  const changes = useRef<{ shippingAddress?: string; status?: string }>({});
  const [localOrder, setLocalOrder] = useState<
    | {
        shippingAddress?: string;
        status?: string;
      }
    | undefined
  >(undefined);

  if (!selectedOrder || !functions) {
    return null;
  }

  const { _id, status, customer, employee, orderDetails, shippingAddress } =
    selectedOrder;

  return (
    <div>
      {contextHolder}
      <Modal
        width={"1000px"}
        onCancel={() => {
          setLocalOrder(undefined);
          setOpen(false);
          changes.current = {};
        }}
        onOk={() => {
          setOpen(false);
          setLocalOrder(undefined);
          if (_.isEmpty(changes.current)) {
            return;
          }
          axiosClientJson
            .patch(`/orders/${_id}`, changes.current)
            .then((res) => {
              if (res.data) {
                messageApi.open({
                  key: "updateOrder",
                  type: "success",
                  content: "Đã cập nhật thông tin đơn hàng",
                  duration: 1,
                });
                functions?.refetch?.();
              }
            })
            .catch((error) => {
              messageApi.open({
                key: "updateOrder",
                type: "error",
                content: "Cập nhật thông tin đơn hàng thất bại",
                duration: 1,
              });
              devLog(error);
            })
            .finally(() => {
              changes.current = {};
            });
        }}
        okType="dashed"
        open={open}
        okText="OK"
        title="Đơn hàng"
        cancelText="Hủy"
      >
        <Card title="Chi tiết đơn hàng">
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Trạng thái đơn hàng">
              <Space>
                <Select
                  allowClear
                  showSearch
                  value={localOrder ? localOrder.status : status}
                  style={{ width: "100%" }}
                  optionFilterProp="children"
                  onChange={async (newStatus) => {
                    if (newStatus !== status) {
                      changes.current.status = newStatus;
                    } else {
                      delete changes.current.status;
                    }
                    setLocalOrder((prev) => {
                      if (!prev) return { ...selectedOrder, status: newStatus };
                      return { ...prev, status: newStatus };
                    });
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
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">
              <Space>
                <Input
                  disabled={true}
                  placeholder={
                    customer?.firstName && customer?.lastName
                      ? `${customer?.firstName} ${customer?.lastName}`
                      : ``
                  }
                />
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày đặt hàng">
              <Space>
                {capitalizeFirstLetter(
                  new Date(selectedOrder.createdDate).toLocaleString("vi-VN", {
                    dateStyle: "full",
                    timeStyle: "full",
                  })
                )}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Nhân viên xác nhận">
              <Space>
                {employee ? (
                  <Input
                    disabled={true}
                    placeholder={`${employee?.firstName} ${employee?.lastName}`}
                  />
                ) : (
                  "Chưa xác nhận"
                )}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ giao hàng">
              <Row gutter={10} className="py-2">
                <Col span={20}>
                  <Input
                    value={
                      localOrder ? localOrder.shippingAddress : shippingAddress
                    }
                    style={{ width: "100%" }}
                    onChange={async (e) => {
                      const newAddress = e.target.value;
                      if (newAddress !== shippingAddress) {
                        changes.current.shippingAddress = newAddress;
                      } else {
                        delete changes.current.shippingAddress;
                      }
                      setLocalOrder((prev) => {
                        if (!prev)
                          return {
                            ...selectedOrder,
                            shippingAddress: newAddress,
                          };
                        return { ...prev, shippingAddress: newAddress };
                      });
                      return;
                    }}
                  />
                </Col>
              </Row>
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          {/* Table include product of orderDetails */}
          <Table<OrderLine>
            bordered
            scroll={{ x: 200 }}
            rowKey="_id"
            dataSource={orderDetails}
            columns={[
              {
                title: "Số lượng",
                dataIndex: "quantity",
                key: "quantity",
                render: (
                  quantity: number,
                  orderLine: OrderLine,
                  index: number
                ) => (
                  <div className="d-flex justify-content-center">
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      disabled={["COMPLETED", "CANCELED"].includes(
                        status.toUpperCase()
                      )}
                      onClick={async () => {
                        try {
                          const newOrderDetails = _.clone(orderDetails);
                          newOrderDetails[index].quantity++;
                          await axiosClientJson.patch(
                            "orders/" + selectedOrder._id,
                            {
                              orderDetails: newOrderDetails,
                            }
                          );
                          functions?.refetch?.();
                          messageApi.open({
                            key: "updateOrder",
                            type: "success",
                            content: "Đã cập nhật số lượng sản phẩm",
                            duration: 1,
                          });
                        } catch {
                          messageApi.open({
                            key: "updateOrder",
                            type: "error",
                            content: "Cập nhật số lượng sản phẩm thất bại",
                            duration: 1,
                          });
                        }
                      }}
                    >
                      +
                    </button>
                    <div className="border px-4 py-2 text-center align-self-center justify-content-center ">
                      {quantity}
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      disabled={["COMPLETED", "CANCELED"].includes(
                        status.toUpperCase()
                      )}
                      onClick={async () => {
                        try {
                          const newOrderDetails = _.clone(orderDetails);
                          if (quantity === 1) {
                            messageApi.open({
                              key: "updateOrder",
                              type: "error",
                              content:
                                "Số lượng sản phẩm không thể nhỏ hơn 1, nếu muốn xóa sản phẩm vui lòng sử dụng chức năng xóa",
                              duration: 2,
                            });
                            return;
                          } else {
                            newOrderDetails[index].quantity--;
                          }
                          await axiosClientJson.patch(
                            "orders/" + selectedOrder._id,
                            {
                              orderDetails: newOrderDetails,
                            }
                          );
                          functions?.refetch?.();
                          messageApi.open({
                            key: "updateOrder",
                            type: "success",
                            content: "Đã cập nhật số lượng sản phẩm",
                            duration: 1,
                          });
                        } catch {
                          messageApi.open({
                            key: "updateOrder",
                            type: "error",
                            content: "Cập nhật số lượng sản phẩm thất bại",
                            duration: 1,
                          });
                        }
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
                    <div className="text-right">
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
                    <div className="text-right">
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
                          onClick={async () => {
                            try {
                              const productId = record.product._id;
                              if (selectedOrder.orderDetails.length === 1) {
                                messageApi.open({
                                  key: "updateOrder",
                                  type: "error",
                                  content:
                                    "Đơn hàng phải có ít nhất 1 sản phẩm, nếu muốn xóa sản phẩm vui lòng hủy đơn hàng",
                                  duration: 2,
                                });
                                return;
                              }
                              await axiosClientJson.patch(`/orders/${_id}`, {
                                orderDetails: orderDetails.filter(
                                  (line) => line.product._id !== productId
                                ),
                              });
                              messageApi.open({
                                key: "updateOrder",
                                type: "success",
                                content: "Đã xóa sản phẩm khỏi đơn hàng",
                                duration: 1,
                              });
                              functions?.refetch?.();
                            } catch {
                              const msg = "Xóa sản phẩm khỏi đơn hàng thất bại";
                              messageApi.open({
                                key: "updateOrder",
                                type: "error",
                                content: msg,
                                duration: 1,
                              });
                            }
                          }}
                          disabled={["COMPLETED", "CANCELED"].includes(
                            status.toUpperCase()
                          )}
                        >
                          Xóa
                        </Button>
                      </div>
                    </>
                  );
                },
              },
            ]}
          />

          <Button
            onClick={() => {
              functions?.setIsSelectingProducts?.(true);
            }}
            disabled={["COMPLETED", "CANCELED"].includes(status.toUpperCase())}
          >
            Thêm sản phẩm
          </Button>
        </Card>
      </Modal>
    </div>
  );
}
