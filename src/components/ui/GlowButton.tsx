import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const base =
  "inline-flex min-h-12 items-center justify-center rounded-xl px-6 py-3 text-center font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 disabled:opacity-50";

function variantClass(variant: "primary" | "join") {
  return variant === "join"
    ? "glow-gold w-full max-w-md border border-amber-400/40 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-black shadow-lg hover:brightness-110 active:scale-[0.99] text-lg sm:text-xl"
    : "ring-glow border border-amber-500/30 bg-gradient-to-r from-amber-500/90 to-orange-600/95 text-black shadow-lg hover:brightness-110 active:scale-[0.99]";
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "join";
};

export function GlowButton({
  children,
  className = "",
  variant = "primary",
  type = "button",
  ...rest
}: Props) {
  return (
    <button type={type} className={`${base} ${variantClass(variant)} ${className}`} {...rest}>
      {children}
    </button>
  );
}

type LinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "join";
};

export function GlowLink({ href, children, className = "", variant = "primary" }: LinkProps) {
  return (
    <Link href={href} className={`${base} ${variantClass(variant)} ${className}`}>
      {children}
    </Link>
  );
}

type ExternalProps = {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "join";
};

export function GlowExternalLink({ href, children, className = "", variant = "primary" }: ExternalProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${variantClass(variant)} ${className}`}
    >
      {children}
    </a>
  );
}
