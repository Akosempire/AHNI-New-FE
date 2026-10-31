"use client";

import { FC, InputHTMLAttributes, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useDisableNumberInputScroll } from "../hooks/useDisableNumberInputScroll";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Mail } from "lucide-react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
}

const FormInput: FC<InputProps> = ({ name, label, disabled, ...rest }) => {
  const [isPasswordVisible, setPasswordVisibility] = useState(false);
  const { control, trigger } = useFormContext();

  const { type, required } = rest;

  useDisableNumberInputScroll();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const { value, onChange } = field;
        const money =
          type === "number" &&
          /amount|cost|price|budget|total|salary|fee|rate|value|balance/i.test(name) &&
          typeof value === "number" &&
          Math.abs(value) >= 1000;
        return (
          <FormItem className='flex flex-col gap-0'>
            <FormLabel className={`mb-1.5 ${required ? 'required' : ''}`}>
              {label}
            </FormLabel>
            <div className='relative'>
              <FormControl>
                <Input
                  type={
                    type === "password"
                      ? isPasswordVisible
                        ? "text"
                        : "password"
                      : type
                  }
                  placeholder={rest.placeholder}
                  autoComplete={(rest as any).autoComplete}
                  name={field.name}
                  ref={field.ref}
                  onBlur={(e) => {
                    // Postel's law: accept messy input, store it tidy
                    if (typeof value === "string" && type !== "password") {
                      let tidy = value.trim();
                      if (type === "email") tidy = tidy.toLowerCase();
                      if (type === "tel") tidy = tidy.replace(/[\s().-]/g, "");
                      if (tidy !== value) onChange(tidy);
                    }
                    field.onBlur();
                    // Check filled-in fields as soon as the user leaves them
                    if (value !== undefined && value !== "" && value !== null) trigger(name);
                    rest.onBlur?.(e);
                  }}
                  aria-required={required || undefined}
                  disabled={disabled}
                  onChange={(e) => {
                    // Convert to number for number inputs
                    if (type === 'number') {
                      const stringValue = e.target.value;
                      if (stringValue === '' || stringValue === null || stringValue === undefined) {
                        onChange(undefined); // Let validation handle empty values
                      } else {
                        const numericValue = parseFloat(stringValue);
                        // Only set valid numbers, otherwise keep as undefined
                        onChange(isNaN(numericValue) ? undefined : numericValue);
                      }
                    } else {
                      onChange(e);
                    }
                    // Once a field shows an error, re-check as the user types so it clears immediately
                    if (fieldState.error) setTimeout(() => trigger(name), 0);
                  }}
                  inputMode={type === "number" ? "decimal" : type === "tel" ? "tel" : rest.inputMode}
                  aria-invalid={!!fieldState.error || undefined}
                  value={value ?? ""} // Ensure value is never undefined (0 still shows)
                  className={cn(
                    "font-medium bg-gray-100 dark:bg-background placeholder:text-black/30 dark:placeholder:text-muted-foreground",
                    rest.className
                  )}
                />
              </FormControl>
                {rest.type === "password" && (
                  <button
                    type='button'
                    className='absolute top-1/2 right-2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:text-foreground'
                    onClick={() => setPasswordVisibility(!isPasswordVisible)}
                    aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                    aria-pressed={isPasswordVisible}
                  >
                    {isPasswordVisible ? (
                      <EyeOff aria-hidden='true' className='h-5 w-5' />
                    ) : (
                      <Eye aria-hidden='true' className='h-5 w-5' />
                    )}
                  </button>
                )}

                {rest.type === "email" && (
                  <div aria-hidden='true' className='pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground'>
                    <Mail className='h-5 w-5' />
                  </div>
                )}
            </div>
            {money && !fieldState.error && (
              <p className='ux-hint' aria-live='polite'>
                Reads as {Number(value).toLocaleString("en-NG", { maximumFractionDigits: 2 })}
              </p>
            )}
            <FormMessage className='mt-1' />
          </FormItem>
        );
      }}
    />
  );
};

export default FormInput;
