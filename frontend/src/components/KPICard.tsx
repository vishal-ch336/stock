import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "success" | "warning" | "destructive";
}

export const KPICard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: KPICardProps) => {
  const variantStyles = {
    default: "bg-gradient-subtle",
    success: "bg-gradient-success text-success-foreground",
    warning: "bg-warning/10 border-warning/20",
    destructive: "bg-destructive/10 border-destructive/20",
  };

  return (
    <Card className={`${variantStyles[variant]} transition-all hover:shadow-lg`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg ${
              variant === "success"
                ? "bg-success/20"
                : variant === "warning"
                ? "bg-warning/20"
                : variant === "destructive"
                ? "bg-destructive/20"
                : "bg-primary/10"
            }`}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
