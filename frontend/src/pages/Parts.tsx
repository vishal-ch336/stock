import { useEffect, useState } from "react";
import { usePartsStore } from "@/stores/usePartsStore";
import { useUIStore } from "@/stores/useUIStore";
import { PartsTable } from "@/components/PartsTable";
import { AddPartModal } from "@/components/modals/AddPartModal";
import { MovementModal } from "@/components/modals/MovementModal";
import { EditPartModal } from "@/components/modals/EditPartModal";
import { InventoryNetWorth } from "@/components/InventoryNetWorth";
import { Part } from "@/types";

export const Parts = () => {
  const { parts, fetchParts, upsertPart, deletePart } = usePartsStore();
  const { managerMode } = useUIStore();
  const [addPartOpen, setAddPartOpen] = useState(false);
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [saleOpen, setSaleOpen] = useState(false);
  const [editPartOpen, setEditPartOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

  useEffect(() => {
    fetchParts();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Parts Inventory</h2>
        <p className="text-muted-foreground">
          Manage and track all solar equipment parts
        </p>
      </div>

      <InventoryNetWorth />

      <PartsTable
        parts={parts}
        onAddPart={() => setAddPartOpen(true)}
        onPurchase={() => setPurchaseOpen(true)}
        onSale={() => setSaleOpen(true)}
        onAdjust={managerMode ? (part) => {
          setSelectedPart(part);
          setEditPartOpen(true);
        } : undefined}
      />

      <AddPartModal
        open={addPartOpen}
        onOpenChange={setAddPartOpen}
        onSuccess={(part) => {
          upsertPart(part);
          fetchParts();
        }}
      />

      <MovementModal
        open={purchaseOpen}
        onOpenChange={setPurchaseOpen}
        type="PURCHASE"
        onSuccess={() => fetchParts()}
      />

      <MovementModal
        open={saleOpen}
        onOpenChange={setSaleOpen}
        type="SALE"
        onSuccess={() => fetchParts()}
      />

      <EditPartModal
        open={editPartOpen}
        onOpenChange={setEditPartOpen}
        part={selectedPart}
        onSuccess={(part) => {
          upsertPart(part);
          fetchParts();
        }}
        onDelete={(partId) => {
          deletePart(partId);
          fetchParts();
        }}
      />
    </div>
  );
};
