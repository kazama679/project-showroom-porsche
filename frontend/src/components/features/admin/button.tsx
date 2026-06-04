import { Button as BaseButton } from "@/components/base/ui/button";
import type { ComponentProps } from "react";

type AdminButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "outline";
type AdminButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<ComponentProps<typeof BaseButton>, "variant" | "size"> {
  variant?: AdminButtonVariant;
  size?: AdminButtonSize;
}

const variantMap: Record<AdminButtonVariant, ComponentProps<typeof BaseButton>["variant"]> = {
  primary: "primary",
  secondary: "secondary",
  danger: "destructive",
  ghost: "ghost",
  outline: "outline",
};

const sizeMap: Record<AdminButtonSize, ComponentProps<typeof BaseButton>["size"]> = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

export function Button({ variant = "primary", size = "md", ...props }: ButtonProps) {
  return <BaseButton variant={variantMap[variant]} size={sizeMap[size]} {...props} />;
}
