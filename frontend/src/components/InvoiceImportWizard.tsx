import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileCheck, Edit, AlertCircle, CheckCircle } from "lucide-react";
import { InvoiceUploadStep } from "./wizard/InvoiceUploadStep";
import { InvoiceParseStep } from "./wizard/InvoiceParseStep";
import { InvoiceMappingStep } from "./wizard/InvoiceMappingStep";
import { InvoiceConflictsStep } from "./wizard/InvoiceConflictsStep";
import { InvoiceConfirmStep } from "./wizard/InvoiceConfirmStep";
import { InvoiceBatchSummary } from "./wizard/InvoiceBatchSummary";
import { ParsedInvoiceDTO, IngestInvoiceDTO } from "@/types";

interface InvoiceImportWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface InvoiceProcessingState {
  file: File;
  parsed?: ParsedInvoiceDTO;
  mapped?: IngestInvoiceDTO;
  result?: {
    success: boolean;
    createdParts: number;
    createdMovements: number;
    totalQuantity: number;
    totalValue: number;
    error?: string;
  };
}

export const InvoiceImportWizard = ({
  open,
  onOpenChange,
  onSuccess,
}: InvoiceImportWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [invoices, setInvoices] = useState<InvoiceProcessingState[]>([]);
  const [currentInvoiceIndex, setCurrentInvoiceIndex] = useState(0);

  const steps = [
    { number: 1, title: "Upload", icon: Upload },
    { number: 2, title: "Parse", icon: FileCheck },
    { number: 3, title: "Map Items", icon: Edit },
    { number: 4, title: "Review", icon: AlertCircle },
    { number: 5, title: "Import", icon: CheckCircle },
    { number: 6, title: "Summary", icon: CheckCircle },
  ];

  const currentInvoice = invoices[currentInvoiceIndex];

  const handleClose = () => {
    setCurrentStep(1);
    setFiles([]);
    setInvoices([]);
    setCurrentInvoiceIndex(0);
    onOpenChange(false);
  };

  const handleFilesSelected = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setInvoices(selectedFiles.map((file) => ({ file })));
    setCurrentInvoiceIndex(0);
    setCurrentStep(2);
  };

  const handleParsed = (data: ParsedInvoiceDTO) => {
    setInvoices((prev) =>
      prev.map((inv, idx) =>
        idx === currentInvoiceIndex ? { ...inv, parsed: data } : inv
      )
    );
    setCurrentStep(3);
  };

  const handleMapped = (data: IngestInvoiceDTO) => {
    setInvoices((prev) =>
      prev.map((inv, idx) =>
        idx === currentInvoiceIndex ? { ...inv, mapped: data } : inv
      )
    );
    setCurrentStep(4);
  };

  const handleConflictsResolved = () => {
    setCurrentStep(5);
  };

  const handleInvoiceCompleted = (result: any) => {
    setInvoices((prev) =>
      prev.map((inv, idx) =>
        idx === currentInvoiceIndex ? { ...inv, result } : inv
      )
    );

    // Check if there are more invoices to process
    if (currentInvoiceIndex < invoices.length - 1) {
      setCurrentInvoiceIndex((prev) => prev + 1);
      setCurrentStep(2); // Go back to parse step for next invoice
    } else {
      setCurrentStep(6); // Go to summary step
    }
  };

  const handleSuccess = () => {
    handleClose();
    onSuccess?.();
  };

  const progressValue = (currentStep / steps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Import from Invoice (PDF)
            {invoices.length > 0 && currentStep > 1 && currentStep < 6 && (
              <span className="text-base font-normal text-muted-foreground ml-2">
                - Processing {currentInvoiceIndex + 1} of {invoices.length}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Upload and parse multiple invoices to automatically create parts and purchase movements
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-auto">
          <div className="flex items-center justify-between gap-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex flex-1 items-center gap-2">
                  <div
                    className={`flex items-center gap-2 flex-1 rounded-lg px-3 py-2 border transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : isCompleted
                        ? "bg-success/10 text-success border-success/30"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium hidden sm:inline">
                      {step.title}
                    </span>
                    <span className="text-sm font-medium sm:hidden">{step.number}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="h-px w-4 bg-border flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          <Progress value={progressValue} className="h-2" />

          <div className="min-h-[400px]">
            {currentStep === 1 && <InvoiceUploadStep onFilesSelected={handleFilesSelected} />}
            {currentStep === 2 && currentInvoice && (
              <InvoiceParseStep
                file={currentInvoice.file}
                onParsed={handleParsed}
                onBack={() => setCurrentStep(1)}
              />
            )}
            {currentStep === 3 && currentInvoice?.parsed && (
              <InvoiceMappingStep
                parsedData={currentInvoice.parsed}
                onMapped={handleMapped}
                onBack={() => setCurrentStep(2)}
              />
            )}
            {currentStep === 4 && currentInvoice?.mapped && (
              <InvoiceConflictsStep
                mappedData={currentInvoice.mapped}
                onResolved={handleConflictsResolved}
                onBack={() => setCurrentStep(3)}
              />
            )}
            {currentStep === 5 && currentInvoice?.mapped && (
              <InvoiceConfirmStep
                mappedData={currentInvoice.mapped}
                fileName={currentInvoice.file.name}
                onSuccess={handleInvoiceCompleted}
                onBack={() => setCurrentStep(4)}
              />
            )}
            {currentStep === 6 && (
              <InvoiceBatchSummary invoices={invoices} onClose={handleSuccess} />
            )}
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
