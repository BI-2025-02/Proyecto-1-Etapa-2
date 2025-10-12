import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps } from "class-variance-authority";

import { cn } from "./utils";
import { buttonVariants } from "./button-variants";

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  if (Comp === "button") {
    // Ensure native button doesn't act as a submit by default when placed inside forms.
    const { type, ...rest } = props as React.ButtonHTMLAttributes<HTMLButtonElement>;
    return (
      <button
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        type={type ?? "button"}
        {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      />
    );
  }

  return (
    <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
  );
}

export { Button };
