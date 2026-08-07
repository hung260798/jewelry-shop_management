import useMyQuery from "@/hooks/useMyQuery";
import { axiosClientJson } from "@/libraries/axiosClient";
import { Order, Product, WithId } from "utils/types/Entities";
import { Button, Card, Drawer, Input, message, Pagination, Spin } from "antd";
import { GetMany } from "utils/types/Entities";
import { SearchOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";

const ProductDrawer = (props: {
  isSelectingProducts: boolean;
  setIsSelectingProducts: (b: boolean) => void;
  selectedOrder?: Order & WithId<Order>;
  refetch: () => void;
}) => {
  const {
    query: { data, isLoading, isFetching },
    searchItems,
    searchParams,
  } = useMyQuery<GetMany<WithId<Product>>>({
    url: "/products",
    queryKey: [`products_drawer`],
    usePrivateParams: true,
    initParams: {
      limit: "10",
      skip: "0",
      sortBy: "_id",
      sortOrder: "desc",
      fieldsIncluded: "name,price",
    },
  });
  const { results: products, amountResults: amountProducts } = data ?? {
    results: [],
    amountResults: 0,
  };
  const {
    isSelectingProducts: addProducts,
    setIsSelectingProducts: setAddProducts,
    selectedOrder,
    refetch,
  } = props;

  const [searchValue, setSearchValue] = useState("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear the previous timeout
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set a new timeout for the debounced search
    debounceTimerRef.current = setTimeout(() => {
      searchItems([
        { type: "productName", value: searchValue },
        { type: "skip", value: "0" },
      ]);
    }, 500);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchValue]);

  const [productsCache, setProductsCache] = useState<WithId<Product>[]>([]);
  useEffect(() => {
    if (products && products.length > 0) {
      setProductsCache(products);
    }
  }, [products]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const limit = +(searchParams.get("limit") ?? "10");
  const skip = +(searchParams.get("skip") ?? "0");
  const currentPage = 1 + skip / limit;
  const onPageChange = (page: number, pageSize: number) => {
    searchItems([{ type: "skip", value: "" + (page - 1) * pageSize }]);
  };

  if (!selectedOrder) return null;

  const onAddProduct = async (product: WithId<Product>) => {
    const response = await axiosClientJson.get<Order>(
      "orders/" + selectedOrder._id
    );
    const { orderDetails } = response.data;
    const found = orderDetails.find((x) => x.productId === product._id);
    if (found) {
      found.quantity++;
    } else {
      orderDetails.push({
        productId: product._id,
        quantity: 1,
        product: { ...product, total: product.price },
        price: product.price,
        discount: product.discount || 0,
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
      <div className="mb-4">
        <Input
          placeholder="Tìm kiếm sản phẩm theo tên..."
          prefix={<SearchOutlined />}
          onChange={handleSearchChange}
          allowClear
        />
      </div>
      <Spin spinning={isLoading || isFetching}>
        {productsCache?.map((product: WithId<Product>) => (
          <Card key={product._id}>
            <strong className="px-2">{product.name}</strong>
            <Button className="px-2" onClick={() => onAddProduct(product)}>
              <span>Thêm</span>
            </Button>
          </Card>
        ))}
      </Spin>
      <Pagination
        current={currentPage}
        onChange={onPageChange}
        total={amountProducts}
        pageSize={limit}
      ></Pagination>
    </Drawer>
  );
};

export default ProductDrawer;
