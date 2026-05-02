import { ParsedInvoiceDTO } from '../schemas/invoice.schema';
import { config } from '../config';
import { logger } from './stream.service';

export class InvoiceExtractService {
  async extractInvoice(buffer: Buffer): Promise<ParsedInvoiceDTO> {
    try {
      const pdfParseModule = await import('pdf-parse');
      const pdfParse = (pdfParseModule as any).default || pdfParseModule;
      const data = await pdfParse(buffer);
      return this.parseText(data.text);
    } catch (err) {
      logger.error({ err }, 'PDF parse error');
      throw new Error('Failed to parse PDF');
    }
  }

  private parseText(text: string): ParsedInvoiceDTO {
    const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

    const vendor = this.extractVendor(lines);
    const invoiceNo = this.extractInvoiceNo(lines);
    const date = this.extractDate(lines);
    const currency = this.extractCurrency(lines);

    const items = this.extractItems(lines);

    return {
      vendor,
      invoiceNo,
      date,
      currency,
      items,
    };
  }

  private extractVendor(lines: string[]): string | undefined {
    if (lines.length > 0) {
      return lines[0];
    }
    return undefined;
  }

  private extractInvoiceNo(lines: string[]): string | undefined {
    const patterns = [/invoice\s*#?:?\s*(\S+)/i, /inv\s*#?:?\s*(\S+)/i, /invoice\s*no\s*:?\s*(\S+)/i];
    for (const line of lines) {
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          return match[1];
        }
      }
    }
    return undefined;
  }

  private extractDate(lines: string[]): string | undefined {
    const datePatterns = [
      /\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/,
      /\d{4}[-\/]\d{1,2}[-\/]\d{1,2}/,
      /\d{1,2}\s+\w+\s+\d{4}/,
    ];
    for (const line of lines) {
      for (const pattern of datePatterns) {
        const match = line.match(pattern);
        if (match) {
          try {
            const date = new Date(match[0]);
            if (!isNaN(date.getTime())) {
              return date.toISOString();
            }
          } catch {
            return match[0];
          }
        }
      }
    }
    return undefined;
  }

  private extractCurrency(lines: string[]): string | undefined {
    const currencySymbols = ['₹', 'INR', '$', 'USD', '€', 'EUR', '£', 'GBP'];
    const joinedText = lines.join(' ').toUpperCase();
    for (const symbol of currencySymbols) {
      if (joinedText.includes(symbol)) {
        return symbol.length === 1 ? this.mapSymbol(symbol) : symbol;
      }
    }
    return undefined;
  }

  private mapSymbol(symbol: string): string {
    const map: Record<string, string> = {
      '₹': 'INR',
      '$': 'USD',
      '€': 'EUR',
      '£': 'GBP',
    };
    return map[symbol] || symbol;
  }

  private extractItems(lines: string[]): ParsedInvoiceDTO['items'] {
    const items: ParsedInvoiceDTO['items'] = [];

    const idHeaders = ['SKU', 'ITEM', 'PRODUCT', 'PART', 'CODE', 'PART NO', 'ITEM CODE', 'PART NO.'];
    const qtyHeaders = ['QTY', 'QUANTITY'];
    const unitHeaders = ['UNIT', 'UOM'];
    const priceHeaders = ['PRICE', 'UNIT PRICE', 'RATE', 'UNIT COST'];
    const totalHeaders = ['AMOUNT', 'LINE TOTAL', 'TOTAL'];

    let headerLine = -1;
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const upper = lines[i].toUpperCase();
      if (idHeaders.some((h) => upper.includes(h)) && qtyHeaders.some((h) => upper.includes(h))) {
        headerLine = i;
        break;
      }
    }

    if (headerLine === -1) {
      return items;
    }

    for (let i = headerLine + 1; i < lines.length; i++) {
      const parts = lines[i].split(/\s+/).filter((p) => p.length > 0);
      if (parts.length < 2) continue;

      const quantity = this.parseNumber(parts[1]);
      const price = parts.length > 2 ? this.parseNumber(parts[2]) : undefined;

      if (quantity && quantity > 0) {
        items.push({
          rawDescription: lines[i],
          suggested: {
            partId: undefined,
            name: parts[0],
            quantity,
            unitCost: price,
            unit: 'pcs' as const,
          },
          confidence: price ? 0.8 : 0.5,
        });
      }
    }

    return items;
  }

  private parseNumber(str: string): number | undefined {
    const cleaned = str.replace(/[^\d.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? undefined : num;
  }
}

export const invoiceExtractService = new InvoiceExtractService();

