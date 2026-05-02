import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, FileDown, RotateCcw, FileText } from "lucide-react";
import { InvoiceImportWizard } from "@/components/InvoiceImportWizard";
import { useToast } from "@/hooks/use-toast";
import { dataConnector } from "@/lib/dataConnector";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { usePartsStore } from "@/stores/usePartsStore";
import { useMovementsStore } from "@/stores/useMovementsStore";

export const Settings = () => {
  const [importWizardOpen, setImportWizardOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const { toast } = useToast();
  const { fetchParts } = usePartsStore();
  const { fetchMovements } = useMovementsStore();

  const handleImportSuccess = () => {
    toast({
      title: "Import Complete",
      description: "Invoice data has been successfully imported",
    });
  };

  const handleResetData = async () => {
    setResetting(true);
    try {
      const result = await dataConnector.resetData();

      toast({
        title: "Data Reset Complete",
        description: `Deleted ${result.deletedParts} parts and ${result.deletedMovements} movements`,
      });

      // Refresh data in stores
      await fetchParts();
      await fetchMovements();

      setResetDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message || "Failed to reset data",
        variant: "destructive",
      });
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage data import/export and system preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Invoice (PDF) Import
            </CardTitle>
            <CardDescription>
              Upload and parse invoice PDFs to automatically create parts and purchase movements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setImportWizardOpen(true)} className="w-full gap-2">
              <FileUp className="h-4 w-4" />
              Import from Invoice
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileDown className="h-5 w-5 text-primary" />
              Export Data
            </CardTitle>
            <CardDescription>
              Export your inventory data to CSV or JSON format
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full gap-2">
              <FileDown className="h-4 w-4" />
              Export Parts (CSV)
            </Button>
            <Button variant="outline" className="w-full gap-2">
              <FileDown className="h-4 w-4" />
              Export Movements (CSV)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-warning" />
              Reset Demo Data
            </CardTitle>
            <CardDescription>
              Reset the application to demo data (local mode only)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => setResetDialogOpen(true)}
              disabled={resetting}
            >
              <RotateCcw className="h-4 w-4" />
              {resetting ? "Resetting..." : "Reset to Demo"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <InvoiceImportWizard
        open={importWizardOpen}
        onOpenChange={setImportWizardOpen}
        onSuccess={handleImportSuccess}
      />

      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete all parts and movements from your database.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={resetting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetData}
              disabled={resetting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {resetting ? "Resetting..." : "Reset All Data"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
