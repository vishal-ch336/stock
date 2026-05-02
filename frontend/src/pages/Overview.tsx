import { useEffect, useState } from "react";
import { useStatsStore } from "@/stores/useStatsStore";
import { useMovementsStore } from "@/stores/useMovementsStore";
import { useUIStore } from "@/stores/useUIStore";
import { KPICard } from "@/components/KPICard";
import { RecentChanges } from "@/components/RecentChanges";
import { PurchasesSalesChart } from "@/components/PurchasesSalesChart";
import { TopSKUsChart } from "@/components/TopSKUsChart";
import { MovementModal } from "@/components/modals/MovementModal";
import { Button } from "@/components/ui/button";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Activity,
  Boxes,
  ShoppingCart,
  ArrowUpRight,
} from "lucide-react";

export const Overview = () => {
  const { overview, topSkus, dailyNet, fetchOverview, fetchTopSkus, fetchDailyNet } =
    useStatsStore();
  const { movements, fetchMovements } = useMovementsStore();
  const { managerMode } = useUIStore();
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<"PURCHASE" | "SALE">("PURCHASE");

  useEffect(() => {
    fetchOverview();
    fetchTopSkus(5);
    fetchDailyNet(30);
    fetchMovements({ pageSize: 10 });
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleMovementSuccess = () => {
    fetchOverview();
    fetchTopSkus(5);
    fetchDailyNet(30);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground">
            Real-time inventory insights and performance metrics
          </p>
        </div>
        {managerMode && (
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KPICard
          title="Total SKUs"
          value={overview?.totalSkus || 0}
          icon={Package}
          subtitle="Active products"
        />
        <KPICard
          title="Total In-Stock Units"
          value={overview?.totalInStock || 0}
          icon={Boxes}
          subtitle="All units"
        />
        <KPICard
          title="Available Units"
          value={overview?.availableUnits || 0}
          icon={TrendingUp}
          subtitle="Ready for sale"
          variant="success"
        />
        <KPICard
          title="Low-Stock SKUs"
          value={overview?.lowStockSkus || 0}
          icon={AlertTriangle}
          subtitle="Below minimum"
          variant={overview?.lowStockSkus ? "warning" : "default"}
        />
        <KPICard
          title="Inventory Value"
          value={overview?.inventoryValue ? formatCurrency(overview.inventoryValue) : "₹0"}
          icon={DollarSign}
          subtitle="Total value"
        />
        <KPICard
          title="Changes (24h)"
          value={overview?.changesLast24h || 0}
          icon={Activity}
          subtitle="Recent movements"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PurchasesSalesChart data={dailyNet} />
        <TopSKUsChart data={topSkus} />
      </div>

      <RecentChanges movements={movements} />

      <MovementModal
        open={movementModalOpen}
        onOpenChange={setMovementModalOpen}
        type={movementType}
        onSuccess={handleMovementSuccess}
      />
    </div>
  );
};
