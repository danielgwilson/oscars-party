import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "default" | "primary" | "secondary" | "accent" | "white";
}

const sizeClasses = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

const colorClasses = {
  default: "text-foreground",
  primary: "text-primary",
  secondary: "text-secondary",
  accent: "text-amber-400",
  white: "text-white",
};

export function Spinner({ className, size = "md", color = "default" }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        className="size-full"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <span className="sr-only">Loading</span>
    </div>
  );
}

export function ButtonSpinner({ className }: { className?: string }) {
  return <Spinner className={className} size="sm" />;
}