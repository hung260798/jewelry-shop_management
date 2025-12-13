import * as yup from "yup";

export const productIdValidate = yup.object({
  id: yup.string(),
});
export const getProductsValidate = yup.object({
  categoryId: yup.string(),
  supplierId: yup.string(),
  productName: yup.string(),
  fromPrice: yup
    .string()
    .matches(/^\d+$/, "fromPirce is not valid Number")
    .min(0)
    .max(1000),
  toPrice: yup
    .string()
    .matches(/^\d+$/, "toPrice is not valid Number")
    .min(0)
    .max(1000),
  fromDiscount: yup
    .string()
    .matches(/^\d+$/, "fromDiscount is not valid Number")
    .min(0)
    .max(1000),
  toDiscount: yup
    .string()
    .matches(/^\d+$/, "toDiscount is not valid Number")
    .min(0)
    .max(1000),
  fromStock: yup
    .string()
    .matches(/^\d+$/, "fromStock is not valid Number")
    .min(0)
    .max(1000),
  toStock: yup
    .string()
    .matches(/^\d+$/, "toStock is not valid Number")
    .min(0)
    .max(1000),
  skip: yup
    .string()
    .matches(/^\d+$/, "skip is not valid Number")
    .min(0)
    .max(1000),
  limit: yup
    .string()
    .matches(/^\d+$/, "limit is not valid Number")
    .min(0)
    .max(1000),
  sortBy: yup.string(),
  sortOrder: yup.number(),
});
