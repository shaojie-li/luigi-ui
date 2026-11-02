"use client";

import { tv } from "tailwind-variants/lite";
import { Button as Primitive } from "@base-ui/react/button";
import { useRef, useState, type ComponentProps } from "react";
import { cn } from "../../_utils/cn.js";
import { Spinner } from "../spinner/Spinner.js";

type PrimitiveProps = ComponentProps<typeof Primitive>;

export type ButtonTone =
  "primary" | "neutral" | "success" | "danger" | "warning" | "info" | "accent";
export type ButtonVariant = "solid" | "outline" | "soft" | "text";

const colorVariants: {
  tone: ButtonTone;
  variant: ButtonVariant;
  class: string[];
}[] = [
  {
    tone: "primary",
    variant: "solid",
    class: [
      "lui:bg-ui-primary-solid lui:text-ui-primary-on-solid lui:border-ui-primary-border lui:decoration-ui-primary-on-solid",
      "lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:bg-ui-primary-solid-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:text-ui-primary-on-solid-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:border-ui-primary-border-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:decoration-ui-primary-on-solid-focus",
      "lui:not-data-disabled:not-hover:not-active:aria-pressed:bg-ui-primary-solid-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:text-ui-primary-on-solid-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:border-ui-primary-border-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:decoration-ui-primary-on-solid-selected",
      "lui:not-data-disabled:not-active:hover:bg-ui-primary-solid-hover lui:not-data-disabled:not-active:hover:text-ui-primary-on-solid-hover lui:not-data-disabled:not-active:hover:border-ui-primary-border-hover lui:not-data-disabled:not-active:hover:decoration-ui-primary-on-solid-hover",
      "lui:not-data-disabled:active:bg-ui-primary-solid-active lui:not-data-disabled:active:text-ui-primary-on-solid-active lui:not-data-disabled:active:border-ui-primary-border-active lui:not-data-disabled:active:decoration-ui-primary-on-solid-active",
      "lui:data-disabled:bg-ui-primary-solid-disabled lui:data-disabled:text-ui-primary-on-solid-disabled lui:data-disabled:border-ui-primary-border-disabled lui:data-disabled:decoration-ui-primary-on-solid-disabled",
    ],
  },
  {
    tone: "primary",
    variant: "outline",
    class: [
      "lui:bg-transparent lui:text-ui-primary-text lui:border-ui-primary-border lui:decoration-ui-primary-decoration",
      "lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:bg-ui-primary-subtle-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:text-ui-primary-text-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:border-ui-primary-border-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:decoration-ui-primary-decoration-focus",
      "lui:not-data-disabled:not-hover:not-active:aria-pressed:bg-ui-primary-subtle-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:text-ui-primary-text-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:border-ui-primary-border-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:decoration-ui-primary-decoration-selected",
      "lui:not-data-disabled:not-active:hover:bg-ui-primary-subtle-hover lui:not-data-disabled:not-active:hover:text-ui-primary-text-hover lui:not-data-disabled:not-active:hover:border-ui-primary-border-hover lui:not-data-disabled:not-active:hover:decoration-ui-primary-decoration-hover",
      "lui:not-data-disabled:active:bg-ui-primary-subtle-active lui:not-data-disabled:active:text-ui-primary-text-active lui:not-data-disabled:active:border-ui-primary-border-active lui:not-data-disabled:active:decoration-ui-primary-decoration-active",
      "lui:data-disabled:bg-transparent lui:data-disabled:text-ui-primary-text-disabled lui:data-disabled:border-ui-primary-border-disabled lui:data-disabled:decoration-ui-primary-decoration-disabled",
    ],
  },
  {
    tone: "primary",
    variant: "soft",
    class: [
      "lui:bg-ui-primary-subtle lui:text-ui-primary-text lui:border-transparent lui:decoration-ui-primary-decoration",
      "lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:bg-ui-primary-subtle-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:text-ui-primary-text-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:border-transparent lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:decoration-ui-primary-decoration-focus",
      "lui:not-data-disabled:not-hover:not-active:aria-pressed:bg-ui-primary-subtle-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:text-ui-primary-text-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:border-transparent lui:not-data-disabled:not-hover:not-active:aria-pressed:decoration-ui-primary-decoration-selected",
      "lui:not-data-disabled:not-active:hover:bg-ui-primary-subtle-hover lui:not-data-disabled:not-active:hover:text-ui-primary-text-hover lui:not-data-disabled:not-active:hover:border-transparent lui:not-data-disabled:not-active:hover:decoration-ui-primary-decoration-hover",
      "lui:not-data-disabled:active:bg-ui-primary-subtle-active lui:not-data-disabled:active:text-ui-primary-text-active lui:not-data-disabled:active:border-transparent lui:not-data-disabled:active:decoration-ui-primary-decoration-active",
      "lui:data-disabled:bg-ui-primary-subtle-disabled lui:data-disabled:text-ui-primary-text-disabled lui:data-disabled:border-transparent lui:data-disabled:decoration-ui-primary-decoration-disabled",
    ],
  },
  {
    tone: "primary",
    variant: "text",
    class: [
      "lui:bg-transparent lui:text-ui-primary-text lui:border-transparent lui:decoration-ui-primary-decoration",
      "lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:bg-transparent lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:text-ui-primary-text-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:border-transparent lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:decoration-ui-primary-decoration-focus",
      "lui:not-data-disabled:not-hover:not-active:aria-pressed:bg-transparent lui:not-data-disabled:not-hover:not-active:aria-pressed:text-ui-primary-text-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:border-transparent lui:not-data-disabled:not-hover:not-active:aria-pressed:decoration-ui-primary-decoration-selected",
      "lui:not-data-disabled:not-active:hover:bg-transparent lui:not-data-disabled:not-active:hover:text-ui-primary-text-hover lui:not-data-disabled:not-active:hover:border-transparent lui:not-data-disabled:not-active:hover:decoration-ui-primary-decoration-hover",
      "lui:not-data-disabled:active:bg-transparent lui:not-data-disabled:active:text-ui-primary-text-active lui:not-data-disabled:active:border-transparent lui:not-data-disabled:active:decoration-ui-primary-decoration-active",
      "lui:data-disabled:bg-transparent lui:data-disabled:text-ui-primary-text-disabled lui:data-disabled:border-transparent lui:data-disabled:decoration-ui-primary-decoration-disabled",
    ],
  },
  {
    tone: "neutral",
    variant: "solid",
    class: [
      "lui:bg-ui-neutral-solid lui:text-ui-neutral-on-solid lui:border-ui-neutral-border lui:decoration-ui-neutral-on-solid",
      "lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:bg-ui-neutral-solid-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:text-ui-neutral-on-solid-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:border-ui-neutral-border-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:decoration-ui-neutral-on-solid-focus",
      "lui:not-data-disabled:not-hover:not-active:aria-pressed:bg-ui-neutral-solid-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:text-ui-neutral-on-solid-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:border-ui-neutral-border-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:decoration-ui-neutral-on-solid-selected",
      "lui:not-data-disabled:not-active:hover:bg-ui-neutral-solid-hover lui:not-data-disabled:not-active:hover:text-ui-neutral-on-solid-hover lui:not-data-disabled:not-active:hover:border-ui-neutral-border-hover lui:not-data-disabled:not-active:hover:decoration-ui-neutral-on-solid-hover",
      "lui:not-data-disabled:active:bg-ui-neutral-solid-active lui:not-data-disabled:active:text-ui-neutral-on-solid-active lui:not-data-disabled:active:border-ui-neutral-border-active lui:not-data-disabled:active:decoration-ui-neutral-on-solid-active",
      "lui:data-disabled:bg-ui-neutral-solid-disabled lui:data-disabled:text-ui-neutral-on-solid-disabled lui:data-disabled:border-ui-neutral-border-disabled lui:data-disabled:decoration-ui-neutral-on-solid-disabled",
    ],
  },
  {
    tone: "neutral",
    variant: "outline",
    class: [
      "lui:bg-transparent lui:text-ui-neutral-text lui:border-ui-neutral-border lui:decoration-ui-neutral-decoration",
      "lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:bg-ui-neutral-subtle-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:text-ui-neutral-text-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:border-ui-neutral-border-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:decoration-ui-neutral-decoration-focus",
      "lui:not-data-disabled:not-hover:not-active:aria-pressed:bg-ui-neutral-subtle-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:text-ui-neutral-text-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:border-ui-neutral-border-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:decoration-ui-neutral-decoration-selected",
      "lui:not-data-disabled:not-active:hover:bg-ui-neutral-subtle-hover lui:not-data-disabled:not-active:hover:text-ui-neutral-text-hover lui:not-data-disabled:not-active:hover:border-ui-neutral-border-hover lui:not-data-disabled:not-active:hover:decoration-ui-neutral-decoration-hover",
      "lui:not-data-disabled:active:bg-ui-neutral-subtle-active lui:not-data-disabled:active:text-ui-neutral-text-active lui:not-data-disabled:active:border-ui-neutral-border-active lui:not-data-disabled:active:decoration-ui-neutral-decoration-active",
      "lui:data-disabled:bg-transparent lui:data-disabled:text-ui-neutral-text-disabled lui:data-disabled:border-ui-neutral-border-disabled lui:data-disabled:decoration-ui-neutral-decoration-disabled",
    ],
  },
  {
    tone: "neutral",
    variant: "soft",
    class: [
      "lui:bg-ui-neutral-subtle lui:text-ui-neutral-text lui:border-transparent lui:decoration-ui-neutral-decoration",
      "lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:bg-ui-neutral-subtle-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:text-ui-neutral-text-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:border-transparent lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:decoration-ui-neutral-decoration-focus",
      "lui:not-data-disabled:not-hover:not-active:aria-pressed:bg-ui-neutral-subtle-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:text-ui-neutral-text-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:border-transparent lui:not-data-disabled:not-hover:not-active:aria-pressed:decoration-ui-neutral-decoration-selected",
      "lui:not-data-disabled:not-active:hover:bg-ui-neutral-subtle-hover lui:not-data-disabled:not-active:hover:text-ui-neutral-text-hover lui:not-data-disabled:not-active:hover:border-transparent lui:not-data-disabled:not-active:hover:decoration-ui-neutral-decoration-hover",
      "lui:not-data-disabled:active:bg-ui-neutral-subtle-active lui:not-data-disabled:active:text-ui-neutral-text-active lui:not-data-disabled:active:border-transparent lui:not-data-disabled:active:decoration-ui-neutral-decoration-active",
      "lui:data-disabled:bg-ui-neutral-subtle-disabled lui:data-disabled:text-ui-neutral-text-disabled lui:data-disabled:border-transparent lui:data-disabled:decoration-ui-neutral-decoration-disabled",
    ],
  },
  {
    tone: "neutral",
    variant: "text",
    class: [
      "lui:bg-transparent lui:text-ui-neutral-text lui:border-transparent lui:decoration-ui-neutral-decoration",
      "lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:bg-transparent lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:text-ui-neutral-text-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:border-transparent lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:decoration-ui-neutral-decoration-focus",
      "lui:not-data-disabled:not-hover:not-active:aria-pressed:bg-transparent lui:not-data-disabled:not-hover:not-active:aria-pressed:text-ui-neutral-text-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:border-transparent lui:not-data-disabled:not-hover:not-active:aria-pressed:decoration-ui-neutral-decoration-selected",
      "lui:not-data-disabled:not-active:hover:bg-transparent lui:not-data-disabled:not-active:hover:text-ui-neutral-text-hover lui:not-data-disabled:not-active:hover:border-transparent lui:not-data-disabled:not-active:hover:decoration-ui-neutral-decoration-hover",
      "lui:not-data-disabled:active:bg-transparent lui:not-data-disabled:active:text-ui-neutral-text-active lui:not-data-disabled:active:border-transparent lui:not-data-disabled:active:decoration-ui-neutral-decoration-active",
      "lui:data-disabled:bg-transparent lui:data-disabled:text-ui-neutral-text-disabled lui:data-disabled:border-transparent lui:data-disabled:decoration-ui-neutral-decoration-disabled",
    ],
  },
  {
    tone: "success",
    variant: "solid",
    class: [
      "lui:bg-ui-success-solid lui:text-ui-success-on-solid lui:border-ui-success-border lui:decoration-ui-success-on-solid",
      "lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:bg-ui-success-solid-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:text-ui-success-on-solid-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:border-ui-success-border-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:decoration-ui-success-on-solid-focus",
      "lui:not-data-disabled:not-hover:not-active:aria-pressed:bg-ui-success-solid-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:text-ui-success-on-solid-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:border-ui-success-border-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:decoration-ui-success-on-solid-selected",
      "lui:not-data-disabled:not-active:hover:bg-ui-success-solid-hover lui:not-data-disabled:not-active:hover:text-ui-success-on-solid-hover lui:not-data-disabled:not-active:hover:border-ui-success-border-hover lui:not-data-disabled:not-active:hover:decoration-ui-success-on-solid-hover",
      "lui:not-data-disabled:active:bg-ui-success-solid-active lui:not-data-disabled:active:text-ui-success-on-solid-active lui:not-data-disabled:active:border-ui-success-border-active lui:not-data-disabled:active:decoration-ui-success-on-solid-active",
      "lui:data-disabled:bg-ui-success-solid-disabled lui:data-disabled:text-ui-success-on-solid-disabled lui:data-disabled:border-ui-success-border-disabled lui:data-disabled:decoration-ui-success-on-solid-disabled",
    ],
  },
  {
    tone: "success",
    variant: "outline",
    class: [
      "lui:bg-transparent lui:text-ui-success-text lui:border-ui-success-border lui:decoration-ui-success-decoration",
      "lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:bg-ui-success-subtle-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:text-ui-success-text-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:border-ui-success-border-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:decoration-ui-success-decoration-focus",
      "lui:not-data-disabled:not-hover:not-active:aria-pressed:bg-ui-success-subtle-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:text-ui-success-text-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:border-ui-success-border-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:decoration-ui-success-decoration-selected",
      "lui:not-data-disabled:not-active:hover:bg-ui-success-subtle-hover lui:not-data-disabled:not-active:hover:text-ui-success-text-hover lui:not-data-disabled:not-active:hover:border-ui-success-border-hover lui:not-data-disabled:not-active:hover:decoration-ui-success-decoration-hover",
      "lui:not-data-disabled:active:bg-ui-success-subtle-active lui:not-data-disabled:active:text-ui-success-text-active lui:not-data-disabled:active:border-ui-success-border-active lui:not-data-disabled:active:decoration-ui-success-decoration-active",
      "lui:data-disabled:bg-transparent lui:data-disabled:text-ui-success-text-disabled lui:data-disabled:border-ui-success-border-disabled lui:data-disabled:decoration-ui-success-decoration-disabled",
    ],
  },
  {
    tone: "success",
    variant: "soft",
    class: [
      "lui:bg-ui-success-subtle lui:text-ui-success-text lui:border-transparent lui:decoration-ui-success-decoration",
      "lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:bg-ui-success-subtle-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:text-ui-success-text-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:border-transparent lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:decoration-ui-success-decoration-focus",
      "lui:not-data-disabled:not-hover:not-active:aria-pressed:bg-ui-success-subtle-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:text-ui-success-text-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:border-transparent lui:not-data-disabled:not-hover:not-active:aria-pressed:decoration-ui-success-decoration-selected",
      "lui:not-data-disabled:not-active:hover:bg-ui-success-subtle-hover lui:not-data-disabled:not-active:hover:text-ui-success-text-hover lui:not-data-disabled:not-active:hover:border-transparent lui:not-data-disabled:not-active:hover:decoration-ui-success-decoration-hover",
      "lui:not-data-disabled:active:bg-ui-success-subtle-active lui:not-data-disabled:active:text-ui-success-text-active lui:not-data-disabled:active:border-transparent lui:not-data-disabled:active:decoration-ui-success-decoration-active",
      "lui:data-disabled:bg-ui-success-subtle-disabled lui:data-disabled:text-ui-success-text-disabled lui:data-disabled:border-transparent lui:data-disabled:decoration-ui-success-decoration-disabled",
    ],
  },
  {
    tone: "success",
    variant: "text",
    class: [
      "lui:bg-transparent lui:text-ui-success-text lui:border-transparent lui:decoration-ui-success-decoration",
      "lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:bg-transparent lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:text-ui-success-text-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:border-transparent lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:decoration-ui-success-decoration-focus",
      "lui:not-data-disabled:not-hover:not-active:aria-pressed:bg-transparent lui:not-data-disabled:not-hover:not-active:aria-pressed:text-ui-success-text-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:border-transparent lui:not-data-disabled:not-hover:not-active:aria-pressed:decoration-ui-success-decoration-selected",
      "lui:not-data-disabled:not-active:hover:bg-transparent lui:not-data-disabled:not-active:hover:text-ui-success-text-hover lui:not-data-disabled:not-active:hover:border-transparent lui:not-data-disabled:not-active:hover:decoration-ui-success-decoration-hover",
      "lui:not-data-disabled:active:bg-transparent lui:not-data-disabled:active:text-ui-success-text-active lui:not-data-disabled:active:border-transparent lui:not-data-disabled:active:decoration-ui-success-decoration-active",
      "lui:data-disabled:bg-transparent lui:data-disabled:text-ui-success-text-disabled lui:data-disabled:border-transparent lui:data-disabled:decoration-ui-success-decoration-disabled",
    ],
  },
  {
    tone: "danger",
    variant: "solid",
    class: [
      "lui:bg-ui-danger-solid lui:text-ui-danger-on-solid lui:border-ui-danger-border lui:decoration-ui-danger-on-solid",
      "lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:bg-ui-danger-solid-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:text-ui-danger-on-solid-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:border-ui-danger-border-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:decoration-ui-danger-on-solid-focus",
      "lui:not-data-disabled:not-hover:not-active:aria-pressed:bg-ui-danger-solid-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:text-ui-danger-on-solid-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:border-ui-danger-border-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:decoration-ui-danger-on-solid-selected",
      "lui:not-data-disabled:not-active:hover:bg-ui-danger-solid-hover lui:not-data-disabled:not-active:hover:text-ui-danger-on-solid-hover lui:not-data-disabled:not-active:hover:border-ui-danger-border-hover lui:not-data-disabled:not-active:hover:decoration-ui-danger-on-solid-hover",
      "lui:not-data-disabled:active:bg-ui-danger-solid-active lui:not-data-disabled:active:text-ui-danger-on-solid-active lui:not-data-disabled:active:border-ui-danger-border-active lui:not-data-disabled:active:decoration-ui-danger-on-solid-active",
      "lui:data-disabled:bg-ui-danger-solid-disabled lui:data-disabled:text-ui-danger-on-solid-disabled lui:data-disabled:border-ui-danger-border-disabled lui:data-disabled:decoration-ui-danger-on-solid-disabled",
    ],
  },
  {
    tone: "danger",
    variant: "outline",
    class: [
      "lui:bg-transparent lui:text-ui-danger-text lui:border-ui-danger-border lui:decoration-ui-danger-decoration",
      "lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:bg-ui-danger-subtle-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:text-ui-danger-text-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:border-ui-danger-border-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:decoration-ui-danger-decoration-focus",
      "lui:not-data-disabled:not-hover:not-active:aria-pressed:bg-ui-danger-subtle-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:text-ui-danger-text-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:border-ui-danger-border-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:decoration-ui-danger-decoration-selected",
      "lui:not-data-disabled:not-active:hover:bg-ui-danger-subtle-hover lui:not-data-disabled:not-active:hover:text-ui-danger-text-hover lui:not-data-disabled:not-active:hover:border-ui-danger-border-hover lui:not-data-disabled:not-active:hover:decoration-ui-danger-decoration-hover",
      "lui:not-data-disabled:active:bg-ui-danger-subtle-active lui:not-data-disabled:active:text-ui-danger-text-active lui:not-data-disabled:active:border-ui-danger-border-active lui:not-data-disabled:active:decoration-ui-danger-decoration-active",
      "lui:data-disabled:bg-transparent lui:data-disabled:text-ui-danger-text-disabled lui:data-disabled:border-ui-danger-border-disabled lui:data-disabled:decoration-ui-danger-decoration-disabled",
    ],
  },
  {
    tone: "danger",
    variant: "soft",
    class: [
      "lui:bg-ui-danger-subtle lui:text-ui-danger-text lui:border-transparent lui:decoration-ui-danger-decoration",
      "lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:bg-ui-danger-subtle-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:text-ui-danger-text-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:border-transparent lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:decoration-ui-danger-decoration-focus",
      "lui:not-data-disabled:not-hover:not-active:aria-pressed:bg-ui-danger-subtle-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:text-ui-danger-text-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:border-transparent lui:not-data-disabled:not-hover:not-active:aria-pressed:decoration-ui-danger-decoration-selected",
      "lui:not-data-disabled:not-active:hover:bg-ui-danger-subtle-hover lui:not-data-disabled:not-active:hover:text-ui-danger-text-hover lui:not-data-disabled:not-active:hover:border-transparent lui:not-data-disabled:not-active:hover:decoration-ui-danger-decoration-hover",
      "lui:not-data-disabled:active:bg-ui-danger-subtle-active lui:not-data-disabled:active:text-ui-danger-text-active lui:not-data-disabled:active:border-transparent lui:not-data-disabled:active:decoration-ui-danger-decoration-active",
      "lui:data-disabled:bg-ui-danger-subtle-disabled lui:data-disabled:text-ui-danger-text-disabled lui:data-disabled:border-transparent lui:data-disabled:decoration-ui-danger-decoration-disabled",
    ],
  },
  {
    tone: "danger",
    variant: "text",
    class: [
      "lui:bg-transparent lui:text-ui-danger-text lui:border-transparent lui:decoration-ui-danger-decoration",
      "lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:bg-transparent lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:text-ui-danger-text-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:border-transparent lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:decoration-ui-danger-decoration-focus",
      "lui:not-data-disabled:not-hover:not-active:aria-pressed:bg-transparent lui:not-data-disabled:not-hover:not-active:aria-pressed:text-ui-danger-text-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:border-transparent lui:not-data-disabled:not-hover:not-active:aria-pressed:decoration-ui-danger-decoration-selected",
      "lui:not-data-disabled:not-active:hover:bg-transparent lui:not-data-disabled:not-active:hover:text-ui-danger-text-hover lui:not-data-disabled:not-active:hover:border-transparent lui:not-data-disabled:not-active:hover:decoration-ui-danger-decoration-hover",
      "lui:not-data-disabled:active:bg-transparent lui:not-data-disabled:active:text-ui-danger-text-active lui:not-data-disabled:active:border-transparent lui:not-data-disabled:active:decoration-ui-danger-decoration-active",
      "lui:data-disabled:bg-transparent lui:data-disabled:text-ui-danger-text-disabled lui:data-disabled:border-transparent lui:data-disabled:decoration-ui-danger-decoration-disabled",
    ],
  },
  {
    tone: "warning",
    variant: "solid",
    class: [
      "lui:bg-ui-warning-solid lui:text-ui-warning-on-solid lui:border-ui-warning-border lui:decoration-ui-warning-on-solid",
      "lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:bg-ui-warning-solid-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:text-ui-warning-on-solid-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:border-ui-warning-border-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:decoration-ui-warning-on-solid-focus",
      "lui:not-data-disabled:not-hover:not-active:aria-pressed:bg-ui-warning-solid-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:text-ui-warning-on-solid-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:border-ui-warning-border-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:decoration-ui-warning-on-solid-selected",
      "lui:not-data-disabled:not-active:hover:bg-ui-warning-solid-hover lui:not-data-disabled:not-active:hover:text-ui-warning-on-solid-hover lui:not-data-disabled:not-active:hover:border-ui-warning-border-hover lui:not-data-disabled:not-active:hover:decoration-ui-warning-on-solid-hover",
      "lui:not-data-disabled:active:bg-ui-warning-solid-active lui:not-data-disabled:active:text-ui-warning-on-solid-active lui:not-data-disabled:active:border-ui-warning-border-active lui:not-data-disabled:active:decoration-ui-warning-on-solid-active",
      "lui:data-disabled:bg-ui-warning-solid-disabled lui:data-disabled:text-ui-warning-on-solid-disabled lui:data-disabled:border-ui-warning-border-disabled lui:data-disabled:decoration-ui-warning-on-solid-disabled",
    ],
  },
  {
    tone: "warning",
    variant: "outline",
    class: [
      "lui:bg-transparent lui:text-ui-warning-text lui:border-ui-warning-border lui:decoration-ui-warning-decoration",
      "lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:bg-ui-warning-subtle-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:text-ui-warning-text-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:border-ui-warning-border-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:decoration-ui-warning-decoration-focus",
      "lui:not-data-disabled:not-hover:not-active:aria-pressed:bg-ui-warning-subtle-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:text-ui-warning-text-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:border-ui-warning-border-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:decoration-ui-warning-decoration-selected",
      "lui:not-data-disabled:not-active:hover:bg-ui-warning-subtle-hover lui:not-data-disabled:not-active:hover:text-ui-warning-text-hover lui:not-data-disabled:not-active:hover:border-ui-warning-border-hover lui:not-data-disabled:not-active:hover:decoration-ui-warning-decoration-hover",
      "lui:not-data-disabled:active:bg-ui-warning-subtle-active lui:not-data-disabled:active:text-ui-warning-text-active lui:not-data-disabled:active:border-ui-warning-border-active lui:not-data-disabled:active:decoration-ui-warning-decoration-active",
      "lui:data-disabled:bg-transparent lui:data-disabled:text-ui-warning-text-disabled lui:data-disabled:border-ui-warning-border-disabled lui:data-disabled:decoration-ui-warning-decoration-disabled",
    ],
  },
  {
    tone: "warning",
    variant: "soft",
    class: [
      "lui:bg-ui-warning-subtle lui:text-ui-warning-text lui:border-transparent lui:decoration-ui-warning-decoration",
      "lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:bg-ui-warning-subtle-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:text-ui-warning-text-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:border-transparent lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:decoration-ui-warning-decoration-focus",
      "lui:not-data-disabled:not-hover:not-active:aria-pressed:bg-ui-warning-subtle-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:text-ui-warning-text-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:border-transparent lui:not-data-disabled:not-hover:not-active:aria-pressed:decoration-ui-warning-decoration-selected",
      "lui:not-data-disabled:not-active:hover:bg-ui-warning-subtle-hover lui:not-data-disabled:not-active:hover:text-ui-warning-text-hover lui:not-data-disabled:not-active:hover:border-transparent lui:not-data-disabled:not-active:hover:decoration-ui-warning-decoration-hover",
      "lui:not-data-disabled:active:bg-ui-warning-subtle-active lui:not-data-disabled:active:text-ui-warning-text-active lui:not-data-disabled:active:border-transparent lui:not-data-disabled:active:decoration-ui-warning-decoration-active",
      "lui:data-disabled:bg-ui-warning-subtle-disabled lui:data-disabled:text-ui-warning-text-disabled lui:data-disabled:border-transparent lui:data-disabled:decoration-ui-warning-decoration-disabled",
    ],
  },
  {
    tone: "warning",
    variant: "text",
    class: [
      "lui:bg-transparent lui:text-ui-warning-text lui:border-transparent lui:decoration-ui-warning-decoration",
      "lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:bg-transparent lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:text-ui-warning-text-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:border-transparent lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:decoration-ui-warning-decoration-focus",
      "lui:not-data-disabled:not-hover:not-active:aria-pressed:bg-transparent lui:not-data-disabled:not-hover:not-active:aria-pressed:text-ui-warning-text-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:border-transparent lui:not-data-disabled:not-hover:not-active:aria-pressed:decoration-ui-warning-decoration-selected",
      "lui:not-data-disabled:not-active:hover:bg-transparent lui:not-data-disabled:not-active:hover:text-ui-warning-text-hover lui:not-data-disabled:not-active:hover:border-transparent lui:not-data-disabled:not-active:hover:decoration-ui-warning-decoration-hover",
      "lui:not-data-disabled:active:bg-transparent lui:not-data-disabled:active:text-ui-warning-text-active lui:not-data-disabled:active:border-transparent lui:not-data-disabled:active:decoration-ui-warning-decoration-active",
      "lui:data-disabled:bg-transparent lui:data-disabled:text-ui-warning-text-disabled lui:data-disabled:border-transparent lui:data-disabled:decoration-ui-warning-decoration-disabled",
    ],
  },
  {
    tone: "info",
    variant: "solid",
    class: [
      "lui:bg-ui-info-solid lui:text-ui-info-on-solid lui:border-ui-info-border lui:decoration-ui-info-on-solid",
      "lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:bg-ui-info-solid-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:text-ui-info-on-solid-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:border-ui-info-border-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:decoration-ui-info-on-solid-focus",
      "lui:not-data-disabled:not-hover:not-active:aria-pressed:bg-ui-info-solid-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:text-ui-info-on-solid-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:border-ui-info-border-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:decoration-ui-info-on-solid-selected",
      "lui:not-data-disabled:not-active:hover:bg-ui-info-solid-hover lui:not-data-disabled:not-active:hover:text-ui-info-on-solid-hover lui:not-data-disabled:not-active:hover:border-ui-info-border-hover lui:not-data-disabled:not-active:hover:decoration-ui-info-on-solid-hover",
      "lui:not-data-disabled:active:bg-ui-info-solid-active lui:not-data-disabled:active:text-ui-info-on-solid-active lui:not-data-disabled:active:border-ui-info-border-active lui:not-data-disabled:active:decoration-ui-info-on-solid-active",
      "lui:data-disabled:bg-ui-info-solid-disabled lui:data-disabled:text-ui-info-on-solid-disabled lui:data-disabled:border-ui-info-border-disabled lui:data-disabled:decoration-ui-info-on-solid-disabled",
    ],
  },
  {
    tone: "info",
    variant: "outline",
    class: [
      "lui:bg-transparent lui:text-ui-info-text lui:border-ui-info-border lui:decoration-ui-info-decoration",
      "lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:bg-ui-info-subtle-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:text-ui-info-text-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:border-ui-info-border-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:decoration-ui-info-decoration-focus",
      "lui:not-data-disabled:not-hover:not-active:aria-pressed:bg-ui-info-subtle-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:text-ui-info-text-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:border-ui-info-border-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:decoration-ui-info-decoration-selected",
      "lui:not-data-disabled:not-active:hover:bg-ui-info-subtle-hover lui:not-data-disabled:not-active:hover:text-ui-info-text-hover lui:not-data-disabled:not-active:hover:border-ui-info-border-hover lui:not-data-disabled:not-active:hover:decoration-ui-info-decoration-hover",
      "lui:not-data-disabled:active:bg-ui-info-subtle-active lui:not-data-disabled:active:text-ui-info-text-active lui:not-data-disabled:active:border-ui-info-border-active lui:not-data-disabled:active:decoration-ui-info-decoration-active",
      "lui:data-disabled:bg-transparent lui:data-disabled:text-ui-info-text-disabled lui:data-disabled:border-ui-info-border-disabled lui:data-disabled:decoration-ui-info-decoration-disabled",
    ],
  },
  {
    tone: "info",
    variant: "soft",
    class: [
      "lui:bg-ui-info-subtle lui:text-ui-info-text lui:border-transparent lui:decoration-ui-info-decoration",
      "lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:bg-ui-info-subtle-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:text-ui-info-text-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:border-transparent lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:decoration-ui-info-decoration-focus",
      "lui:not-data-disabled:not-hover:not-active:aria-pressed:bg-ui-info-subtle-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:text-ui-info-text-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:border-transparent lui:not-data-disabled:not-hover:not-active:aria-pressed:decoration-ui-info-decoration-selected",
      "lui:not-data-disabled:not-active:hover:bg-ui-info-subtle-hover lui:not-data-disabled:not-active:hover:text-ui-info-text-hover lui:not-data-disabled:not-active:hover:border-transparent lui:not-data-disabled:not-active:hover:decoration-ui-info-decoration-hover",
      "lui:not-data-disabled:active:bg-ui-info-subtle-active lui:not-data-disabled:active:text-ui-info-text-active lui:not-data-disabled:active:border-transparent lui:not-data-disabled:active:decoration-ui-info-decoration-active",
      "lui:data-disabled:bg-ui-info-subtle-disabled lui:data-disabled:text-ui-info-text-disabled lui:data-disabled:border-transparent lui:data-disabled:decoration-ui-info-decoration-disabled",
    ],
  },
  {
    tone: "info",
    variant: "text",
    class: [
      "lui:bg-transparent lui:text-ui-info-text lui:border-transparent lui:decoration-ui-info-decoration",
      "lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:bg-transparent lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:text-ui-info-text-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:border-transparent lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:decoration-ui-info-decoration-focus",
      "lui:not-data-disabled:not-hover:not-active:aria-pressed:bg-transparent lui:not-data-disabled:not-hover:not-active:aria-pressed:text-ui-info-text-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:border-transparent lui:not-data-disabled:not-hover:not-active:aria-pressed:decoration-ui-info-decoration-selected",
      "lui:not-data-disabled:not-active:hover:bg-transparent lui:not-data-disabled:not-active:hover:text-ui-info-text-hover lui:not-data-disabled:not-active:hover:border-transparent lui:not-data-disabled:not-active:hover:decoration-ui-info-decoration-hover",
      "lui:not-data-disabled:active:bg-transparent lui:not-data-disabled:active:text-ui-info-text-active lui:not-data-disabled:active:border-transparent lui:not-data-disabled:active:decoration-ui-info-decoration-active",
      "lui:data-disabled:bg-transparent lui:data-disabled:text-ui-info-text-disabled lui:data-disabled:border-transparent lui:data-disabled:decoration-ui-info-decoration-disabled",
    ],
  },
  {
    tone: "accent",
    variant: "solid",
    class: [
      "lui:bg-ui-accent-solid lui:text-ui-accent-on-solid lui:border-ui-accent-border lui:decoration-ui-accent-on-solid",
      "lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:bg-ui-accent-solid-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:text-ui-accent-on-solid-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:border-ui-accent-border-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:decoration-ui-accent-on-solid-focus",
      "lui:not-data-disabled:not-hover:not-active:aria-pressed:bg-ui-accent-solid-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:text-ui-accent-on-solid-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:border-ui-accent-border-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:decoration-ui-accent-on-solid-selected",
      "lui:not-data-disabled:not-active:hover:bg-ui-accent-solid-hover lui:not-data-disabled:not-active:hover:text-ui-accent-on-solid-hover lui:not-data-disabled:not-active:hover:border-ui-accent-border-hover lui:not-data-disabled:not-active:hover:decoration-ui-accent-on-solid-hover",
      "lui:not-data-disabled:active:bg-ui-accent-solid-active lui:not-data-disabled:active:text-ui-accent-on-solid-active lui:not-data-disabled:active:border-ui-accent-border-active lui:not-data-disabled:active:decoration-ui-accent-on-solid-active",
      "lui:data-disabled:bg-ui-accent-solid-disabled lui:data-disabled:text-ui-accent-on-solid-disabled lui:data-disabled:border-ui-accent-border-disabled lui:data-disabled:decoration-ui-accent-on-solid-disabled",
    ],
  },
  {
    tone: "accent",
    variant: "outline",
    class: [
      "lui:bg-transparent lui:text-ui-accent-text lui:border-ui-accent-border lui:decoration-ui-accent-decoration",
      "lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:bg-ui-accent-subtle-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:text-ui-accent-text-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:border-ui-accent-border-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:decoration-ui-accent-decoration-focus",
      "lui:not-data-disabled:not-hover:not-active:aria-pressed:bg-ui-accent-subtle-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:text-ui-accent-text-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:border-ui-accent-border-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:decoration-ui-accent-decoration-selected",
      "lui:not-data-disabled:not-active:hover:bg-ui-accent-subtle-hover lui:not-data-disabled:not-active:hover:text-ui-accent-text-hover lui:not-data-disabled:not-active:hover:border-ui-accent-border-hover lui:not-data-disabled:not-active:hover:decoration-ui-accent-decoration-hover",
      "lui:not-data-disabled:active:bg-ui-accent-subtle-active lui:not-data-disabled:active:text-ui-accent-text-active lui:not-data-disabled:active:border-ui-accent-border-active lui:not-data-disabled:active:decoration-ui-accent-decoration-active",
      "lui:data-disabled:bg-transparent lui:data-disabled:text-ui-accent-text-disabled lui:data-disabled:border-ui-accent-border-disabled lui:data-disabled:decoration-ui-accent-decoration-disabled",
    ],
  },
  {
    tone: "accent",
    variant: "soft",
    class: [
      "lui:bg-ui-accent-subtle lui:text-ui-accent-text lui:border-transparent lui:decoration-ui-accent-decoration",
      "lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:bg-ui-accent-subtle-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:text-ui-accent-text-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:border-transparent lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:decoration-ui-accent-decoration-focus",
      "lui:not-data-disabled:not-hover:not-active:aria-pressed:bg-ui-accent-subtle-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:text-ui-accent-text-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:border-transparent lui:not-data-disabled:not-hover:not-active:aria-pressed:decoration-ui-accent-decoration-selected",
      "lui:not-data-disabled:not-active:hover:bg-ui-accent-subtle-hover lui:not-data-disabled:not-active:hover:text-ui-accent-text-hover lui:not-data-disabled:not-active:hover:border-transparent lui:not-data-disabled:not-active:hover:decoration-ui-accent-decoration-hover",
      "lui:not-data-disabled:active:bg-ui-accent-subtle-active lui:not-data-disabled:active:text-ui-accent-text-active lui:not-data-disabled:active:border-transparent lui:not-data-disabled:active:decoration-ui-accent-decoration-active",
      "lui:data-disabled:bg-ui-accent-subtle-disabled lui:data-disabled:text-ui-accent-text-disabled lui:data-disabled:border-transparent lui:data-disabled:decoration-ui-accent-decoration-disabled",
    ],
  },
  {
    tone: "accent",
    variant: "text",
    class: [
      "lui:bg-transparent lui:text-ui-accent-text lui:border-transparent lui:decoration-ui-accent-decoration",
      "lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:bg-transparent lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:text-ui-accent-text-focus lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:border-transparent lui:not-data-disabled:not-hover:not-active:not-aria-pressed:focus-visible:decoration-ui-accent-decoration-focus",
      "lui:not-data-disabled:not-hover:not-active:aria-pressed:bg-transparent lui:not-data-disabled:not-hover:not-active:aria-pressed:text-ui-accent-text-selected lui:not-data-disabled:not-hover:not-active:aria-pressed:border-transparent lui:not-data-disabled:not-hover:not-active:aria-pressed:decoration-ui-accent-decoration-selected",
      "lui:not-data-disabled:not-active:hover:bg-transparent lui:not-data-disabled:not-active:hover:text-ui-accent-text-hover lui:not-data-disabled:not-active:hover:border-transparent lui:not-data-disabled:not-active:hover:decoration-ui-accent-decoration-hover",
      "lui:not-data-disabled:active:bg-transparent lui:not-data-disabled:active:text-ui-accent-text-active lui:not-data-disabled:active:border-transparent lui:not-data-disabled:active:decoration-ui-accent-decoration-active",
      "lui:data-disabled:bg-transparent lui:data-disabled:text-ui-accent-text-disabled lui:data-disabled:border-transparent lui:data-disabled:decoration-ui-accent-decoration-disabled",
    ],
  },
];

