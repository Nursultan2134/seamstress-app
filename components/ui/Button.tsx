import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-gray-900 text-white hover:bg-gray-700 disabled:bg-gray-300 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white dark:disabled:bg-gray-700 dark:disabled:text-gray-400",
  secondary:
    "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 disabled:text-gray-400 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 dark:disabled:text-gray-500",
  danger:
    "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300 dark:bg-red-700 dark:hover:bg-red-600 dark:disabled:bg-red-900",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant };

export function Button({ variant = "primary", className = "", ...props }: Props) {
  return (
    <button
      className={`rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
