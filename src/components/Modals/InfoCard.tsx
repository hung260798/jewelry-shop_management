import { StateAndUpdaters } from "@/utils/types/Others";
import { Card } from "antd";
import React from "react";
import { create } from "zustand";

type InfoCardState = {
  open: boolean;
  item?: unknown;
  collection?: string;
};

type UseInfoCard = StateAndUpdaters<InfoCardState>;

export const useInfoCard = create<UseInfoCard>()((set) => ({
  open: false,
  setOpen: (updater) => {
    if (typeof updater === "function") {
      return set((prev) => ({ open: updater(prev.open) }));
    }
    return set({ open: updater });
  },
  item: undefined,
  collection: undefined,
  setItem(updater) {
    if (typeof updater === "function") {
      return set((prev) => ({ item: updater(prev.item) }));
    }
    return set({ item: updater });
  },
  setCollection(updater) {
    if (typeof updater === "function") {
      return set((prev) => ({ collection: updater(prev.collection) }));
    }
    return set({ collection: updater });
  },
}));

export default function InfoCard() {
  const [loading] = React.useState(true);

  return (
    <Card
      loading={loading}
      cover={
        <img
          alt="product"
          src="product-image-url"
          style={{ height: 200, objectFit: "cover" }}
        />
      }
    >
      <Card.Meta
        title="Product Name"
        description={
          <div>
            <p>
              <strong>Description:</strong> Product description goes here
            </p>
            <p>
              <strong>Category:</strong> Product category
            </p>
            <p>
              <strong>Supplier:</strong> Supplier name
            </p>
            <p>
              <strong>Price:</strong> $99.99
            </p>
            <p>
              <strong>Stock:</strong> 100 units
            </p>
            <p>
              <strong>Discount:</strong> 10%
            </p>
          </div>
        }
      />
    </Card>
  );
}
