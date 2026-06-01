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
        navigate("/");
      }
    } catch (error) {
      if (error.response?.data?.errorCode === "ACCOUNT_NOT_VERIFIED") {
        navigate("/account-not-verified", { state: { email: data.identifier } });
      } else {
        const backendMessage = error.response?.data?.message;
        notificationService.error(backendMessage || t("auth:login.errorMessage", "An unexpected error occurred."));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center w-full px-4 sm:px-0">
      <Card className="w-full max-w-[540px] border-none shadow-none md:shadow-2xl rounded-[2.5rem] md:rounded-[3rem] bg-card text-card-foreground overflow-hidden">
        <CardContent className="p-8 md:p-14 space-y-10">

          {/* Header Section */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              {t("auth:login.title")}
            </h1>
            <p className="text-muted-foreground text-lg font-medium">
              {t("auth:login.description")}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

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
                          className="h-14 rounded-full border-none bg-secondary/50 px-8 text-base focus-visible:ring-2 focus-visible:ring-primary"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                      </div>
                    </FormControl>
                    <FormMessage className="ml-6 text-primary" />
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
                          className="h-14 rounded-full border-none bg-secondary/50 px-8 text-base focus-visible:ring-2 focus-visible:ring-primary"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                      </div>
                    </FormControl>
                    <FormMessage className="ml-6 text-primary" />
                  </FormItem>
                )}
              />

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-12 h-14 text-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  {loading ? "..." : t("auth:login.title")}
                </Button>

                <Button
                  variant="link"
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-muted-foreground font-semibold hover:text-primary transition-colors"
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
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button variant="outline" className="flex-1 rounded-full bg-secondary/30 border-none h-12 gap-3 hover:bg-secondary/50 transition-colors">
                <FaMicrosoft className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold opacity-80">{t("auth:login.microsoft")}</span>
              </Button>
              <Button variant="outline" className="flex-1 rounded-full bg-secondary/30 border-none h-12 gap-3 hover:bg-secondary/50 transition-colors">
                <FaGithub className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold opacity-80">{t("auth:login.github")}</span>
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-border flex justify-between items-center px-2">
            <span className="text-muted-foreground font-medium">{t("auth:login.noAccount")}</span>
            <Button
              onClick={() => navigate("/register")}
              variant="link"
              className="text-primary font-bold p-0 text-lg hover:no-underline"
            >
              {t("auth:login.signUp")}
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;