import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ParsedInvoiceDTO, IngestInvoiceDTO, Unit } from "@/types";
import { ChevronLeft } from "lucide-react";

interface InvoiceMappingStepProps {
  parsedData: ParsedInvoiceDTO;
  onMapped: (data: IngestInvoiceDTO) => void;
  onBack: () => void;
}

export const InvoiceMappingStep = ({
  parsedData,
  onMapped,
  onBack,
}: InvoiceMappingStepProps) => {
  const [items, setItems] = useState(
    parsedData.items.map((item, index) => ({
      id: `item-${index}`,
      mode: "CREATE_NEW_PART" as "CREATE_NEW_PART" | "MAP_EXISTING_PART",
      partId: item.suggested.partId || "",
      name: item.suggested.name || "",
      unit: item.suggested.unit || ("pcs" as Unit),
      quantity: item.suggested.quantity || 0,
      unitCost: item.suggested.unitCost || 0,
      supplier: item.suggested.supplier || parsedData.vendor || "",
      confidence: item.confidence,
      rawDescription: item.rawDescription,
    }))
  );

  const [meta, setMeta] = useState({
    invoiceNo: parsedData.invoiceNo || "",
    date: parsedData.date || "",
    currency: parsedData.currency || "INR",
    supplier: parsedData.vendor || "",
  });

  const updateItem = (id: string, updates: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const isValid = items.every(
    (item) =>
      item.partId &&
      item.quantity > 0 &&
      (item.mode === "MAP_EXISTING_PART" ||
        (item.name && item.unit))
  );

  const handleContinue = () => {
    const payload: IngestInvoiceDTO = {
      meta,
      items: items.map((item) => ({
        mode: item.mode,
        partId: item.partId,
        name: item.mode === "CREATE_NEW_PART" ? item.name : undefined,
        unit: item.mode === "CREATE_NEW_PART" ? item.unit : undefined,
        quantity: item.quantity,
        unitCost: item.unitCost || undefined,
        supplier: item.supplier || undefined,
        note: `From ${meta.invoiceNo || "invoice"}`,
      })),
    };
    onMapped(payload);
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        <h3 className="text-lg font-semibold">Review and Map Line Items</h3>
        <p className="text-sm text-muted-foreground">
          Verify or edit the extracted data for each line item
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
        <div>
          <Label htmlFor="invoiceNo">Invoice Number</Label>
          <Input
            id="invoiceNo"
            value={meta.invoiceNo}
            onChange={(e) => setMeta({ ...meta, invoiceNo: e.target.value })}
            placeholder="INV-XXXX"
          />
        </div>
        <div>
          <Label htmlFor="supplier">Supplier</Label>
          <Input
            id="supplier"
            value={meta.supplier}
            onChange={(e) => setMeta({ ...meta, supplier: e.target.value })}
            placeholder="Supplier name"
          />
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {items.map((item, index) => (
          <div key={item.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Source Line {index + 1}
                </p>
                <p className="text-sm truncate" title={item.rawDescription}>
                  {item.rawDescription}
                </p>
              </div>
              <Badge
                variant={
                  item.confidence > 0.7
                    ? "default"
                    : item.confidence > 0.4
                      ? "secondary"
                      : "outline"
                }
              >
                {Math.round(item.confidence * 100)}% confidence
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Part ID *</Label>
                <Input
                  value={item.partId}
                  onChange={(e) => updateItem(item.id, { partId: e.target.value })}
                  placeholder="SP-001"
                />
              </div>

              <div>
                <Label>Mode</Label>
                <Select
                  value={item.mode}
                  onValueChange={(value) => updateItem(item.id, { mode: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CREATE_NEW_PART">Create New Part</SelectItem>
                    <SelectItem value="MAP_EXISTING_PART">Map to Existing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {item.mode === "CREATE_NEW_PART" && (
                <>
                  <div>
                    <Label>company *</Label>
                    <Input
                      value={item.name}
                      onChange={(e) => updateItem(item.id, { name: e.target.value })}
                      placeholder="Solar Panel 300W"
                    />
                  </div>

                  <div>
                    <Label>Unit *</Label>
                    <Select
                      value={item.unit}
                      onValueChange={(value) => updateItem(item.id, { unit: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pcs">pcs</SelectItem>
                        <SelectItem value="pair">pair</SelectItem>
                        <SelectItem value="m">m</SelectItem>
                        <SelectItem value="set">set</SelectItem>
                        <SelectItem value="roll">roll</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div>
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })
                  }
                  min="0"
                  step="1"
                />
              </div>

              <div>
                <Label>Unit Cost (₹)</Label>
                <Input
                  type="number"
                  value={item.unitCost}
                  onChange={(e) =>
                    updateItem(item.id, { unitCost: parseFloat(e.target.value) || 0 })
                  }
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={handleContinue} disabled={!isValid} className="w-full" size="lg">
        Continue to Review
      </Button>
    </div>
  );
};
