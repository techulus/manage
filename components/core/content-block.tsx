import React from "react";
import { Card } from "../ui/card";
import { twMerge } from "tailwind-merge";

export const ContentBlock = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Card
    className={twMerge(
      "rounded-none border-l-0 border-r-0 xl:border xl:rounded-md xl:mt-4 xl:mx-auto max-w-7xl",
      className
    )}
    ref={ref}
    {...props}
  />
));

ContentBlock.displayName = "ContentBlock";
