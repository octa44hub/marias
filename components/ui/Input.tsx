"use client";

import { InputHTMLAttributes, forwardRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { parseCurrencyInput, formatCurrencyInput } from "@/lib/formatters";

// ─── Input Padrão ─────────────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full px-3.5 py-2.5 rounded-xl border text-gray-900 placeholder:text-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
              "transition-shadow text-base disabled:bg-gray-50 disabled:text-gray-500",
              error
                ? "border-red-300 bg-red-50 focus:ring-red-400"
                : "border-gray-200 bg-white",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="mt-1 text-xs text-gray-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

// ─── Input Monetário ──────────────────────────────────────────────────────────

interface MoneyInputProps {
  label?: string;
  value: number; // centavos
  onChange: (centavos: number) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export function MoneyInput({
  label,
  value,
  onChange,
  error,
  hint,
  placeholder = "0,00",
  disabled,
  className,
  id,
}: MoneyInputProps) {
  const inputId = id || `money-${Math.random().toString(36).slice(2)}`;
  const [inputValue, setInputValue] = useState(formatCurrencyInput(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setInputValue(formatCurrencyInput(value));
    }
  }, [value, focused]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/[^\d,]/g, "");
    // Limita a uma vírgula
    const parts = raw.split(",");
    const normalized =
      parts.length > 2
        ? parts[0] + "," + parts.slice(1).join("")
        : raw;
    setInputValue(normalized);

    const centavos = parseCurrencyInput(normalized);
    onChange(centavos);
  }

  function handleFocus() {
    setFocused(true);
    // Mostra apenas o número sem símbolo ao editar
    setInputValue(formatCurrencyInput(value));
  }

  function handleBlur() {
    setFocused(false);
    const centavos = parseCurrencyInput(inputValue);
    onChange(centavos);
    setInputValue(formatCurrencyInput(centavos));
  }

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm pointer-events-none">
          R$
        </span>
        <input
          id={inputId}
          type="text"
          inputMode="decimal"
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-gray-900 placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
            "transition-shadow text-base disabled:bg-gray-50 disabled:text-gray-500",
            error
              ? "border-red-300 bg-red-50 focus:ring-red-400"
              : "border-gray-200 bg-white",
            className
          )}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, placeholder, children, className, id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).slice(2)}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "w-full px-3.5 py-2.5 rounded-xl border text-gray-900",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
            "transition-shadow text-base bg-white disabled:bg-gray-50 disabled:text-gray-500",
            "appearance-none cursor-pointer",
            error ? "border-red-300 bg-red-50" : "border-gray-200",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
