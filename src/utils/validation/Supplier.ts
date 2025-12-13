import * as yup from "yup";

export const supplierIdValidate = yup.object({
  id: yup.string(),
});

export const getSuppliersValidate = yup.object({
  name: yup.string(),
  email: yup.string(),
  phoneNumber: yup.string().matches(/^\d+$/, "phoneNumber is not valid Number"),
  address: yup.string(),
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
  method: yup.string().optional(),
  _id: yup.string().when("method", {
    is: (method?: string) =>
      typeof method === "string" && method.toLowerCase() === "patch",
    then: (schema) => schema.required("_id is required when method is patch"),
    otherwise: (schema) => schema.optional(),
  }),
});

export const schemas = {
  get: {
    params: {
      name: yup.string(),
      email: yup.string(),
      phoneNumber: yup
        .string()
        .matches(/^\d+$/, "phoneNumber is not valid Number"),
      address: yup.string(),
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
    },
    variables: {
      id: yup.string(),
    },
  },
  post: {
    body: {
      name: yup.string().required(),
      email: yup.string().required(),
      phoneNumber: yup
        .string()
        .required()
        .matches(/^\d+$/, "phoneNumber is not valid Number"),
      address: yup.string(),
    },
  },
  patch: {
    body: {
      name: yup.string(),
      email: yup.string(),
      phoneNumber: yup
        .string()
        .matches(/^\d+$/, "phoneNumber is not valid Number"),
      address: yup.string(),
    },
  },
};
