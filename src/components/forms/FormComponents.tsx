import React from "react";
import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Form Input Component
interface FormInputProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  helpText?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number | string;
}

export function FormInput({
  form,
  name,
  label,
  placeholder,
  type = "text",
  required = false,
  helpText,
  disabled = false,
  min,
  max,
  step,
}: FormInputProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              min={min}
              max={max}
              step={step}
            />
          </FormControl>
          {helpText && <FormDescription>{helpText}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Form Textarea Component
interface FormTextareaProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  disabled?: boolean;
  rows?: number;
}

export function FormTextarea({
  form,
  name,
  label,
  placeholder,
  required = false,
  helpText,
  disabled = false,
  rows = 3,
}: FormTextareaProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Textarea
              {...field}
              placeholder={placeholder}
              disabled={disabled}
              rows={rows}
            />
          </FormControl>
          {helpText && <FormDescription>{helpText}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Form Select Component
interface FormSelectProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export function FormSelect({
  form,
  name,
  label,
  placeholder,
  required = false,
  helpText,
  disabled = false,
  children,
}: FormSelectProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>{children}</SelectContent>
          </Select>
          {helpText && <FormDescription>{helpText}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Form Select Item (re-export from shadcn)
export { SelectItem as FormSelectItem } from "@/components/ui/select";

// Form DatePicker Component (using HTML5 date input)
interface FormDatePickerProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  required?: boolean;
  helpText?: string;
  disabled?: boolean;
}

export function FormDatePicker({
  form,
  name,
  label,
  required = false,
  helpText,
  disabled = false,
}: FormDatePickerProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <Input {...field} type="date" disabled={disabled} />
          </FormControl>
          {helpText && <FormDescription>{helpText}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Form Checkbox Component
interface FormCheckboxProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  helpText?: string;
  disabled?: boolean;
}

export function FormCheckbox({
  form,
  name,
  label,
  helpText,
  disabled = false,
}: FormCheckboxProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>{label}</FormLabel>
            {helpText && <FormDescription>{helpText}</FormDescription>}
          </div>
        </FormItem>
      )}
    />
  );
}
