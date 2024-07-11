import { Resend } from "@trigger.dev/resend";

const resend = new Resend({
  id: "resend",
  apiKey: process.env.RESEND_API_KEY!,
});

export default resend;
