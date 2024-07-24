"use client";

import { signIn } from "next-auth/webauthn";
import { Button } from "../ui/button";

export const RegisterPasskeyButton = () => {
  return (
    <Button
      variant="link"
      onClick={() => signIn("passkey", { action: "register" })}
    >
      Register new Passkey (beta)
    </Button>
  );
};
