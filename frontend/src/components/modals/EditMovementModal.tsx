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
import { Movement, MovementType } from "@/types";
import { dataConnector } from "@/lib/dataConnector";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface EditMovementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movement: Movement | null;
  onSuccess?: () => void;
}

export const EditMovementModal = ({
  open,
  onOpenChange,
  movement,
  onSuccess,
}: EditMovementModalProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    type: "PURCHASE" as MovementType,
    quantity: 0,
    unitCost: 0,
    taxRate: 5,
    wattpics: 1,
    supplier: "",
    note: "",
    invoiceNo: "",
  });

  useEffect(() => {
    if (movement) {
      setFormData({
        type: movement.type,
        quantity: Math.abs(movement.quantity),
        unitCost: movement.unitCost || 0,
        taxRate: movement.taxRate || 5,
        wattpics: movement.wattpics || 1,
        supplier: movement.supplier || "",
        note: movement.note || "",
        invoiceNo: movement.invoiceNo || "",
      });
    }
  }, [movement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movement) return;

    setLoading(true);

    try {
      // Calculate the signed quantity based on type
      const signedQuantity = formData.type === "SALE" ? -Math.abs(formData.quantity) : Math.abs(formData.quantity);

      // Calculate based on: unitCost * wattpics * quantity (same formula as sales/purchase)
      const subtotal = formData.unitCost * formData.wattpics * Math.abs(formData.quantity);
      const taxAmount = (subtotal * formData.taxRate) / 100;
      const totalWithTax = subtotal + taxAmount;

      // Update the movement via API
      await dataConnector.updateMovement(movement.id, {
        type: formData.type,
        quantity: signedQuantity,
        unitCost: formData.unitCost || undefined,
        taxRate: formData.taxRate,
        taxAmount,
        totalWithTax,
        wattpics: formData.wattpics,
        supplier: formData.supplier || undefined,
        note: formData.note || undefined,
        invoiceNo: formData.invoiceNo || undefined,
      });

      toast({
        title: "Movement Updated",
        description: "The movement record has been updated successfully",
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Failed to Update Movement",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const subtotal = formData.unitCost * formData.wattpics * formData.quantity;
    const tax = (subtotal * formData.taxRate) / 100;
    return subtotal + tax;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adjust Movement</DialogTitle>
          <DialogDescription>
            Edit movement record for {movement?.partName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-muted/30 rounded-lg text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Part ID:</span>
              <span className="font-medium">{movement?.partId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">company:</span>
              <span className="font-medium">{movement?.partName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Timestamp:</span>
              <span className="font-medium">
                {movement?.timestamp && new Date(movement.timestamp).toLocaleString()}
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="type">Movement Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value: MovementType) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PURCHASE">Purchase</SelectItem>
                <SelectItem value="SALE">Sale</SelectItem>
                <SelectItem value="RETURN">Return</SelectItem>
                <SelectItem value="ADJUST">Adjust</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })
              }
              step="0.01"
              required
            />
          </div>

          <div>
            <Label htmlFor="unitCost">Unit Cost (₹)</Label>
            <Input
              id="unitCost"
              type="number"
              value={formData.unitCost}
              onChange={(e) =>
                setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })
              }
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <Label htmlFor="wattpics">WattPics (wp)</Label>
            <Input
              id="wattpics"
              type="number"
              value={formData.wattpics}
              onChange={(e) =>
                setFormData({ ...formData, wattpics: parseFloat(e.target.value) || 1 })
              }
              min="1"
              step="1"
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

          <div>
            <Label htmlFor="supplier">
              {formData.type === "PURCHASE" ? "Supplier" : formData.type === "SALE" ? "Customer" : "Party"}
            </Label>
            <Input
              id="supplier"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              placeholder="Supplier/Customer name"
            />
          </div>

          <div>
            <Label htmlFor="invoiceNo">Invoice Number</Label>
            <Input
              id="invoiceNo"
              value={formData.invoiceNo}
              onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
              placeholder="INV-001"
            />
          </div>

          <div>
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="Additional notes"
              rows={3}
            />
          </div>

          {formData.quantity > 0 && formData.unitCost > 0 && (
            <div className="p-4 bg-muted/30 rounded-lg space-y-2">
              {formData.wattpics > 0 && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Unit Cost × WattPics × Quantity:</span>
                  <span>₹{formData.unitCost.toFixed(2)} × {formData.wattpics} × {formData.quantity}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">
                  ₹{(formData.unitCost * formData.wattpics * formData.quantity).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax ({formData.taxRate}%):</span>
                <span className="font-medium">
                  ₹{((formData.unitCost * formData.wattpics * formData.quantity * formData.taxRate) / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total with Tax:</span>
                <span className="text-success">₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || formData.quantity <= 0}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Movement
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};