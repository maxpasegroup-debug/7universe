import Link from "next/link";

type Props = {
  href?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "text-xl gap-1.5",
  md: "text-2xl gap-2",
  lg: "text-3xl sm:text-4xl gap-2",
};

export function Logo({ href = "/", size = "md", className = "" }: Props) {
  const inner = (
    <span
      className={`font-display inline-flex items-baseline font-bold tracking-tight ${sizes[size]} ${className}`}
    >
      <span className="text-glow bg-gradient-to-br from-amber-300 via-amber-400 to-orange-600 bg-clip-text text-transparent">
        7
      </span>
      <span className="text-slate-100">Universe</span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 rounded-md">
        {inner}
      </Link>
    );
  }

  return <span className="inline-flex shrink-0">{inner}</span>;
}
