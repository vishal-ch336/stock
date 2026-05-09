import { useState } from "react";
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

interface AddPartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (part: Part) => void;
}

type PowerUnit = "wp" | "kw";

export const AddPartModal = ({ open, onOpenChange, onSuccess }: AddPartModalProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    partId: "",
    name: "",
    category: "",
    location: "",
    inStock: 0,
    minStock: 0,
    unit: "pcs" as Unit,
    unitCost: 0,
    taxRate: 5,
    wattpics: "" as number | "",
    powerUnit: "wp" as PowerUnit,
    status: "ACTIVE" as PartStatus,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const part = await dataConnector.createPart({
        partId: formData.partId,
        name: formData.name,
        category: formData.category,
        location: formData.location,
        inStock: formData.inStock,
        minStock: formData.minStock,
        unit: formData.unit,
        unitCost: formData.unitCost,
        taxRate: formData.taxRate,
        wattpics: typeof formData.wattpics === "number" ? formData.wattpics : undefined,
        powerUnit: formData.powerUnit,
        status: formData.status,
      });

      toast({
        title: "Part Created",
        description: `${part.name} has been added to inventory`,
      });

      onSuccess?.(part);
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Failed to Create Part",
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
      name: "",
      category: "",
      location: "",
      inStock: 0,
      minStock: 0,
      unit: "pcs",
      unitCost: 0,
      taxRate: 5,
      wattpics: "",
      powerUnit: "wp",
      status: "ACTIVE",
    });
  };

  const calculateTotal = () => {
    const subtotal = formData.unitCost;
    const tax = (subtotal * formData.taxRate) / 100;
    return subtotal + tax;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Part</DialogTitle>
          <DialogDescription>
            Create a new part in the inventory system
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="partId">Part ID *</Label>
              <Input
                id="partId"
                value={formData.partId}
                onChange={(e) => setFormData({ ...formData, partId: e.target.value })}
                placeholder="SP-001"
                required
              />
            </div>

            <div>
              <Label htmlFor="name">Company *</Label>
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

            {/* Power Rating Field with wp/kw toggle */}
            <div>
              <Label className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-yellow-500" />
                Power Rating
              </Label>
              <div className="flex gap-2 mt-1.5">
                {/* wp / kw segmented toggle */}
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
                      ({(Number(formData.wattpics) * 1000)} wp equivalent)
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Part
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
