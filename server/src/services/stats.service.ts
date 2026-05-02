import { Movement } from '../models/Movement';
import { Part } from '../models/Part';

export interface OverviewStats {
  totalSkus: number;
  totalInStock: number;
  availableUnits: number;
  lowStockSkus: number;
  inventoryValue: number;
  changesLast24h: number;
}

export interface TopSku {
  partId: string;
  partName: string;
  quantity: number;
}

export interface DailyNetData {
  date: string;
  purchases: number;
  sales: number;
}

export class StatsService {
  async getOverview(): Promise<OverviewStats> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [parts, movementsCount] = await Promise.all([
      Part.find({}),
      Movement.countDocuments({ createdAt: { $gte: oneDayAgo } }),
    ]);

    const totalSkus = parts.length;
    const totalInStock = parts.reduce((sum, p) => sum + p.inStock, 0);
    const availableUnits = parts.reduce((sum, p) => sum + Math.max(0, p.inStock - (p.reserved || 0)), 0);
    const lowStockSkus = parts.filter((p) => p.inStock > 0 && p.inStock < p.minStock).length;
    const inventoryValue = parts.reduce(
      (sum, p) => sum + p.inStock * (p.unitCost || 0),
      0
    );

    return {
      totalSkus,
      totalInStock,
      availableUnits,
      lowStockSkus,
      inventoryValue,
      changesLast24h: movementsCount,
    };
  }

  async getTopSkus(limit: number = 5): Promise<TopSku[]> {
    const topParts = await Part.find({ inStock: { $gt: 0 } })
      .sort({ inStock: -1 })
      .limit(limit);

    return topParts.map((p) => ({
      partId: p.partId,
      partName: p.name,
      quantity: p.inStock,
    }));
  }

  async getDailyNet(days: number = 30): Promise<DailyNetData[]> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const movements = await Movement.find({
      createdAt: { $gte: startDate },
      type: { $in: ['PURCHASE', 'SALE'] },
    }).sort({ createdAt: 1 });

    const dateMap = new Map<string, { purchases: number; sales: number }>();

    movements.forEach((m) => {
      const date = m.createdAt.toISOString().split('T')[0];
      if (!dateMap.has(date)) {
        dateMap.set(date, { purchases: 0, sales: 0 });
      }
      const data = dateMap.get(date)!;
      if (m.type === 'PURCHASE') {
        data.purchases += m.quantity; // Already positive
      } else if (m.type === 'SALE') {
        data.sales += Math.abs(m.quantity); // Convert negative to positive for display
      }
    });

    return Array.from(dateMap.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));
  }

  async getInventoryNetWorth(): Promise<{ netWorth: number; netWorthWithoutTax: number; totalTax: number }> {
    const parts = await Part.find({});

    let netWorth = 0;
    let netWorthWithoutTax = 0;
    let totalTax = 0;

    parts.forEach((part) => {
      const unitCost = part.unitCost || 0;
      const inStock = part.inStock || 0;
      const wattpics = part.wattpics || 1; // Default to 1 if not set (same as purchase/sales)
      const taxRate = part.taxRate || 0;

      // Calculate using same formula as purchase/sales: unitCost × wattpics × inStock
      const baseValue = unitCost * wattpics * inStock;
      const taxAmount = baseValue * (taxRate / 100);
      const valueWithTax = baseValue + taxAmount;

      netWorthWithoutTax += baseValue;
      totalTax += taxAmount;
      netWorth += valueWithTax;
    });

    return {
      netWorth,
      netWorthWithoutTax,
      totalTax,
    };
  }
}

export const statsService = new StatsService();

