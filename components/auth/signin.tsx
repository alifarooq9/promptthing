"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "lucide-react";
import React from "react";
import { useAuthActions } from "@convex-dev/auth/react";

const formSchema = z.object({
  email: z
    .string()
    .email({
      message: "Invalid email address",
    })
    .min(1, {
      message: "Email is required",
    }),
  password: z
    .string()
    .min(8, {
      message: "Password must be at least 8 characters long",
    })
    .refine((val) => /[A-Z]/.test(val), {
      message: "Password must contain at least one uppercase letter",
    })
    .refine((val) => /[a-z]/.test(val), {
      message: "Password must contain at least one lowercase letter",
    })
    .refine((val) => /\d/.test(val), {
      message: "Password must contain at least one number",
    }),
});

export default function Signin() {
  const [show, setShow] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log("Form submitted:", data);
    // Handle form submission logic here
  };

  return (
    <section className="flex w-full flex-col items-center justify-center p-4 py-28 xl:px-6">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center">
          <h1 className="w-full text-center text-xl font-semibold text-balance">
            Welcome to Promptthing
          </h1>
          <p className="text-muted-foreground w-full text-center text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className="relative w-full">
                        <MailIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                        <Input
                          placeholder="ali@example.com"
                          className="ps-8"
                          aria-invalid={!!fieldState.invalid}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter your email address to login
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <a
                        href="#"
                        className="text-sm font-medium hover:underline hover:underline-offset-4"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <FormControl>
                      <div className="relative w-full">
                        <LockIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                        <Input
                          placeholder="Password"
                          type={show ? "text" : "password"}
                          className="ps-8 pe-9"
                          aria-invalid={!!fieldState.invalid}
                          {...field}
                        />

                        <Button
                          size="icon"
                          variant="ghost"
                          type="button"
                          className="absolute top-1/2 right-0.5 h-8 w-8 -translate-y-1/2 cursor-pointer"
                          onClick={() => setShow(!show)}
                        >
                          {show ? <EyeOffIcon /> : <EyeIcon />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter your password to login
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full cursor-pointer">
                Continue with Email
              </Button>
            </form>
          </Form>

          <div className="after:border-border relative py-6 text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-card text-muted-foreground relative z-10 px-2">
              Or
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <GithubAuth />
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground w-full text-center text-sm">
            Want to create an account?{" "}
            <a href="#" className="underline underline-offset-2">
              Register
            </a>
          </p>
        </CardFooter>
      </Card>

      <p className="text-muted-foreground mt-4 max-w-md text-center text-sm text-balance">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline underline-offset-2">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-2">
          Privacy Policy
        </a>
        .
      </p>
    </section>
  );
}

function GithubAuth() {
  const { signIn } = useAuthActions();

  const handleGithubAuth = async () => {
    await signIn("github");
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="cursor-pointer"
      onClick={handleGithubAuth}
    >
      <svg
        viewBox="0 0 1024 1024"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
          transform="scale(64)"
          fill="currentColor"
        />
      </svg>
      Continue with Github
    </Button>
  );
}
