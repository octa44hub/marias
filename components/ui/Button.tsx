import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

    const variants = {
      primary:
        "bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500 shadow-sm",
      secondary:
        "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 focus:ring-primary-500 shadow-sm",
      ghost:
        "bg-transparent hover:bg-gray-100 text-gray-700 focus:ring-gray-400",
      danger:
        "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm",
      success:
        "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 shadow-sm",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2.5 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {loading && (
          <div
            className={cn(
              "border-2 border-t-transparent rounded-full animate-spin",
              size === "sm" ? "w-3 h-3" : "w-4 h-4",
              variant === "secondary" || variant === "ghost"
                ? "border-gray-500"
                : "border-white"
            )}
          />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
