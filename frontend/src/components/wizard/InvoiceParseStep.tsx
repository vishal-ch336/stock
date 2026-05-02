import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { ParsedInvoiceDTO } from "@/types";
import { dataConnector } from "@/lib/dataConnector";
import { useToast } from "@/hooks/use-toast";

interface InvoiceParseStepProps {
  file: File;
  onParsed: (data: ParsedInvoiceDTO) => void;
  onBack: () => void;
}

export const InvoiceParseStep = ({ file, onParsed, onBack }: InvoiceParseStepProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    parseFile();
  }, [file]);

  const parseFile = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await dataConnector.parseInvoicePdf(file);
      onParsed(result);
    } catch (err: any) {
      setError(err.message || "Failed to parse invoice");
      toast({
        title: "Parse Failed",
        description: err.message || "Failed to parse invoice PDF",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      {loading && (
        <>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Parsing Invoice...</h3>
            <p className="text-sm text-muted-foreground">
              Extracting line items, costs, and supplier information
            </p>
          </div>
        </>
      )}

      {error && (
        <>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-destructive">Parse Failed</h3>
            <p className="text-sm text-muted-foreground max-w-md">{error}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={onBack} variant="outline">
              Go Back
            </Button>
            <Button onClick={parseFile}>Retry</Button>
          </div>
        </>
      )}
    </div>
  );
};
