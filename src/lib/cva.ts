import { clsx } from "clsx";

type Variants = Record<string, Record<string, string>>;

export function cva<T extends Variants>(base: string, config: {
  variants: T;
  defaultVariants?: { [K in keyof T]?: keyof T[K] };
}) {
  return (props?: { [K in keyof T]?: keyof T[K] }) => {
    const resolved = { ...config.defaultVariants, ...props } as Record<string, string>;
    const classes = [base];
    for (const key in resolved) {
      const variant = resolved[key];
      if (variant && config.variants[key]?.[variant]) {
        classes.push(config.variants[key][variant]);
      }
    }
    return clsx(classes);
  };
}

export type VariantProps<T extends (...args: any[]) => any> = T extends (props: infer P) => any
  ? P
  : Record<string, unknown>;
