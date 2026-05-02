import { useState } from "react";
import { Movement } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, FileText, Edit, Search, X } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface MovementsLogProps {
  movements: Movement[];
  onEdit?: (movement: Movement) => void;
}

export const MovementsLog = ({ movements, onEdit }: MovementsLogProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Filter movements based on all criteria
  const filteredMovements = movements.filter((movement) => {
    // Search filter
    const matchesSearch =
      searchTerm === "" ||
      movement.partId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (movement.supplier && movement.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (movement.note && movement.note.toLowerCase().includes(searchTerm.toLowerCase()));

    // Type filter
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(movement.type);

    // Date range filter
    const movementDate = new Date(movement.timestamp);
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate = dateTo ? new Date(dateTo + "T23:59:59") : null;

    const matchesDateFrom = !fromDate || movementDate >= fromDate;
    const matchesDateTo = !toDate || movementDate <= toDate;

    return matchesSearch && matchesType && matchesDateFrom && matchesDateTo;
  });

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTypes([]);
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters = searchTerm || selectedTypes.length > 0 || dateFrom || dateTo;

  const getTypeBadge = (type: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      PURCHASE: { variant: "default", label: "Purchase" },
      SALE: { variant: "secondary", label: "Sale" },
      RETURN: { variant: "outline", label: "Return" },
      ADJUST: { variant: "outline", label: "Adjust" },
    };
    const config = variants[type] || { variant: "outline", label: type };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (value?: number) => {
    if (!value) return "-";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Add title
    doc.setFontSize(18);
    doc.text("Movements History Report", 14, 15);

    // Add export date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
    doc.text(`Total Movements: ${filteredMovements.length}`, 14, 28);

    // Prepare table data
    const tableData = filteredMovements.map((movement) => [
      new Date(movement.timestamp).toLocaleString(),
      movement.partId,
      movement.partName,
      movement.category || "-",
      movement.wattpics ? `${movement.wattpics} wp` : "-",
      movement.type,
      movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity.toString(),
      formatCurrency(movement.unitCost),
      movement.taxRate ? `${movement.taxRate}%` : "-",
      movement.totalWithTax ? formatCurrency(movement.totalWithTax * Math.abs(movement.quantity)) : "-",
      movement.supplier || "-",
      movement.note || "-",
    ]);

    // Generate table
    autoTable(doc, {
      startY: 32,
      head: [["Timestamp", "HSN/SAC", "Company", "Category", "WattPics", "Type", "Quantity", "Unit Cost", "Tax", "Total + Tax", "Supplier", "Note"]],
      body: tableData,
      styles: {
        fontSize: 7,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 18 },
        2: { cellWidth: 25 },
        3: { cellWidth: 20 },
        4: { cellWidth: 15 },
        5: { cellWidth: 15 },
        6: { cellWidth: 15, halign: "right" },
        7: { cellWidth: 18, halign: "right" },
        8: { cellWidth: 12, halign: "right" },
        9: { cellWidth: 20, halign: "right" },
        10: { cellWidth: 22 },
        11: { cellWidth: 30 },
      },
    });

    // Save the PDF
    const timestamp = new Date().toISOString().split('T')[0];
    doc.save(`movements-export-${timestamp}.pdf`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Movement History</h3>
          <p className="text-sm text-muted-foreground">
            Complete log of all inventory transactions
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleExportPDF}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Filter Controls */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search HSN/SAC, company, supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Date Range */}
          <div className="flex gap-2">
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="From date"
              className="max-w-[150px]"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="To date"
              className="max-w-[150px]"
            />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {/* Type Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Type:</span>
          {["PURCHASE", "SALE", "RETURN", "ADJUST"].map((type) => (
            <Badge
              key={type}
              variant={selectedTypes.includes(type) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleType(type)}
            >
              {type.charAt(0) + type.slice(1).toLowerCase()}
            </Badge>
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Timestamp</TableHead>
                <TableHead className="font-semibold">HSN/SAC</TableHead>
                <TableHead className="font-semibold">company</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">WattPics</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold text-right">Quantity</TableHead>
                <TableHead className="font-semibold text-right">Unit Cost</TableHead>
                <TableHead className="font-semibold text-right">Tax</TableHead>
                <TableHead className="font-semibold text-right">Total + Tax</TableHead>
                <TableHead className="font-semibold">Supplier</TableHead>
                <TableHead className="font-semibold">Note</TableHead>
                {onEdit && <TableHead className="font-semibold">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="text-sm">
                    {new Date(movement.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {movement.partId}
                    </code>
                  </TableCell>
                  <TableCell className="font-medium">{movement.partName}</TableCell>
                  <TableCell className="text-sm">{movement.category || "-"}</TableCell>
                  <TableCell className="text-sm text-right">
                    {movement.wattpics ? `${movement.wattpics} wp` : "-"}
                  </TableCell>
                  <TableCell>{getTypeBadge(movement.type)}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        movement.quantity > 0
                          ? "text-success font-semibold"
                          : "text-destructive font-semibold"
                      }
                    >
                      {movement.quantity > 0 ? "+" : ""}
                      {movement.quantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(movement.unitCost)}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {movement.taxRate ? `${movement.taxRate}%` : "-"}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-success">
                    {movement.totalWithTax ? formatCurrency(movement.totalWithTax * Math.abs(movement.quantity)) : "-"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {movement.supplier || "-"}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="flex items-center gap-2">
                      {movement.invoiceNo && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <FileText className="h-3 w-3" />
                          {movement.invoiceNo}
                        </Badge>
                      )}
                      {movement.note && (
                        <span className="text-xs text-muted-foreground truncate">
                          {movement.note}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  {onEdit && (
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(movement)}
                        className="gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredMovements.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {hasActiveFilters ? "No movements match filters" : "No movements recorded"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters ? "Try adjusting your filters" : "Movement history will appear here"}
            </p>
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredMovements.length} {filteredMovements.length !== movements.length && `of ${movements.length}`} movements
      </div>
    </div>
  );
};
