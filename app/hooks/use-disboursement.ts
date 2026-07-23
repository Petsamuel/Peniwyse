import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/app/utils/api-client";

export interface DisbursementRecord {
  disbursementCode: string;
  paymentType: string;
  paymentDate: string;
  narration: string;
  createdAt: string;
  vendor: string;
  amount: number;
  requisitionNumber: string;
  status: "pending" | "completed" | "failed";
}

interface ApiEnvelope<T> {
  data: T;
  success: boolean;
  code: string;
  message: string;
  errors: string[];
  hasErrors: boolean;
}

// export interface FetchInventoryObject {
//   Currency?: string;
//   Rate?: string;
// }

// ─── Query keys ───────────────────────────────────────────────────────────────

export const disbursementKeys = {
  all: ["disbursements"] as const,
  detail: (id: string) => ["disbursements", id] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export const useDisbursementRecords = () => {
  return useQuery<DisbursementRecord[]>({
    queryKey: ["disbursements"],
    queryFn: async () => {
      const res: ApiEnvelope<DisbursementRecord[]> = await apiClient(
        `api/disbursement`,
      );
      return res.data;
    },
  });
};

export function useProcessDisbursement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) =>
      apiClient("api/disbursement", {
        body: payload,
        // Do NOT set Content-Type — the browser sets it automatically
        // with the correct multipart boundary when body is FormData.
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: disbursementKeys.all }),
  });
}
