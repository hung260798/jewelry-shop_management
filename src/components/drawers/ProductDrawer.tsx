import useMyQuery from "@/hooks/useMyQuery";
import { axiosClientJson } from "@/libraries/axiosClient";
// import { Order, Product, WithId } from "@/utils/types/Entities";
import { Order, Product, WithId } from "@repo/utils/types";

import { GetMany } from "@repo/utils/types";
import { Button, Card, Drawer, message, Pagination, Spin } from "antd";

interface PropTypes {
  addProducts: boolean;
  setAddProducts: (b: boolean) => void;
  selectedOrder?: Order & WithId<Order>;
  refetch: () => void;
}

const ProductDrawer = (props: PropTypes) => {
  const {
    query: { data, isLoading, isFetching },
    searchItems,
    searchParams,
  } = useMyQuery<GetMany<WithId<Product>>>({
    url: "/products",
    queryKey: [`get_products_o`],
    usePrivateParams: true,
  });
  const { results: products, amountResults: amountProducts } = data ?? {
    results: [],
    amountResults: 0,
  };
  const { addProducts, setAddProducts, selectedOrder, refetch } = props;

  if (!selectedOrder) return null;

  const onAddProduct = async (product: WithId<Product>) => {
    const response = await axiosClientJson.get("orders/" + selectedOrder._id);
    const currentOrder = response.data;
    const { orderDetails } = currentOrder;
    const found = orderDetails.find((x: any) => x.productId === product._id);
    if (found) {
      found.quantity++;
    } else {
      orderDetails.push({
        productId: product._id,
        quantity: 1,
      });
    }

    await axiosClientJson.patch("orders/" + selectedOrder._id, {
      orderDetails,
    });
    refetch();
    message.success(
      `Add product: "${product.name}"  into order sucessfully!!`,
      1.5
    );
  };

  const renderProductItem = (
    product: WithId<Product>
    // index: number,
    // array: WithId<Product>[]
  ) => (
    <Card key={product._id}>
      <strong className="px-2">{product.name}</strong>
      <Button className="px-2" onClick={() => onAddProduct(product)}>
        <span>Add</span>
      </Button>
    </Card>
  );

  const productListUI =
    isLoading || isFetching ? <Spin /> : products?.map(renderProductItem);

  const limit = +(searchParams.get("limit") ?? "10");
  const skip = +(searchParams.get("skip") ?? "0");
  const currentPage = 1 + skip / limit;
  const onPageChange = (page: number, pageSize: number = limit) => {
    searchItems({ type: "skip", value: "" + (page - 1) * pageSize });
  };

  return (
    <Drawer
      width={"40%"}
      title="Danh sách sản phẩm"
      open={addProducts}
      onClose={() => {
        setAddProducts(false);
      }}
      placement="right"
    >
      <div>
        {productListUI}
        <Pagination
          current={currentPage}
          onChange={onPageChange}
          total={amountProducts}
        ></Pagination>
      </div>
    </Drawer>
  );
};

export default ProductDrawer;
