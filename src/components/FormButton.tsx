import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/Loading";
import { ComponentProps, FC, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ComponentProps<typeof Button> {
  children: ReactNode;
  loading?: boolean;
  suffix?: ReactNode;
  preffix?: ReactNode;
}

const FormButton: FC<ButtonProps> = ({
  loading,
  children,
  suffix,
  preffix,
  ...rest
}) => {
  const { className, disabled, ...props } = rest;
  // Keep the button's own label while busy so people know what is happening (Doherty threshold),
  // and give it a thumb-sized height on phones (Fitts's law).
  return (
    <Button
      className={cn("gap-x-1 max-sm:min-h-11", className)}
      disabled={loading || disabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {preffix ? preffix : undefined}
      {loading ? (
        <LoadingSpinner size="sm" text="" className="mr-1" />
      ) : undefined}
      {children}
      {suffix ? suffix : undefined}
    </Button>
  );
};

export default FormButton;
