"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { FaMicrosoft, FaGithub } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { getLoginSchema } from "./validations/loginSchema";
import { useNavigate } from "react-router-dom";
import notificationService from "@/shared/services/notification";
import { Logger } from '@/shared/services/logging/logging';
import { LoginLayout } from "./layouts/LoginLayout";

const LoginForm = () => {
  const { t } = useTranslation(["auth"]);
  const loginSchema = getLoginSchema(t);

  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await login({ email: data.identifier, password: data.password }, { silent: true });
      if (res) {
        navigate("/home");
      }
    } catch (error) {
            if (error.response?.data?.errorCode === "ACCOUNT_NOT_VERIFIED") {
        Logger.info("Login redirect to verification", { errorCode: "ACCOUNT_NOT_VERIFIED" });
        navigate("/account-not-verified", { state: { email: data.identifier } });
      } else {
        Logger.info("Login form submission failed", {
          errorCode: error.response?.data?.errorCode,
          message: error.response?.data?.message,
        });
        const backendMessage = error.response?.data?.message;
        notificationService.error(backendMessage || t("auth:login.errorMessage", "An unexpected error occurred."));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginLayout>
      <Card className="w-full max-w-[460px] shadow-lg border-border/50 rounded-2xl bg-card text-card-foreground">
        <CardContent className="p-8 sm:p-10 space-y-8">

          {/* Header Section */}
          <div className="text-center space-y-2">
            <h1 className="text-[26px] font-semibold text-foreground">
              {t("auth:login.title")}
            </h1>
            <p className="text-muted-foreground text-[15px]">
              {t("auth:login.description")}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="test@test.com"
                          {...field}
                          className="h-12 bg-background border-border placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs text-destructive ml-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="password"
                          placeholder="••••••••••••"
                          {...field}
                          className="h-12 bg-background border-border placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs text-destructive ml-1" />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-[15px] font-medium rounded-xl flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground transition-all active:scale-95"
                >
                  {loading ? "..." : t("auth:login.title")}
                </Button>

                <Button
                  variant="link"
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-muted-foreground font-medium text-[13px] hover:text-primary transition-colors"
                >
                  {t("auth:login.forgotPassword")}
                </Button>
              </div>
            </form>
          </Form>

          {/* Social Login */}
          <div className="space-y-4">
            <div className="relative flex items-center justify-center">
              <span className="absolute inset-x-0 h-px bg-border"></span>
              <span className="relative bg-card px-4 text-sm text-muted-foreground font-medium">
                {t("auth:login.orLoginWith")}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex-1 rounded-xl bg-secondary/30 border-none h-11 gap-3 hover:bg-secondary/50 transition-colors">
                <FaMicrosoft className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold opacity-80">{t("auth:login.microsoft")}</span>
              </Button>
              <Button variant="outline" className="flex-1 rounded-xl bg-secondary/30 border-none h-11 gap-3 hover:bg-secondary/50 transition-colors">
                <FaGithub className="w-4 h-4 fill-current" />
                <span className="text-sm font-semibold opacity-80">{t("auth:login.github")}</span>
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-border flex justify-between items-center">
            <span className="text-muted-foreground font-medium text-sm">{t("auth:login.noAccount")}</span>
            <Button
              onClick={() => navigate("/register")}
              variant="link"
              className="text-primary font-semibold p-0 text-[14px] hover:no-underline"
            >
              {t("auth:login.signUp")}
            </Button>
          </div>

        </CardContent>
      </Card>
    </LoginLayout>
  );
};

export default LoginForm;