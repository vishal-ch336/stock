import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Movement, MovementType, Part } from "@/types";
import { dataConnector } from "@/lib/dataConnector";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { usePartsStore } from "@/stores/usePartsStore";

interface MovementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: MovementType;
  onSuccess?: (movement: Movement) => void;
}

export const MovementModal = ({
  open,
  onOpenChange,
  type,
  onSuccess,
}: MovementModalProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { parts, fetchParts } = usePartsStore();

  const [formData, setFormData] = useState<{
    partId: string;
    quantity: number | "";
    unitCost: number | "";
    taxRate: number;
    wattpics: number | "";
    category: string;
    supplier: string;
    note: string;
  }>({
    partId: "",
    quantity: "",
    unitCost: "",
    taxRate: 5,
    wattpics: "",
    category: "",
    supplier: "",
    note: "",
  });

  useEffect(() => {
    if (open && parts.length === 0) {
      fetchParts();
    }
  }, [open]);

  const selectedPart = parts.find((p) => p.partId === formData.partId);

  // Find the actual part variant based on company name, category, and wattpics
  // This ensures we show the correct stock for the specific variant selected
  const actualSelectedPart = selectedPart
    ? (() => {
      // If category and wattpics are selected, find the exact match
      if (formData.category && formData.wattpics) {
        const exactMatch = parts.find(
          (p) =>
            p.name === selectedPart.name &&
            p.category === formData.category &&
            p.wattpics === formData.wattpics
        );
        if (exactMatch) return exactMatch;
      }

      // If only category is selected, find match by company name + category
      if (formData.category) {
        const categoryMatch = parts.find(
          (p) =>
            p.name === selectedPart.name &&
            p.category === formData.category
        );
        if (categoryMatch) return categoryMatch;
      }

      // Fall back to the originally selected part
      return selectedPart;
    })()
    : undefined;

  // Helper to get quantity as number for type safety
  const quantityAsNumber = typeof formData.quantity === "number" ? formData.quantity : 0;

  // Get unique company names and map to representative parts
  const uniqueCompanies = Array.from(
    new Map(parts.map(part => [part.name, part])).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  // Get wattpics values for parts with the same company name as the selected part
  const uniqueWattpics = selectedPart
    ? Array.from(
      new Set(
        parts
          .filter(p =>
            p.name === selectedPart.name && // Same company name
            p.wattpics !== undefined &&
            p.wattpics !== null &&
            p.wattpics > 0
          )
          .map(p => p.wattpics)
      )
    ).sort((a, b) => (a || 0) - (b || 0))
    : [];

  // Get unique categories for parts with the same company name as the selected part
  const uniqueCategories = selectedPart
    ? Array.from(
      new Set(
        parts
          .filter(p =>
            p.name === selectedPart.name && // Same company name
            p.category !== undefined &&
            p.category !== null &&
            p.category !== ""
          )
          .map(p => p.category)
      )
    ).sort()
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that sale quantity doesn't exceed available stock
    const qty = typeof formData.quantity === "number" ? formData.quantity : 0;
    if (type === "SALE" && actualSelectedPart && qty > actualSelectedPart.available) {
      toast({
        title: "Invalid Quantity",
        description: `Cannot sell ${qty} units. Only ${actualSelectedPart.available} units available in stock.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // PURCHASE and ADJUST: positive quantity
      // SALE and RETURN: negative quantity
      const quantity = (type === "PURCHASE" || type === "ADJUST")
        ? Math.abs(qty)
        : -Math.abs(qty);
      const cost = typeof formData.unitCost === "number" ? formData.unitCost : 0;
      const wattpics = typeof formData.wattpics === "number" ? formData.wattpics : 1;

      // Calculate based on: unitCost * wattpics * quantity
      const subtotal = cost * wattpics * Math.abs(qty);
      const taxAmount = (subtotal * formData.taxRate) / 100;
      const totalWithTax = subtotal + taxAmount;

      const movement = await dataConnector.createMovement({
        partId: actualSelectedPart?.partId || formData.partId,
        partName: actualSelectedPart?.name || "",
        type,
        quantity,
        unitCost: cost || undefined,
        taxRate: formData.taxRate,
        taxAmount,
        totalWithTax,
        wattpics: typeof formData.wattpics === "number" ? formData.wattpics : undefined,
        category: formData.category || undefined,
        supplier: formData.supplier || undefined,
        note: formData.note || undefined,
      });

      toast({
        title: `${type} Recorded`,
        description: `${Math.abs(quantity)} units ${type === "SALE" ? "sold" : type === "PURCHASE" ? "purchased" : "processed"}`,
      });

      onSuccess?.(movement);
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: `Failed to Record ${type}`,
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      partId: "",
      quantity: "",
      unitCost: "",
      taxRate: 5,
      wattpics: "",
      category: "",
      supplier: "",
      note: "",
    });
  };

  const calculateTotal = () => {
    const qty = typeof formData.quantity === "number" ? formData.quantity : 0;
    const cost = typeof formData.unitCost === "number" ? formData.unitCost : 0;
    const wattpics = typeof formData.wattpics === "number" ? formData.wattpics : 1; // Default to 1 if not set
    const subtotal = cost * wattpics * Math.abs(qty);
    const tax = (subtotal * formData.taxRate) / 100;
    return subtotal + tax;
  };

  const getTitle = () => {
    switch (type) {
      case "PURCHASE":
        return "Record Purchase";
      case "SALE":
        return "Record Sale";
      case "RETURN":
        return "Record Return";
      case "ADJUST":
        return "Adjust Inventory";
      default:
        return "Record Movement";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {type === "PURCHASE" && "Record incoming inventory from supplier"}
            {type === "SALE" && "Record outgoing inventory to customer"}
            {type === "RETURN" && "Record returned items"}
            {type === "ADJUST" && "Adjust inventory levels manually"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="partId">Select Part *</Label>
            <Select
              value={formData.partId}
              onValueChange={(value) => {
                const part = parts.find((p) => p.partId === value);
                setFormData({
                  ...formData,
                  partId: value,
                  unitCost: type === "SALE" ? 0 : (part?.unitCost || ""),
                  taxRate: part?.taxRate || 5,
                  wattpics: part?.wattpics || "",
                  category: part?.category || "",
                  supplier: part?.supplier || "",
                });
              }}
            >
              <SelectTrigger id="partId">
                <SelectValue placeholder="Choose a part" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCompanies.map((part) => (
                  <SelectItem key={part.partId} value={part.partId}>
                    {part.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => {
                // Update category and try to find the specific part variant
                const newFormData = { ...formData, category: value };

                if (selectedPart) {
                  // Try to find exact part match with company name + category + wattpics
                  if (formData.wattpics) {
                    const exactMatch = parts.find(
                      (p) =>
                        p.name === selectedPart.name &&
                        p.category === value &&
                        p.wattpics === formData.wattpics
                    );
                    if (exactMatch) {
                      newFormData.partId = exactMatch.partId;
                    }
                  } else {
                    // Try to find part match with company name + category
                    const categoryMatch = parts.find(
                      (p) =>
                        p.name === selectedPart.name &&
                        p.category === value
                    );
                    if (categoryMatch) {
                      newFormData.partId = categoryMatch.partId;
                    }
                  }
                }

                setFormData(newFormData);
              }}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.category?.toLowerCase().includes("solar panel") && (
            <div>
              <Label htmlFor="wattpics">WattPics (wp) *</Label>
              <Select
                value={formData.wattpics !== "" ? String(formData.wattpics) : ""}
                onValueChange={(value) => {
                  const wattpics = value === "" ? "" : (parseFloat(value) || "");
                  const newFormData = { ...formData, wattpics: wattpics as number | "" };

                  // Try to find the specific part variant with company name + category + wattpics
                  if (selectedPart && formData.category && wattpics) {
                    const exactMatch = parts.find(
                      (p) =>
                        p.name === selectedPart.name &&
                        p.category === formData.category &&
                        p.wattpics === wattpics
                    );
                    if (exactMatch) {
                      newFormData.partId = exactMatch.partId;
                    }
                  }

                  setFormData(newFormData);
                }}
              >
                <SelectTrigger id="wattpics">
                  <SelectValue placeholder="Select wattage" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueWattpics.map((wp) => (
                    <SelectItem key={wp} value={String(wp)}>
                      {wp} wp
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {actualSelectedPart && (
            <div className="p-3 bg-muted/30 rounded-lg text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Available Stock:</span>
                <span className="font-medium">{actualSelectedPart.available} {actualSelectedPart.unit}</span>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="quantity">
              Quantity * ({type === "SALE" ? "Outgoing" : "Incoming"})
            </Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value === "" ? "" : parseFloat(e.target.value) || "" })
              }
              min="0"
              step="1"
              required
              placeholder="0"
              className={type === "SALE" && actualSelectedPart && quantityAsNumber > 0 && quantityAsNumber > actualSelectedPart.available ? "border-destructive" : ""}
            />
            {type === "SALE" && actualSelectedPart && quantityAsNumber > 0 && quantityAsNumber > actualSelectedPart.available && (
              <p className="text-sm text-destructive mt-1">
                Cannot exceed available stock of {actualSelectedPart.available} units
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="unitCost">Unit Cost (₹)</Label>
            <Input
              id="unitCost"
              type="number"
              value={formData.unitCost}
              onChange={(e) =>
                setFormData({ ...formData, unitCost: e.target.value === "" ? "" : parseFloat(e.target.value) || "" })
              }
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
            <Input
              id="taxRate"
              type="number"
              value={formData.taxRate}
              onChange={(e) =>
                setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })
              }
              min="0"
              max="100"
              step="0.01"
            />
          </div>

          {(type === "PURCHASE" || type === "SALE") && (
            <div>
              <Label htmlFor="supplier">
                {type === "PURCHASE" ? "Supplier" : "Customer"}
              </Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder={type === "PURCHASE" ? "Supplier name" : "Customer name"}
              />
            </div>
          )}

          <div>
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Additional notes (optional)"
              rows={3}
            />
          </div>

          {formData.quantity !== "" && formData.quantity > 0 && formData.unitCost !== "" && formData.unitCost > 0 && (
            <div className="p-4 bg-muted/30 rounded-lg space-y-2">
              {formData.wattpics !== "" && typeof formData.wattpics === "number" && formData.wattpics > 0 && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Unit Cost × WattPics × Quantity:</span>
                  <span>₹{(typeof formData.unitCost === "number" ? formData.unitCost : 0).toFixed(2)} × {formData.wattpics} × {(typeof formData.quantity === "number" ? formData.quantity : 0)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">
                  ₹{((typeof formData.unitCost === "number" ? formData.unitCost : 0) * (typeof formData.wattpics === "number" ? formData.wattpics : 1) * (typeof formData.quantity === "number" ? formData.quantity : 0)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax ({formData.taxRate}%):</span>
                <span className="font-medium">
                  ₹{(((typeof formData.unitCost === "number" ? formData.unitCost : 0) * (typeof formData.wattpics === "number" ? formData.wattpics : 1) * (typeof formData.quantity === "number" ? formData.quantity : 0) * formData.taxRate) / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total with Tax:</span>
                <span className={type === "SALE" ? "text-primary" : "text-success"}>
                  ₹{calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={
              loading ||
              !formData.partId ||
              formData.quantity === "" ||
              formData.quantity <= 0 ||
              (type === "SALE" && actualSelectedPart && quantityAsNumber > 0 && quantityAsNumber > actualSelectedPart.available)
            }>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Record {type}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
