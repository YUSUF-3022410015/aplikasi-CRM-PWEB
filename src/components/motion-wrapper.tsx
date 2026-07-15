"use client";

import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

/* ─── Fade In ─── */
export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn("animate-fade-in", className)}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

/* ─── Slide Up ─── */
export function SlideUp({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn("animate-slide-up", className)}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

/* ─── Scale In ─── */
export function ScaleIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn("animate-scale-in", className)}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

/* ─── Stagger List ─── */
export function StaggerList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {children}
    </div>
  );
}

export function StaggerItem({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={cn("animate-slide-up", className)}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

/* ─── Hover Card ─── */
export function HoverCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ─── Press Scale (for buttons) ─── */
export function PressScale({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex active:scale-[0.97] transition-transform duration-100", className)}>
      {children}
    </div>
  );
}
