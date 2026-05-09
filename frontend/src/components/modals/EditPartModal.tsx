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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Part, Unit, PartStatus } from "@/types";
import { dataConnector } from "@/lib/dataConnector";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap } from "lucide-react";

type PowerUnit = "wp" | "kw";

interface EditPartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  part: Part | null;
  onSuccess?: (part: Part) => void;
  onDelete?: (partId: string) => void;
}

export const EditPartModal = ({ open, onOpenChange, part, onSuccess, onDelete }: EditPartModalProps) => {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    location: "",
    inStock: 0,
    minStock: 0,
    unit: "pcs" as Unit,
    unitCost: 0,
    taxRate: 5,
    supplier: "",
    wattpics: "" as number | "",
    powerUnit: "wp" as PowerUnit,
    status: "ACTIVE" as PartStatus,
  });

  useEffect(() => {
    if (part) {
      setFormData({
        name: part.name,
        category: part.category || "",
        location: part.location || "",
        inStock: part.inStock,
        minStock: part.minStock,
        unit: part.unit,
        unitCost: part.unitCost || 0,
        taxRate: part.taxRate || 5,
        supplier: part.supplier || "",
        wattpics: part.wattpics ?? "",
        powerUnit: (part.powerUnit as PowerUnit) || "wp",
        status: part.status,
      });
    }
  }, [part]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!part) return;

    setLoading(true);

    try {
      const updatedPart = await dataConnector.updatePart(part.partId, {
        name: formData.name,
        category: formData.category,
        location: formData.location,
        inStock: formData.inStock,
        minStock: formData.minStock,
        unit: formData.unit,
        unitCost: formData.unitCost,
        taxRate: formData.taxRate,
        supplier: formData.supplier,
        wattpics: typeof formData.wattpics === "number" ? formData.wattpics : undefined,
        powerUnit: formData.powerUnit,
        status: formData.status,
      });

      toast({
        title: "Part Updated",
        description: `${updatedPart.name} has been updated successfully`,
      });

      onSuccess?.(updatedPart);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Failed to Update Part",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const subtotal = formData.unitCost;
    const tax = (subtotal * formData.taxRate) / 100;
    return subtotal + tax;
  };

  const handleDelete = async () => {
    if (!part) return;
    const confirmed = window.confirm(`Delete part ${part.partId}? This cannot be undone.`);
    if (!confirmed) return;

    setDeleting(true);
    try {
      await dataConnector.deletePart(part.partId);
      toast({
        title: "Part Deleted",
        description: `${part.name} has been removed from inventory`,
        variant: "destructive",
      });
      onDelete?.(part.partId);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Failed to Delete Part",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adjust Part</DialogTitle>
          <DialogDescription>
            Edit part parameters and stock levels for {part?.partId}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="partId">Part ID</Label>
              <Input
                id="partId"
                value={part?.partId || ""}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="name">company *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Solar Panel 300W"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Solar Panels"
              />
            </div>

            <div>
              <Label htmlFor="inStock">Stock Quantity *</Label>
              <Input
                id="inStock"
                type="number"
                value={formData.inStock}
                onChange={(e) =>
                  setFormData({ ...formData, inStock: parseFloat(e.target.value) || 0 })
                }
                step="0.01"
                required
              />
            </div>

            <div>
              <Label htmlFor="unit">Unit *</Label>
              <Select
                value={formData.unit}
                onValueChange={(value: Unit) => setFormData({ ...formData, unit: value })}
              >
                <SelectTrigger id="unit">
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

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: PartStatus) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
                </SelectContent>
              </Select>
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

            {/* Power Rating with wp/kw toggle */}
            <div className="col-span-2">
              <Label className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-yellow-500" />
                Power Rating
              </Label>
              <div className="flex gap-2 mt-1.5">
                <div className="flex rounded-md border overflow-hidden shrink-0">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, powerUnit: "wp" })}
                    className={`px-3 py-2 text-xs font-semibold transition-colors ${
                      formData.powerUnit === "wp"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    wp
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, powerUnit: "kw" })}
                    className={`px-3 py-2 text-xs font-semibold transition-colors border-l ${
                      formData.powerUnit === "kw"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    kw
                  </button>
                </div>
                <Input
                  id="wattpics"
                  type="number"
                  value={formData.wattpics}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      wattpics: e.target.value === "" ? "" : parseFloat(e.target.value) || "",
                    })
                  }
                  placeholder={formData.powerUnit === "wp" ? "e.g. 300" : "e.g. 1.5"}
                  min="0"
                  step={formData.powerUnit === "wp" ? "1" : "0.001"}
                  className="flex-1"
                />
              </div>
              {formData.wattpics !== "" && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.wattpics} {formData.powerUnit}
                  {formData.powerUnit === "kw" && (
                    <span className="ml-1 text-muted-foreground/60">
                      ({Number(formData.wattpics) * 1000} wp equivalent)
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {formData.unitCost > 0 && (
            <div className="p-4 bg-muted/30 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Unit Cost:</span>
                <span className="font-medium">₹{formData.unitCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax ({formData.taxRate}%):</span>
                <span className="font-medium">
                  ₹{((formData.unitCost * formData.taxRate) / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total with Tax:</span>
                <span className="text-success">₹{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading || deleting}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading || deleting}>
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Part
            </Button>
            <Button type="submit" disabled={loading || deleting}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Part
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};