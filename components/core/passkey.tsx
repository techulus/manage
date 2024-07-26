"use client";

import { signIn } from "next-auth/webauthn";
import { Button } from "../ui/button";

export const RegisterPasskeyButton = () => {
  return (
    <Button
      variant="outline"
      onClick={() => signIn("passkey", { action: "register" })}
    >
      Register new Passkey (beta)
    </Button>
  );
};
