import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  variant?: "default" | "network";
  className?: string;
}

export function ErrorState({
  title = "Terjadi Kesalahan",
  message = "Terjadi kesalahan yang tidak terduga. Silakan coba lagi.",
  onRetry,
  variant = "default",
  className,
}: ErrorStateProps) {
  const Icon = variant === "network" ? WifiOff : AlertTriangle;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-8 text-center animate-fade-in",
        className
      )}
    >
      <div className="rounded-full bg-destructive/10 p-5 mb-5">
        <Icon className="h-10 w-10 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outline"
          className="border-border hover:bg-muted active:scale-[0.98] transition-all"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Coba Lagi
        </Button>
      )}
    </div>
  );
}
