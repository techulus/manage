import React from "react";
import { twMerge } from "tailwind-merge";
import { Card } from "../ui/card";

export const ContentBlock = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <Card
    className={twMerge(
      "max-w-7xl rounded-none border-l-0 border-r-0 lg:mx-auto lg:mt-4 lg:rounded-lg lg:border",
      className
    )}
    ref={ref}
    {...props}
  />
));

ContentBlock.displayName = "ContentBlock";
