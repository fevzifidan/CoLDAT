import * as yup from "yup";

export const getRegisterSchema = (t: any) => yup.object({
  name: yup.string().required(t("auth:validation.nameRequired")).min(3, t("auth:validation.nameMin")),
  surname: yup.string().required(t("auth:validation.surnameRequired")).min(3, t("auth:validation.surnameMin")),
  email: yup.string().email(t("auth:validation.email")).required(t("auth:validation.emailRequired")),
  username: yup.string().required(t("auth:validation.usernameRequired")).min(3, t("auth:validation.usernameMin")),
  password: yup
    .string()
    .required(t("auth:validation.passwordRequired"))
    .min(8, t("auth:validation.password"))
    .matches(/[a-z]/, t("auth:validation.passwordLowercase"))
    .matches(/[A-Z]/, t("auth:validation.passwordUppercase"))
    .matches(/[^a-zA-Z0-9]/, t("auth:validation.passwordNonAlphanumeric")),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], t("auth:validation.confirmPassword"))
    .required(t("auth:validation.confirmPasswordRequired")),
});