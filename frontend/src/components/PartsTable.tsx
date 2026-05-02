import { useState } from "react";
import { Part } from "@/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Download, Plus, Package, ShoppingCart, TrendingUp, Settings, X } from "lucide-react";
import { useUIStore } from "@/stores/useUIStore";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PartsTableProps {
  parts: Part[];
  onAddPart?: () => void;
  onPurchase?: () => void;
  onSale?: () => void;
  onAdjust?: (part: Part) => void;
}

export const PartsTable = ({ parts, onAddPart, onPurchase, onSale, onAdjust }: PartsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [wattpicsMin, setWattpicsMin] = useState("");
  const [wattpicsMax, setWattpicsMax] = useState("");
  const [stockStatus, setStockStatus] = useState<string[]>([]);
  const { managerMode } = useUIStore();

  // Get unique categories and units
  const uniqueCategories = Array.from(new Set(parts.map(p => p.category).filter(Boolean)));
  const uniqueUnits = Array.from(new Set(parts.map(p => p.unit)));

  const filteredParts = parts.filter((part) => {
    const matchesSearch =
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.partId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = !selectedCategory || selectedCategory === 'all' || part.category === selectedCategory;

    const matchesUnit = !selectedUnit || selectedUnit === 'all' || part.unit === selectedUnit;

    const minWp = wattpicsMin ? parseFloat(wattpicsMin) : null;
    const maxWp = wattpicsMax ? parseFloat(wattpicsMax) : null;
    const matchesWattpics =
      (!minWp || (part.wattpics !== undefined && part.wattpics >= minWp)) &&
      (!maxWp || (part.wattpics !== undefined && part.wattpics <= maxWp));

    // Stock status filter
    let matchesStockStatus = true;
    if (stockStatus.length > 0) {
      matchesStockStatus = stockStatus.some(status => {
        if (status === "low") return part.inStock < part.minStock;
        if (status === "out") return part.inStock === 0;
        if (status === "normal") return part.inStock >= part.minStock;
        return false;
      });
    }

    return matchesSearch && matchesCategory && matchesUnit && matchesWattpics && matchesStockStatus;
  });

  const toggleStockStatus = (status: string) => {
    setStockStatus((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedUnit("all");
    setWattpicsMin("");
    setWattpicsMax("");
    setStockStatus([]);
  };

  const hasActiveFilters = searchTerm || (selectedCategory && selectedCategory !== 'all') || (selectedUnit && selectedUnit !== 'all') ||
    wattpicsMin || wattpicsMax || stockStatus.length > 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="default">Active</Badge>;
      case "INACTIVE":
        return <Badge variant="secondary">Inactive</Badge>;
      case "DISCONTINUED":
        return <Badge variant="outline">Discontinued</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return "-";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const calculatePartNetWorth = (part: Part) => {
    const unitCost = part.unitCost || 0;
    const inStock = part.inStock || 0;
    const wattpics = part.wattpics || 1;
    const taxRate = part.taxRate || 0;

    const baseValue = unitCost * wattpics * inStock;
    const taxAmount = baseValue * (taxRate / 100);
    return baseValue + taxAmount;
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Add title
    doc.setFontSize(18);
    doc.text("Parts Inventory Report", 14, 15);

    // Add export date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);
    doc.text(`Total Parts: ${filteredParts.length}`, 14, 28);

    // Prepare table data
    const tableData = filteredParts.map((part) => [
      part.name,
      part.partId,
      part.category || "-",
      `${part.inStock} / ${part.available}`,
      part.unit,
      part.wattpics !== undefined && part.wattpics !== null ? part.wattpics.toString() : "-",
      formatCurrency(calculatePartNetWorth(part)),
    ]);

    // Generate table
    autoTable(doc, {
      startY: 32,
      head: [["Company", "HSN/SAC", "Category", "Stock / Available", "Unit", "WattPics (wp)", "Net Worth"]],
      body: tableData,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 30 },
        2: { cellWidth: 40 },
        3: { cellWidth: 35, halign: "right" },
        4: { cellWidth: 20, halign: "center" },
        5: { cellWidth: 30, halign: "right" },
        6: { cellWidth: 35, halign: "right" },
      },
    });

    // Save the PDF
    const timestamp = new Date().toISOString().split('T')[0];
    doc.save(`parts-export-${timestamp}.pdf`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        {/* Search and Action Buttons Row */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search parts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleExportPDF}>
              <Download className="h-4 w-4" />
              Export
            </Button>

            {managerMode && (
              <>
                {onPurchase && (
                  <Button size="sm" onClick={onPurchase} className="gap-2" variant="default">
                    <ShoppingCart className="h-4 w-4" />
                    Purchase
                  </Button>
                )}
                {onSale && (
                  <Button size="sm" onClick={onSale} className="gap-2" variant="secondary">
                    <TrendingUp className="h-4 w-4" />
                    Sale
                  </Button>
                )}
                {onAddPart && (
                  <Button size="sm" onClick={onAddPart} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Part
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            {/* Category Filter */}
            <Select value={selectedCategory || "all"} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map((category) => (
                  <SelectItem key={category} value={category!}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Unit Filter */}
            <Select value={selectedUnit || "all"} onValueChange={setSelectedUnit}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Units" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units</SelectItem>
                {uniqueUnits.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* WattPics Range */}
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                placeholder="Min WP"
                value={wattpicsMin}
                onChange={(e) => setWattpicsMin(e.target.value)}
                className="w-[100px]"
                min="0"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="Max WP"
                value={wattpicsMax}
                onChange={(e) => setWattpicsMax(e.target.value)}
                className="w-[100px]"
                min="0"
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
                Clear All
              </Button>
            )}
          </div>

          {/* Stock Status Filters */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Stock:</span>
            <Badge
              variant={stockStatus.includes("low") ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleStockStatus("low")}
            >
              Low Stock
            </Badge>
            <Badge
              variant={stockStatus.includes("out") ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleStockStatus("out")}
            >
              Out of Stock
            </Badge>
            <Badge
              variant={stockStatus.includes("normal") ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleStockStatus("normal")}
            >
              Normal Stock
            </Badge>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">company</TableHead>
                <TableHead className="font-semibold">HSN/SAC</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold text-right">Stock / Available</TableHead>
                <TableHead className="font-semibold">Unit</TableHead>
                <TableHead className="font-semibold text-right">WattPics (wp)</TableHead>
                <TableHead className="font-semibold text-right">Net Worth</TableHead>
                {onAdjust && <TableHead className="font-semibold">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParts.map((part) => (
                <TableRow
                  key={part.partId}
                  className={part.inStock < part.minStock ? "bg-warning/5" : ""}
                >
                  <TableCell className="font-medium">{part.name}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {part.partId}
                    </code>
                  </TableCell>
                  <TableCell>{part.category || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col">
                      <span className="font-semibold">{part.inStock}</span>
                      <span
                        className={
                          part.available < part.minStock
                            ? "text-warning text-xs"
                            : "text-success text-xs"
                        }
                      >
                        {part.available} avail
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {part.unit}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {part.wattpics !== undefined && part.wattpics !== null ? part.wattpics : "-"}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-primary">
                    {formatCurrency(calculatePartNetWorth(part))}
                  </TableCell>
                  {onAdjust && (
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onAdjust(part)}
                        className="gap-2"
                      >
                        <Settings className="h-4 w-4" />
                        Adjust
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredParts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No parts found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {filteredParts.length} of {parts.length} parts
      </div>
    </div>
  );
};
