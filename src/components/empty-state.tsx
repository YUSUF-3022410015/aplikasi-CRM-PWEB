import { cn } from "@/lib/utils";
import { FileX, Search, Inbox, Calendar, Users, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const iconMap = {
  default: Inbox,
  search: Search,
  file: FileX,
  calendar: Calendar,
  users: Users,
  package: Package,
} as const;

interface EmptyStateProps {
  icon?: keyof typeof iconMap;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon = "default",
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  const Icon = iconMap[icon];

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-8 text-center animate-fade-in",
        className
      )}
    >
      <div className="rounded-full bg-slate-100 p-5 mb-5">
        <Icon className="h-10 w-10 text-slate-500/60" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center justify-center bg-blue-600 text-white shadow-sm hover:bg-blue-600/90 active:scale-[0.98] transition-all rounded-md px-4 py-2 text-sm font-medium"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-blue-600 text-white shadow-sm hover:bg-blue-600/90 active:scale-[0.98] transition-all"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );

  return content;
}
