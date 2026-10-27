import { LoaderCircle } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../../_utils/cn.js";

export type SpinnerProps = ComponentProps<typeof LoaderCircle>;

export function Spinner({
  className = "",
  size = 16,
  role = "status",
  "aria-label": ariaLabel = "加载中",
  ...props
}: SpinnerProps) {
  return (
    <LoaderCircle
      size={size}
      role={role}
      aria-label={ariaLabel}
      className={cn(
        "shrink-0 animate-spin motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}
