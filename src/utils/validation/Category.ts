import * as yup from "yup";
export const getCategoryValidate = yup.object().shape({
  name: yup.string(),
  description: yup.string(),
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
});
export const categoryIdValidate = yup.object().shape({
  id: yup.string(),
});
