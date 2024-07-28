"use client";

import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";

const Toaster = dynamic(() =>
  import("react-hot-toast").then((mod) => mod.Toaster)
);

export function createToastWrapper(prefersColorScheme: string | undefined) {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style:
          prefersColorScheme === "dark"
            ? {
                background: "#333",
                color: "#fff",
              }
            : {},
      }}
    />
  );
}

export function notifyInfo(message: string | null) {
  return toast(message);
}

export function notifySuccess(message: string | null) {
  return toast.success(message);
}

export function notifyError(message: string | null) {
  return toast.error(
    message || "Something went wrong, please try again or contact support."
  );
}
