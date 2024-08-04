"use client";

import { createToastWrapper } from "@/components/core/toast";
import { ActionButton } from "@/components/form/button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/webauthn";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import logo from "../../../public/images/logo.png";
import { login } from "../actions";

export default function SignInForm() {
  return (
    <div className="m-6 flex h-full items-center justify-center">
      {createToastWrapper("dark")}

      <Card className="w-full max-w-md">
        <div className="flex p-6 lg:flex-1">
          <Image
            src={logo}
            alt="Manage"
            width={32}
            height={32}
            className="-mt-2 mr-2 rounded-md"
          />

          <Link href="/" className="-m-1.5 p-1.5" prefetch={false}>
            <p className="relative tracking-tight">
              Manage
              <sup className="absolute left-[calc(100%+.1rem)] top-0 text-xs">
                [beta]
              </sup>
            </p>
          </Link>
        </div>
        <CardHeader>
          <CardTitle className="text-hero text-4xl">Get Started</CardTitle>
          <CardDescription>
            Enter your email below to login to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <form
              action={(formData) => {
                toast.promise(login(formData), {
                  loading: "Logging in...",
                  success: "Logged in!",
                  error: "Failed to log in.",
                });
              }}
            >
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@managee.xyz"
                name="email"
                required
              />

              <ActionButton
                className="mt-2 w-full"
                label="Sign in"
                loadingLabel="Logging in..."
              />
            </form>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              toast.promise(signIn("passkey"), {
                loading: "Signing in...",
                success: "Signed in!",
                error: "Failed to sign in.",
              })
            }
            className="w-full"
          >
            Sign in with Passkey (beta)
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
