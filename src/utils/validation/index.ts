import { categoryIdValidate, getCategoryValidate } from "./Category";
import { customerIdValidate, getCustomersValidate } from "./Customer";
import { getProductsValidate, productIdValidate } from "./Product";
import { supplierIdValidate, getSuppliersValidate } from "./Supplier";

export {
  categoryIdValidate,
  getCategoryValidate,
  customerIdValidate,
  getCustomersValidate,
  supplierIdValidate,
  getSuppliersValidate,
  productIdValidate,
  getProductsValidate,
};

export const validateSearchParams = async ({
  searchParams,
  collection,
}: {
  searchParams: URLSearchParams;
  collection: string;
}) => {
  try {
    const res = { oke: false, message: "" };
    const data: Record<string, string | number> = {};
    searchParams.forEach((value, key) => {
      data[key] = value;
    });
    switch (collection.toLowerCase()) {
      case "categories":
      case "category":
        await categoryIdValidate.validate(data._id);
        await getCategoryValidate.validate(data);
        res.oke = true;
        return res;
      case "supplier":
      case "suppliers":
        await supplierIdValidate.validate(data._id);
        await getSuppliersValidate.validate(data);
        res.oke = true;
        return res;
      case "customer":
      case "customers":
        await customerIdValidate.validate(data._id);
        await getCustomersValidate.validate(data);
        res.oke = true;
        return res;
      case "product":
      case "products":
        await productIdValidate.validate(data._id);
        await getProductsValidate.validate(data);
        res.oke = true;
        return res;

      default:
        throw new Error("Invalid item type");
    }
  } catch (error) {
    // return error;
    return {
      oke: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
