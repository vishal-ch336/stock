import { useEffect, useState } from "react";
import { useMovementsStore } from "@/stores/useMovementsStore";
import { useManagerMode } from "@/hooks/useManagerMode";
import { MovementsLog } from "@/components/MovementsLog";
import { MovementModal } from "@/components/modals/MovementModal";
import { EditMovementModal } from "@/components/modals/EditMovementModal";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowUpRight, Settings } from "lucide-react";
import { Movement } from "@/types";

export const Movements = () => {
  const { movements, fetchMovements } = useMovementsStore();
  const isManager = useManagerMode();
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<"PURCHASE" | "SALE" | "ADJUST">("PURCHASE");
  const [editMovementOpen, setEditMovementOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);

  useEffect(() => {
    fetchMovements();
  }, []);

  const handleMovementSuccess = () => {
    fetchMovements({ pageSize: 100 });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Movements</h2>
          <p className="text-muted-foreground">
            Complete history of inventory transactions
          </p>
        </div>
        {isManager && (
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setMovementType("PURCHASE");
                setMovementModalOpen(true);
              }}
              className="gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Purchase
            </Button>
            <Button
              onClick={() => {
                setMovementType("SALE");
                setMovementModalOpen(true);
              }}
              variant="secondary"
              className="gap-2"
            >
              <ArrowUpRight className="h-4 w-4" />
              Sale
            </Button>
          </div>
        )}
      </div>

      <MovementsLog
        movements={movements}
        onEdit={isManager ? (movement) => {
          setSelectedMovement(movement);
          setEditMovementOpen(true);
        } : undefined}
      />

      <MovementModal
        open={movementModalOpen}
        onOpenChange={setMovementModalOpen}
        type={movementType}
        onSuccess={handleMovementSuccess}
      />

      <EditMovementModal
        open={editMovementOpen}
        onOpenChange={setEditMovementOpen}
        movement={selectedMovement}
        onSuccess={handleMovementSuccess}
      />
    </div>
  );
};