// 样式与组件共置；互斥状态让 active > hover > selected > focus，禁用态独立。
const buttonStyles = tv({
  base: [
    "lui-button lui:relative lui:inline-flex lui:box-border lui:appearance-none lui:m-0 lui:cursor-pointer lui:items-center lui:justify-center lui:gap-2 lui:rounded-lg lui:px-4 lui:py-2.5",
    "lui:[border-width:1px] lui:[border-style:solid] lui:[font-family:inherit] lui:text-[0.875rem] lui:[line-height:1.25] lui:[font-weight:500] lui:align-middle lui:no-underline lui:decoration-1 lui:underline-offset-[0.2em]",
    "lui:[transition:background-color_150ms,color_150ms,border-color_150ms,text-decoration-color_150ms] lui:motion-reduce:transition-none lui:data-disabled:cursor-not-allowed lui:focus-visible:[outline-style:solid] lui:focus-visible:[outline-width:2px] lui:focus-visible:outline-offset-2",
  ],
  variants: {
    tone: {
      primary: "lui:focus-visible:outline-ui-primary-focus-ring",
      neutral: "lui:focus-visible:outline-ui-neutral-focus-ring",
      success: "lui:focus-visible:outline-ui-success-focus-ring",
      danger: "lui:focus-visible:outline-ui-danger-focus-ring",
      warning: "lui:focus-visible:outline-ui-warning-focus-ring",
      info: "lui:focus-visible:outline-ui-info-focus-ring",
      accent: "lui:focus-visible:outline-ui-accent-focus-ring",
    },
    variant: {
      solid: "",
      outline: "",
      soft: "",
      text: "lui:not-data-disabled:hover:underline lui:not-data-disabled:active:underline lui:not-data-disabled:focus-visible:underline lui:not-data-disabled:aria-pressed:underline",
    },
  },
  compoundVariants: colorVariants,
  defaultVariants: { tone: "primary", variant: "solid" },
});

export type ButtonProps = PrimitiveProps & {
  /** 语义颜色，随主题与明暗模式切换。 */
  tone?: ButtonTone;
  /** 实心、描边、弱化背景或文字外观。 */
  variant?: ButtonVariant;
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
  tone = "primary",
  variant = "solid",
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
      data-tone={tone}
      data-variant={variant}
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
        return cn(buttonStyles({ tone, variant }), resolvedClassName);
      }}
    >
      <span
        className={cn(
          "lui-button-label lui:inline-flex lui:items-center lui:gap-2",
          { "lui:opacity-0": busy },
        )}
      >
        {children}
      </span>
      {busy && <Spinner aria-hidden="true" className="lui:absolute" />}
    </Primitive>
  );
}
