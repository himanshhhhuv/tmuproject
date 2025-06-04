"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const LoginPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [showForgot, setShowForgot] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return; // Wait for clerk to load

    const role = user?.publicMetadata.role;
    console.log("Current role:", role);

    if (isSignedIn && role) {
      router.push(`/${role}`);
    }
  }, [isLoaded, isSignedIn, user, router]);

  if (!isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-lamaSkyLight relative overflow-hidden">
      <Image
        src="/pic.jpg"
        alt="Background"
        fill
        className="object-cover z-0 opacity-60"
        priority
      />
      <div className="z-10 w-full flex items-center justify-center">
        <SignIn.Root>
          <SignIn.Step
            name="start"
            className="bg-white p-12 rounded-md shadow-2xl flex flex-col gap-2"
          >
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Image src="/logo.png" alt="" width={24} height={24} />
              CCSIT PORTAL
            </h1>
            <h2 className="text-gray-400">Sign in to your account</h2>
            <Clerk.GlobalError className="text-sm text-red-400" />
            <Clerk.Field name="identifier" className="flex flex-col gap-2">
              <Clerk.Label className="text-xs text-gray-500">
                Username
              </Clerk.Label>
              <Clerk.Input
                type="text"
                required
                className="p-2 rounded-md ring-1 ring-gray-300"
              />
              <Clerk.FieldError className="text-xs text-red-400" />
            </Clerk.Field>
            <Clerk.Field name="password" className="flex flex-col gap-2">
              <Clerk.Label className="text-xs text-gray-500">
                Password
              </Clerk.Label>
              <Clerk.Input
                type="password"
                required
                className="p-2 rounded-md ring-1 ring-gray-300"
              />
              <Clerk.FieldError className="text-xs text-red-400" />
            </Clerk.Field>
            <SignIn.Action
              submit
              className="bg-blue-500 text-white my-1 rounded-md text-sm p-[10px]"
            >
              Sign In
            </SignIn.Action>
            <button
              type="button"
              className="text-xs text-blue-500 underline mt-2 self-end"
              onClick={() => setShowForgot(true)}
            >
              Forgot Password?
            </button>
            {showForgot && (
              <div className="mt-2 text-xs text-gray-700 bg-yellow-100 p-2 rounded">
                Please contact the admin cell to reset your password.
              </div>
            )}
          </SignIn.Step>
        </SignIn.Root>
      </div>
    </div>
  );
};

export default LoginPage;
