import { clsx } from "clsx";

type Variants = Record<string, Record<string, string>>;
type Props<T> = T extends Variants ? { [K in keyof T]?: keyof T[K] } : Record<string, never>;

export function cva<T extends Variants = never>(base: string, config?: {
  variants: T;
  defaultVariants?: { [K in keyof T]?: keyof T[K] };
}) {
  return (props?: Props<T>): string => {
    const vars = config?.variants;
    const defaults = config?.defaultVariants;
    const resolved = { ...defaults, ...props } as Record<string, string>;
    const classes = [base];
    if (vars) {
      for (const key in resolved) {
        const variant = resolved[key];
        if (variant && vars[key]?.[variant]) {
          classes.push(vars[key][variant]);
        }
      }
    }
    return clsx(classes);
  };
}

export type VariantProps<T extends (...args: any[]) => any> = 
  T extends (props?: infer P) => any
    ? { [K in keyof NonNullable<P>]: NonNullable<P>[K] }
    : {};
