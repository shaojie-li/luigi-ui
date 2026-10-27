"use client";

import { Button as Primitive } from "@base-ui/react/button";
import { useRef, useState, type ComponentProps } from "react";
import { cn } from "../../_utils/cn.js";
import { Spinner } from "./Spinner.js";

type PrimitiveProps = ComponentProps<typeof Primitive>;

export type ButtonProps = PrimitiveProps & {
  /** 与内部异步状态合并；表单提交状态可由应用控制。 */
  loading?: boolean;
} & (
    | {
        onAsyncClick: (
          event: Parameters<NonNullable<PrimitiveProps["onClick"]>>[0],
        ) => Promise<unknown>;
        onAsyncError: (error: unknown) => void;
      }
    | { onAsyncClick?: never; onAsyncError?: never }
  );

export function Button({
  className = "",
  children,
  disabled = false,
  loading = false,
  focusableWhenDisabled,
  onClick,
  onAsyncClick,
  onAsyncError,
  ...props
}: ButtonProps) {
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);
  const busy = loading || pending;

  const handleClick: NonNullable<PrimitiveProps["onClick"]> = (event) => {
    if (disabled || busy || inFlight.current) {
      event.preventDefault();
      return;
    }

    onClick?.(event);
    if (!onAsyncClick || event.defaultPrevented) return;

    // 异步动作独占这次激活，避免同时触发表单提交。
    event.preventDefault();
    inFlight.current = true;
    setPending(true);
    (async () => {
      try {
        await onAsyncClick(event);
      } finally {
        inFlight.current = false;
        setPending(false);
      }
    })().catch(onAsyncError);
  };

  return (
    <Primitive
      {...props}
      disabled={disabled || busy}
      focusableWhenDisabled={focusableWhenDisabled ?? (busy && !disabled)}
      aria-busy={busy || props["aria-busy"] || false}
      data-loading={busy ? "" : undefined}
      onClick={handleClick}
      className={(state) => {
        let resolvedClassName: string | undefined;
        if (typeof className === "function") {
          resolvedClassName = className(state);
        } else {
          resolvedClassName = className;
        }
        return cn(
          "relative inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition enabled:hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 data-disabled:cursor-not-allowed data-disabled:opacity-40",
          resolvedClassName,
        );
      }}
    >
      <span
        className={cn("inline-flex items-center gap-2", { "opacity-0": busy })}
      >
        {children}
      </span>
      {busy && <Spinner aria-hidden="true" className="absolute" />}
    </Primitive>
  );
}
