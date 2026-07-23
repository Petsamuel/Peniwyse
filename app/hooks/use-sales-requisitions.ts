import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/utils/api-client";
// import { CreatePurchaseRecordPayload } from "./use-purchase-records";

export interface SalesRequisitionRecord {
  id: string;
  documentUrl?: string;
  tradingPartnerId: string;
  tradingPartnerName: string;
  requisitionNumber: string;
  currencyPair: string;
  isPublished: boolean;
  volume: number;
  proposedRate: number;
  remarks: string;
  status: string;
  requestedOn?: string;
  requestedBy?: string;
  date: string;
}

export interface CreateSalesRequisitionPayload {
  image: string
  tradingPartnerId: string;
  currencyPair: string;
  volume: string;
  proposedRate: number;
  remarks: string;
}

interface ApiEnvelope<T> {
  data: T;
  success: boolean;
  code: string;
  message: string;
  errors: string[];
  hasErrors: boolean;
}

export interface FetchSalesRequisitionObject {
  TradingPartnerId?: string;
  RequisitionNo?: string;
  Status?: string;
}

// ─── Query keys ───────────────────────────────────────────────────────────────

export const salesRequisitionKeys = {
  all: ["sales-requisitions"] as const,
  detail: (id: string) => ["sales-requisitions", id] as const,
};

function buildQuery(params: FetchSalesRequisitionObject): string {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, String(value));
    }
  });

  return query.toString();
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export const useSalesRequisitionsRecord = (
  payload: FetchSalesRequisitionObject,
) => {
  return useQuery<SalesRequisitionRecord[]>({
    queryKey: ["sales-requisitions", payload],
    queryFn: async () => {
      const res: ApiEnvelope<SalesRequisitionRecord[]> = await apiClient(
        `api/sales-requisition?${buildQuery(payload)}`,
      );
      return res.data;
    },
  });
};

export function useSalesRequisition(id: string) {
  return useQuery<SalesRequisitionRecord>({
    queryKey: salesRequisitionKeys.detail(id),
    queryFn: async () => {
      const res: ApiEnvelope<SalesRequisitionRecord> = await apiClient(
        `api/sales-requisition/${id}`,
      );
      return res.data;
    },
    enabled: !!id,
  });
}

// export function useCreateSalesRequisition() {
//   const qc = useQueryClient();
//   return useMutation({
//     mutationFn: (payload: CreateSalesRequisitionPayload) =>
//       apiClient("api/sales-requisition", {
//         body: payload as unknown as Record<
//           string,
//           import("@/app/utils/api-client").JsonValue
//         >,
//       }),
//     onSuccess: () =>
//       qc.invalidateQueries({ queryKey: salesRequisitionKeys.all }),
//   });
// }

export function useCreateSalesRequisition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) =>
      apiClient("api/sales-requisition", {
        body: payload,
        // Do NOT set Content-Type — the browser sets it automatically
        // with the correct multipart boundary when body is FormData.
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: salesRequisitionKeys.all }),
  });
}