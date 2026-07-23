import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/app/utils/api-client";

export interface InventorySummary {
  currency: string;
  totalAmount: number;
}

export interface InventoryHistory {
  currency: string;
  amount: number;
  averageRate: number;
  openingRate: number;
  closingRate: number;
  closingBalance: number;
  openingBalance: number;
  date: string;
}

export interface InventoryRecord {
  history: InventoryHistory[];
  summary: InventorySummary[];
}

interface ApiEnvelope<T> {
  data: T;
  success: boolean;
  code: string;
  message: string;
  errors: string[];
  hasErrors: boolean;
}

export interface FetchInventoryObject {
  Currency?: string;
  Rate?: string;
}

export interface DailyAverageRate {
    currencyPair: string
    averageRate: number
    date: string
}

export const inventoryKeys = {
  all: ["inventory"] as const,
  detail: (id: string) => ["inventory", id] as const,
};

function buildQuery(params: FetchInventoryObject): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  });

  return query.toString();
}

export const useInventoryRecord = (payload: FetchInventoryObject) => {
  return useQuery<InventoryRecord>({
    queryKey: ["inventory", payload],
    queryFn: async () => {
      const res: ApiEnvelope<InventoryRecord> = await apiClient(
        `api/inventory?${buildQuery(payload)}`,
      );
      return res.data;
    },
    staleTime: 0
  });
};

// export const useDailyAverageRate = (currencyPair: string) => {
//     return useQuery<DailyAverageRate | null>({
//         queryKey: ['inventory', 'daily-average-rate', currencyPair],
//         queryFn: async () => {
//             const res: ApiEnvelope<DailyAverageRate> = await apiClient(
//                 `api/inventory/daily-average-rate?currencyPair=${currencyPair}`
//             )
//             if (res.hasErrors || !res.success || !res.data) {
//                 return null
//             }
//             return res.data
//         },
//         enabled: !!currencyPair,
//     })
// }


export const useDailyAverageRate = (currencyPair: string) => {
    return useQuery<number | null>({ // Changed type to number
        queryKey: ['inventory', 'daily-average-rate', currencyPair],
        queryFn: async () => {
            const res: ApiEnvelope<number> = await apiClient(
                `api/inventory/daily-average-rate?currencyPair=${currencyPair}`
            )
            if (res.hasErrors || !res.success || res.data === undefined) {
                return null
            }
            return res.data // This is now the number 1370.00
        },
        enabled: !!currencyPair,
    })
}