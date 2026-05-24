"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAuth } from "@/context/AuthContext";
import apiService from "@/shared/services/api";
import { getRegisterSchema } from "./validations/registerSchema";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { User, Mail, Lock } from "lucide-react";
import { FaMicrosoft, FaGithub } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation(["auth"]);
  const registerSchema = getRegisterSchema(t);

  const form = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: { name: "", surname: "", username: "", email: "", password: "", confirmPassword: "" },
  });

    const onSubmit = async (data) => {
    setLoading(true);
    try {
      await apiService.post("/auth/register/", {
        email: data.email,
        password: data.password,
        first_name: data.name,
        last_name: data.surname,
        username: data.username,
      });

      await login({ email: data.email, password: data.password });
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "h-14 rounded-full border-none bg-secondary/50 px-8 text-base focus-visible:ring-2 focus-visible:ring-primary transition-all";

  return (
    <div className="min-h-[100dvh] flex items-center justify-center w-full p-4 bg-background text-foreground">
      <Card className="w-full max-w-[580px] border-none shadow-none md:shadow-2xl rounded-[2.5rem] md:rounded-[3rem] bg-card text-card-foreground overflow-hidden">
        <CardContent className="p-8 md:p-14 space-y-8">

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              {t("auth:register.title")}
            </h1>
            <p className="text-muted-foreground text-lg font-medium">
              {t("auth:register.description")}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative group">
                        <Input placeholder={t("auth:register.name") || "Given Name"} {...field} className={inputClasses} />
                        <User className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                      </div>
                    </FormControl>
                    <FormMessage className="ml-6 text-primary" />
                  </FormItem>
                )}
              />

              {/* Surname Field */}
              <FormField
                control={form.control}
                name="surname"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative group">
                        <Input placeholder={t("auth:register.surname") || "Family Name"} {...field} className={inputClasses} />
                        <User className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                      </div>
                    </FormControl>
                    <FormMessage className="ml-6 text-primary" />
                  </FormItem>
                )}
              />

              {/* Username Field */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative group">
                        <Input placeholder={t("auth:register.username") || "Username"} {...field} className={inputClasses} />
                        <User className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                      </div>
                    </FormControl>
                    <FormMessage className="ml-6 text-primary" />
                  </FormItem>
                )}
              />

              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative group">
                        <Input placeholder={t("auth:register.email") || "Email Address"} {...field} className={inputClasses} />
                        <Mail className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                      </div>
                    </FormControl>
                    <FormMessage className="ml-6 text-primary" />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative group">
                        <Input type="password" placeholder={t("auth:register.password") || "Password"} {...field} className={inputClasses} />
                        <Lock className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                      </div>
                    </FormControl>
                    <FormMessage className="ml-6 text-primary" />
                  </FormItem>
                )}
              />

              {/* Confirm Password Field */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative group">
                        <Input type="password" placeholder={t("auth:register.confirmPassword") || "Confirm Password"} {...field} className={inputClasses} />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-2 border-muted-foreground/30 group-focus-within:border-primary/50 transition-colors" />
                      </div>
                    </FormControl>
                    <FormMessage className="ml-6 text-primary" />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-14 text-lg font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                >
                  {loading ? "..." : t("auth:register.title")}
                </Button>
              </div>
            </form>
          </Form>

          {/* Social Register */}
          <div className="space-y-4">
            <div className="relative flex items-center justify-center">
              <span className="absolute inset-x-0 h-px bg-border"></span>
              <span className="relative bg-card px-4 text-sm text-muted-foreground font-medium">
                {t("auth:register.orRegisterWith")}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex-1 rounded-full bg-secondary/30 border-none h-12 gap-3 hover:bg-secondary/50 transition-colors">
                <FaMicrosoft className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold opacity-80">{t("auth:register.microsoft")}</span>
              </Button>
              <Button variant="outline" className="flex-1 rounded-full bg-secondary/30 border-none h-12 gap-3 hover:bg-secondary/50 transition-colors">
                <FaGithub className="w-4 h-4 fill-current" />
                <span className="text-sm font-bold opacity-80">{t("auth:register.github")}</span>
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-border flex justify-between items-center px-2">
            <span className="text-muted-foreground font-medium">{t("auth:register.hasAccount")}</span>
            <Button 
              onClick={() => navigate("/login")} 
              variant="link"
              className="text-primary font-bold p-0 text-lg hover:no-underline"
            >
              {t("auth:register.login")}
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterPage;