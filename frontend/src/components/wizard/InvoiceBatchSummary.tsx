import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, FileText, Package, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface InvoiceProcessingState {
  file: File;
  result?: {
    success: boolean;
    createdParts: number;
    createdMovements: number;
    totalQuantity: number;
    totalValue: number;
    error?: string;
  };
}

interface InvoiceBatchSummaryProps {
  invoices: InvoiceProcessingState[];
  onClose: () => void;
}

export const InvoiceBatchSummary = ({ invoices, onClose }: InvoiceBatchSummaryProps) => {
  const successCount = invoices.filter((inv) => inv.result?.success).length;
  const failureCount = invoices.filter((inv) => inv.result && !inv.result.success).length;
  
  const totals = invoices.reduce(
    (acc, inv) => {
      if (inv.result?.success) {
        acc.parts += inv.result.createdParts;
        acc.movements += inv.result.createdMovements;
        acc.quantity += inv.result.totalQuantity;
        acc.value += inv.result.totalValue;
      }
      return acc;
    },
    { parts: 0, movements: 0, quantity: 0, value: 0 }
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
        </div>
        <h3 className="text-2xl font-bold">Batch Import Complete!</h3>
        <p className="text-muted-foreground">
          Successfully imported {successCount} of {invoices.length} invoice{invoices.length > 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totals.parts}</p>
                <p className="text-xs text-muted-foreground">Parts Created</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totals.movements}</p>
                <p className="text-xs text-muted-foreground">Purchases</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
                <Package className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totals.quantity}</p>
                <p className="text-xs text-muted-foreground">Total Units</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <DollarSign className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-xl font-bold">{formatCurrency(totals.value)}</p>
                <p className="text-xs text-muted-foreground">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        <h4 className="font-semibold text-sm">Invoice Details</h4>
        {invoices.map((invoice, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 p-3 rounded-lg border ${
              invoice.result?.success
                ? "bg-success/5 border-success/20"
                : "bg-destructive/5 border-destructive/20"
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {invoice.result?.success ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <p className="font-medium truncate text-sm">{invoice.file.name}</p>
              </div>

              {invoice.result?.success ? (
                <p className="text-xs text-muted-foreground mt-1">
                  {invoice.result.createdParts} parts • {invoice.result.createdMovements} movements •{" "}
                  {invoice.result.totalQuantity} units • {formatCurrency(invoice.result.totalValue)}
                </p>
              ) : (
                <p className="text-xs text-destructive mt-1">
                  {invoice.result?.error || "Import failed"}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {failureCount > 0 && (
        <div className="flex items-start gap-2 p-4 bg-warning/5 border border-warning/20 rounded-lg">
          <XCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Some invoices failed to import</p>
            <p className="text-xs text-muted-foreground mt-1">
              {failureCount} invoice{failureCount > 1 ? "s" : ""} could not be processed. Please check the details above.
            </p>
          </div>
        </div>
      )}

      <Button onClick={onClose} className="w-full" size="lg">
        Complete Import
      </Button>
    </div>
  );
};
