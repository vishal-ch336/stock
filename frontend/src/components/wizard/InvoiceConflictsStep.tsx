import { Button } from "@/components/ui/button";
import { IngestInvoiceDTO } from "@/types";
import { AlertCircle, CheckCircle, ChevronLeft } from "lucide-react";

interface InvoiceConflictsStepProps {
  mappedData: IngestInvoiceDTO;
  onResolved: () => void;
  onBack: () => void;
}

export const InvoiceConflictsStep = ({
  mappedData,
  onResolved,
  onBack,
}: InvoiceConflictsStepProps) => {
  // Check for duplicate partIds among new parts
  const newParts = mappedData.items.filter((item) => item.mode === "CREATE_NEW_PART");
  const partIdCounts = new Map<string, number>();
  newParts.forEach((item) => {
    partIdCounts.set(item.partId, (partIdCounts.get(item.partId) || 0) + 1);
  });
  const duplicates = Array.from(partIdCounts.entries()).filter(([_, count]) => count > 1);

  const hasConflicts = duplicates.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        <h3 className="text-lg font-semibold">Conflict Detection</h3>
        <p className="text-sm text-muted-foreground">
          Review any potential issues before importing
        </p>
      </div>

      {hasConflicts ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-medium">Duplicate Part IDs Detected</p>
              <p className="text-sm text-muted-foreground">
                The following Part IDs appear multiple times in your import:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                {duplicates.map(([partId, count]) => (
                  <li key={partId}>
                    <code className="bg-muted px-2 py-0.5 rounded">{partId}</code> appears{" "}
                    {count} times
                  </li>
                ))}
              </ul>
              <p className="text-sm text-muted-foreground mt-3">
                Please go back and either:
                <br />
                • Change to "Map to Existing" if the part already exists
                <br />
                • Use different Part IDs for new parts
                <br />• Use the merge feature to combine quantities
              </p>
            </div>
          </div>

          <Button onClick={onBack} variant="outline" className="w-full">
            Go Back to Fix Issues
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-success/10 border border-success/20 rounded-lg">
            <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="font-medium">No Conflicts Detected</p>
              <p className="text-sm text-muted-foreground">
                All line items are ready to import. No duplicate Part IDs or conflicts found.
              </p>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg space-y-2">
            <h4 className="font-medium">Import Summary</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">New Parts:</span>{" "}
                <span className="font-semibold">
                  {mappedData.items.filter((i) => i.mode === "CREATE_NEW_PART").length}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Mapped Parts:</span>{" "}
                <span className="font-semibold">
                  {mappedData.items.filter((i) => i.mode === "MAP_EXISTING_PART").length}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Items:</span>{" "}
                <span className="font-semibold">{mappedData.items.length}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Quantity:</span>{" "}
                <span className="font-semibold">
                  {mappedData.items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>
            </div>
          </div>

          <Button onClick={onResolved} className="w-full" size="lg">
            Continue to Confirm
          </Button>
        </div>
      )}
    </div>
  );
};
