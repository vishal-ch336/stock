import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Movement } from "@/types";
import { ArrowUp, ArrowDown, RefreshCw, RotateCcw } from "lucide-react";

interface RecentChangesProps {
  movements: Movement[];
}

export const RecentChanges = ({ movements }: RecentChangesProps) => {
  const getMovementIcon = (type: string) => {
    switch (type) {
      case "PURCHASE":
        return <ArrowDown className="h-4 w-4" />;
      case "SALE":
        return <ArrowUp className="h-4 w-4" />;
      case "RETURN":
        return <RotateCcw className="h-4 w-4" />;
      case "ADJUST":
        return <RefreshCw className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getMovementBadgeVariant = (type: string) => {
    switch (type) {
      case "PURCHASE":
        return "default";
      case "SALE":
        return "secondary";
      case "RETURN":
        return "outline";
      case "ADJUST":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Changes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {movements.slice(0, 10).map((movement) => (
          <div
            key={movement.id}
            className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                movement.type === "PURCHASE"
                  ? "bg-success/10 text-success"
                  : movement.type === "SALE"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {getMovementIcon(movement.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm truncate">{movement.partName}</p>
                <Badge variant={getMovementBadgeVariant(movement.type)} className="text-xs">
                  {movement.type}
                </Badge>
                {movement.invoiceNo && (
                  <Badge variant="outline" className="text-xs">
                    via {movement.invoiceNo}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {movement.partId} • {new Date(movement.timestamp).toLocaleString()}
              </p>
            </div>
            <div
              className={`text-sm font-semibold ${
                movement.quantity > 0 ? "text-success" : "text-destructive"
              }`}
            >
              {movement.quantity > 0 ? "+" : ""}
              {movement.quantity}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
