import {
  Part,
  Movement,
  OverviewStats,
  TopSku,
  DailyNetData,
  ParsedInvoiceDTO,
  IngestInvoiceDTO,
  IngestResultDTO,
} from "@/types";

export interface NetWorthData {
  netWorth: number;
  netWorthWithoutTax: number;
  totalTax: number;
}

const BASE_URL = import.meta.env.VITE_API_BASE || "";

interface ListPartsParams {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

interface ListMovementsParams {
  partId?: string;
  type?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

interface SSEEvent {
  event: "movement.created" | "part.updated";
  data: any;
}

class DataConnector {
  private isApiAvailable = false;
  private sseConnection: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectDelay = 30000;
  private authToken: string | null = null;

  /** Called from React to inject the Clerk session token before making requests. */
  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  constructor() {
    this.checkApiAvailability();
  }

  private async checkApiAvailability() {
    if (!BASE_URL) {
      this.isApiAvailable = false;
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/health`, { method: "GET" });
      this.isApiAvailable = response.ok;
    } catch {
      this.isApiAvailable = false;
    }
  }

  private async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };
    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }
    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}`,
        code: response.status,
      }));
      throw new Error(error.message || `Request failed: ${response.status}`);
    }

    // Handle 204 No Content (DELETE requests)
    if (response.status === 204 || response.statusText === 'No Content') {
      return undefined as T;
    }

    // Check if response has content
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      return text ? JSON.parse(text) : undefined as T;
    }

    return undefined as T;
  }

  async listParts(params: ListPartsParams = {}): Promise<Part[]> {
    if (!this.isApiAvailable) {
      return this.getDemoParts();
    }

    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.category) query.append("category", params.category);
    if (params.status) query.append("status", params.status);
    if (params.page) query.append("page", params.page.toString());
    if (params.pageSize) query.append("pageSize", params.pageSize.toString());

    return this.fetchApi<Part[]>(`/api/parts?${query.toString()}`);
  }

  async createPart(part: Omit<Part, "available" | "lastMovement">): Promise<Part> {
    if (!this.isApiAvailable) {
      return { ...part, available: part.inStock, lastMovement: new Date().toISOString() };
    }

    return this.fetchApi<Part>("/api/parts", {
      method: "POST",
      body: JSON.stringify(part),
    });
  }

  async updatePart(partId: string, updates: Partial<Part>): Promise<Part> {
    if (!this.isApiAvailable) {
      throw new Error("Cannot update in demo mode");
    }

    return this.fetchApi<Part>(`/api/parts/${partId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  }

  async deletePart(partId: string): Promise<void> {
    if (!this.isApiAvailable) {
      throw new Error("Cannot delete in demo mode");
    }

    await this.fetchApi<void>(`/api/parts/${partId}`, {
      method: "DELETE",
    });
  }

  async listMovements(params: ListMovementsParams = {}): Promise<Movement[]> {
    if (!this.isApiAvailable) {
      return this.getDemoMovements();
    }

    const query = new URLSearchParams();
    if (params.partId) query.append("partId", params.partId);
    if (params.type) query.append("type", params.type);
    if (params.from) query.append("from", params.from);
    if (params.to) query.append("to", params.to);
    if (params.page) query.append("page", params.page.toString());
    if (params.pageSize) query.append("pageSize", params.pageSize.toString());

    return this.fetchApi<Movement[]>(`/api/movements?${query.toString()}`);
  }

  async createMovement(movement: Omit<Movement, "id" | "timestamp">): Promise<Movement> {
    if (!this.isApiAvailable) {
      return {
        ...movement,
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toISOString(),
      };
    }

    return this.fetchApi<Movement>("/api/movements", {
      method: "POST",
      body: JSON.stringify(movement),
    });
  }

  async updateMovement(movementId: string, updates: Partial<Movement>): Promise<Movement> {
    if (!this.isApiAvailable) {
      throw new Error("Cannot update in demo mode");
    }

    return this.fetchApi<Movement>(`/api/movements/${movementId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  }

  async getOverviewStats(): Promise<OverviewStats> {
    if (!this.isApiAvailable) {
      return this.getDemoStats();
    }

    return this.fetchApi<OverviewStats>("/api/stats/overview");
  }

  async getTopSkus(limit: number = 5): Promise<TopSku[]> {
    if (!this.isApiAvailable) {
      return this.getDemoTopSkus();
    }

    return this.fetchApi<TopSku[]>(`/api/stats/top-skus?limit=${limit}`);
  }

  async getDailyNet(days: number = 30): Promise<DailyNetData[]> {
    if (!this.isApiAvailable) {
      return this.getDemoDailyNet();
    }

    return this.fetchApi<DailyNetData[]>(`/api/stats/daily-net?days=${days}`);
  }

  async getNetWorth(): Promise<NetWorthData> {
    if (!this.isApiAvailable) {
      return {
        netWorth: 0,
        netWorthWithoutTax: 0,
        totalTax: 0,
      };
    }

    return this.fetchApi<NetWorthData>("/api/stats/net-worth");
  }

  async parseInvoicePdf(file: File): Promise<ParsedInvoiceDTO> {
    if (!this.isApiAvailable) {
      throw new Error("Invoice parsing requires API connection");
    }

    const formData = new FormData();
    formData.append("file", file);

    const headers: Record<string, string> = {};
    if (this.authToken) {
      headers["Authorization"] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${BASE_URL}/api/invoices/parse`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP ${response.status}`,
      }));
      throw new Error(error.message || "Failed to parse invoice");
    }

    return response.json();
  }

  async ingestInvoice(payload: IngestInvoiceDTO): Promise<IngestResultDTO> {
    if (!this.isApiAvailable) {
      throw new Error("Invoice ingestion requires API connection");
    }

    return this.fetchApi<IngestResultDTO>("/api/invoices/ingest", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async resetData(): Promise<{ success: boolean; message: string; deletedParts: number; deletedMovements: number }> {
    if (!this.isApiAvailable) {
      throw new Error("Reset data requires API connection");
    }

    return this.fetchApi("/api/data/reset", {
      method: "DELETE",
    });
  }

  connectSSE(onEvent: (event: SSEEvent) => void): () => void {
    if (!this.isApiAvailable || !BASE_URL) {
      return () => { };
    }

    const connect = () => {
      this.sseConnection = new EventSource(`${BASE_URL}/api/events/stream`);

      this.sseConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onEvent(data);
          this.reconnectAttempts = 0;
        } catch (error) {
          console.error("Failed to parse SSE event:", error);
        }
      };

      this.sseConnection.onerror = () => {
        this.sseConnection?.close();
        this.reconnectAttempts++;
        const delay = Math.min(
          1000 * Math.pow(2, this.reconnectAttempts),
          this.maxReconnectDelay
        );
        setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      this.sseConnection?.close();
      this.sseConnection = null;
    };
  }

  // Demo data methods (empty state)
  private getDemoParts(): Part[] {
    return [];
  }

  private getDemoMovements(): Movement[] {
    return [];
  }

  private getDemoStats(): OverviewStats {
    return {
      totalSkus: 0,
      totalInStock: 0,
      availableUnits: 0,
      lowStockSkus: 0,
      inventoryValue: 0,
      changesLast24h: 0,
    };
  }

  private getDemoTopSkus(): TopSku[] {
    return [];
  }

  private getDemoDailyNet(): DailyNetData[] {
    return [];
  }
}

export const dataConnector = new DataConnector();
