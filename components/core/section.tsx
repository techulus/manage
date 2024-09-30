import { cn } from "@/lib/utils";

export default function PageSection({
  children,
  className,
  topInset = false,
  bottomMargin = true,
}: {
  children: React.ReactNode;
  className?: string;
  topInset?: boolean;
  bottomMargin?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-4 flex max-w-5xl flex-col divide-y rounded-lg border bg-white dark:bg-gray-950 lg:mx-auto",
        topInset ? "-mt-6" : "",
        bottomMargin ? "mb-6" : "",
        className
      )}
    >
      {children}
    </div>
  );
}
