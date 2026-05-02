import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IngestInvoiceDTO } from "@/types";
import { dataConnector } from "@/lib/dataConnector";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, ChevronLeft } from "lucide-react";

interface InvoiceConfirmStepProps {
  mappedData: IngestInvoiceDTO;
  fileName?: string;
  onSuccess: (result: {
    success: boolean;
    createdParts: number;
    createdMovements: number;
    totalQuantity: number;
    totalValue: number;
    error?: string;
  }) => void;
  onBack: () => void;
}

export const InvoiceConfirmStep = ({
  mappedData,
  fileName,
  onSuccess,
  onBack,
}: InvoiceConfirmStepProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    setLoading(true);

    try {
      const result = await dataConnector.ingestInvoice(mappedData);

      const totalValue = mappedData.items.reduce(
        (sum, item) => sum + (item.unitCost || 0) * item.quantity,
        0
      );

      toast({
        title: "Import Successful",
        description: `Created ${result.createdParts} parts, ${result.createdMovements} purchase movements. Total quantity: ${result.totals.quantity}`,
      });

      onSuccess({
        success: true,
        createdParts: result.createdParts,
        createdMovements: result.createdMovements,
        totalQuantity: result.totals.quantity,
        totalValue,
      });
    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import invoice data",
        variant: "destructive",
      });

      onSuccess({
        success: false,
        createdParts: 0,
        createdMovements: 0,
        totalQuantity: 0,
        totalValue: 0,
        error: error.message || "Failed to import invoice data",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalValue = mappedData.items.reduce(
    (sum, item) => sum + (item.unitCost || 0) * item.quantity,
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-4" disabled={loading}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        <h3 className="text-lg font-semibold">Confirm Import</h3>
        <p className="text-sm text-muted-foreground">
          Review the final summary and confirm to import
        </p>
      </div>

      <div className="space-y-4">
        {fileName && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm">
              <strong>File:</strong> {fileName}
            </p>
          </div>
        )}

        <div className="p-6 bg-gradient-subtle border rounded-lg space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            <h4 className="font-semibold">Import Summary</h4>
          </div>

          <div className="grid gap-3">
            <div className="flex justify-between items-center p-3 bg-card rounded-lg">
              <span className="text-sm text-muted-foreground">Invoice Number</span>
              <span className="font-semibold">{mappedData.meta?.invoiceNo || "N/A"}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-card rounded-lg">
              <span className="text-sm text-muted-foreground">Supplier</span>
              <span className="font-semibold">{mappedData.meta?.supplier || "N/A"}</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-card rounded-lg">
              <span className="text-sm text-muted-foreground">Parts to Create</span>
              <span className="font-semibold text-success">
                {mappedData.items.filter((i) => i.mode === "CREATE_NEW_PART").length}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-card rounded-lg">
              <span className="text-sm text-muted-foreground">Purchase Movements</span>
              <span className="font-semibold text-primary">
                {mappedData.items.length}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-card rounded-lg">
              <span className="text-sm text-muted-foreground">Total Quantity</span>
              <span className="font-semibold">
                {mappedData.items.reduce((sum, item) => sum + item.quantity, 0)} units
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-success/10 border border-success/20 rounded-lg">
              <span className="text-sm font-medium">Estimated Value</span>
              <span className="font-bold text-lg">{formatCurrency(totalValue)}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> After import, KPIs, Parts table, and Recent Changes will
            update automatically via live updates. This action cannot be undone.
          </p>
        </div>

        <Button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Importing...
            </>
          ) : (
            "Confirm & Import"
          )}
        </Button>
      </div>
    </div>
  );
};
