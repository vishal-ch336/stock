import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Overview } from "./Overview";
import { Parts } from "./Parts";
import { Movements } from "./Movements";
import { Settings } from "./Settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dataConnector } from "@/lib/dataConnector";
import { usePartsStore } from "@/stores/usePartsStore";
import { useMovementsStore } from "@/stores/useMovementsStore";
import { useStatsStore } from "@/stores/useStatsStore";
import { useUIStore } from "@/stores/useUIStore";
import { AuthTokenSync } from "@/components/AuthTokenSync";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { upsertPart } = usePartsStore();
  const { prependMovement } = useMovementsStore();
  const { fetchOverview } = useStatsStore();
  const { setSSEConnected, tokenReady } = useUIStore();

  useEffect(() => {
    const disconnect = dataConnector.connectSSE((event) => {
      setSSEConnected(true);

      if (event.event === "movement.created") {
        prependMovement(event.data.movement);
        if (event.data.partAfter) {
          upsertPart(event.data.partAfter);
        }
        fetchOverview();
      } else if (event.event === "part.updated") {
        upsertPart(event.data.part);
      }
    });

    return () => {
      disconnect();
      setSSEConnected(false);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <AuthTokenSync />
      <Header />

      <main className="container mx-auto px-4 py-6">
        {!tokenReady ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-4 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="parts">Parts</TabsTrigger>
              <TabsTrigger value="movements">Movements</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Overview />
            </TabsContent>

            <TabsContent value="parts">
              <Parts />
            </TabsContent>

            <TabsContent value="movements">
              <Movements />
            </TabsContent>

            <TabsContent value="settings">
              <Settings />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Index;
