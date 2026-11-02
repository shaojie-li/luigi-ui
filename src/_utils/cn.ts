import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge, twMerge } from "tailwind-merge";

const mergeLibraryClasses = extendTailwindMerge({ prefix: "lui" });

export function cn(...inputs: ClassValue[]): string {
  return mergeLibraryClasses(twMerge(clsx(inputs)));
}
