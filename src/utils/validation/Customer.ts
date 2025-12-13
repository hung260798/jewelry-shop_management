import * as yup from "yup";

export const customerIdValidate = yup.object().shape({
  id: yup.string(),
});

export const getCustomersValidate = yup.object().shape({
  Locked: yup.boolean(),
  email: yup.string(),
  firstName: yup.string(),
  lastName: yup.string(),
  phoneNumber: yup.string().matches(/^\d+$/, "phoneNumber is not valid Number"),
  birthdayFrom: yup.string(),
  birthdayTo: yup.string(),
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
});
