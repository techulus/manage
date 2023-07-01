import React from "react";
import { twMerge } from "tailwind-merge";
import { Card } from "../ui/card";

export const ContentBlock = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Card
    className={twMerge(
      "rounded-none border-l-0 border-r-0 xl:border xl:rounded-md xl:mt-4 xl:mx-auto max-w-5xl",
      className
    )}
    ref={ref}
    {...props}
  />
));

ContentBlock.displayName = "ContentBlock";
