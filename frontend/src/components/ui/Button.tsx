/**
 * @author: Roy Meoded
 * @date: 27.08.2026
 * @description: Shared button component with variant styling.
 */

import type { ButtonHTMLAttributes } from "react";

import { buttonBaseClassName, buttonVariantClassName } from "./styles";

type ButtonVariant = keyof typeof buttonVariantClassName;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

/** One shared button style used across every form and action in the app,
 * so buttons look and behave consistently instead of each page inventing
 * its own className. */
export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return <button className={`${buttonBaseClassName} ${buttonVariantClassName[variant]} ${className}`} {...props} />;
}
