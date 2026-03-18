import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <Card className="w-full max-w-[400px] shadow-xl border-t-4 border-t-primary">
        <CardHeader className="space-y-1 text-left">
          <CardTitle className="text-2xl font-bold tracking-tight">Login</CardTitle>
          <CardDescription>
            Write down your email to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-left">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Button variant="link" className="px-0 font-normal text-xs text-muted-foreground">
                Forgot your password?
              </Button>
            </div>
            <Input id="password" type="password" />
          </div>
          <Button className="w-full font-semibold" onClick={() => navigate('/')}>
            Log In
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t py-4 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="text-sm text-muted-foreground text-center">
            Already have an account?{" "}
            <Button variant="link" className="p-0 h-auto font-bold" onClick={() => navigate('/register')}>
              Sign Up
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;