import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "brand";
  className?: string;
}

const variantStyles = {
  default: "bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-color)]",
  brand: "bg-brand-500 text-white",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-tight",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
