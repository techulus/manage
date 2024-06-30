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
        "mx-auto flex max-w-5xl flex-col bg-white dark:bg-gray-950 lg:divide-y lg:rounded-lg lg:border",
        topInset ? "lg:-mt-6" : "",
        bottomMargin ? "mb-6 xl:mb-12" : "",
        className
      )}
    >
      {children}
    </div>
  );
}
