import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

type BaseProps = {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  className?: string;
  children: React.ReactNode;
};

type LinkProps = BaseProps & { href: string } & Omit<React.ComponentProps<typeof Link>, "href" | "className" | "children">;
type ButtonProps = BaseProps & { href?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

const base =
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-semibold transition-[translate,scale,box-shadow,background-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-60 motion-safe:active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary: "bg-primary-solid text-white shadow-soft motion-safe:hover:-translate-y-0.5 hover:shadow-lift",
  secondary: "bg-text text-background motion-safe:hover:-translate-y-0.5 hover:shadow-lift dark:bg-white dark:text-[#0B1020]",
  outline: "border border-border bg-background/60 text-text backdrop-blur hover:border-primary hover:text-primary",
  ghost: "text-text hover:bg-primary-soft hover:text-primary-ink",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm sm:text-base",
  lg: "h-13 px-7 text-base",
};

export function Button(props: LinkProps | ButtonProps) {
  const { variant = "primary", size = "md", arrow, className, children, ...rest } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  const inner = (
    <>
      {variant === "primary" ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[120%] skew-x-[-12deg] bg-white/25 motion-safe:group-hover:animate-shine"
        />
      ) : null}
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
        {arrow ? (
          <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />
        ) : null}
      </span>
    </>
  );

  if ("href" in rest && typeof rest.href === "string") {
    const { href, ...linkRest } = rest as LinkProps;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {inner}
      </Link>
    );
  }

  const { type = "button", ...btnRest } = rest as ButtonProps;
  return (
    <button type={type} className={classes} {...btnRest}>
      {inner}
    </button>
  );
}
