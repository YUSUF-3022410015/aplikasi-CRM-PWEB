"use client";

import { motion, type HTMLMotionProps, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

/* ─── Fade In ─── */
export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.3,
  ...props
}: Omit<HTMLMotionProps<"div">, "children"> & {
  children: ReactNode;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration, ease: "easeOut" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/* ─── Slide Up ─── */
export function SlideUp({
  children,
  className,
  delay = 0,
  distance = 16,
  ...props
}: Omit<HTMLMotionProps<"div">, "children"> & {
  children: ReactNode;
  delay?: number;
  distance?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: "easeOut" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/* ─── Scale In ─── */
export function ScaleIn({
  children,
  className,
  delay = 0,
  ...props
}: Omit<HTMLMotionProps<"div">, "children"> & {
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.25, ease: "easeOut" }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/* ─── Stagger Container ─── */
const staggerContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export function StaggerList({
  children,
  className,
  ...props
}: Omit<HTMLMotionProps<"div">, "children" | "variants"> & {
  children: ReactNode;
}) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  ...props
}: Omit<HTMLMotionProps<"div">, "children" | "variants"> & {
  children: ReactNode;
}) {
  return (
    <motion.div variants={staggerItem} className={className} {...props}>
      {children}
    </motion.div>
  );
}

/* ─── Card Hover ─── */
export function HoverCard({
  children,
  className,
  ...props
}: Omit<HTMLMotionProps<"div">, "children"> & {
  children: ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("rounded-xl border bg-card text-card-foreground shadow transition-colors", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/* ─── Press Scale (for buttons) ─── */
export function PressScale({
  children,
  className,
  ...props
}: Omit<HTMLMotionProps<"div">, "children"> & {
  children: ReactNode;
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.1 }}
      className={cn("inline-flex", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
