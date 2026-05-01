import * as yup from "yup";

export const getLoginSchema = (t: any) => yup.object({
  identifier: yup
    .string()
    .required(t("auth:validation.emailRequired"))
    .email(t("auth:validation.emailInvalid")),
  password: yup
    .string()
    .required(t("auth:validation.passwordRequired"))
    .min(8, t("auth:validation.password")),
}).required();