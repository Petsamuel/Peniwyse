import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/app/utils/api-client';

export interface ProfitMargin {
    costPrice: number;
    sellingPrice: number;
    difference: number;
    isProfit: boolean;
    currency: string;
    transactionDate: string;
}

export interface ProfitMarginParams {
    Currency?: string;
    IsProfit?: boolean;
    StartDate?: string;
    EndDate?: string;
    PageNumber?: number;
    PageSize?: number;
}

export function useProfitMargins(params: ProfitMarginParams) {
    return useQuery({
        queryKey: ['profit-margins', params],
        queryFn: async () => {
            const query = new URLSearchParams();
            if (params.Currency) query.append('Currency', params.Currency);
            if (params.IsProfit !== undefined) query.append('IsProfit', params.IsProfit.toString());
            if (params.StartDate) query.append('StartDate', params.StartDate);
            if (params.EndDate) query.append('EndDate', params.EndDate);
            if (params.PageNumber) query.append('PageNumber', params.PageNumber.toString());
            if (params.PageSize) query.append('PageSize', params.PageSize.toString());

            const res = await apiClient(`api/profit-margins?${query.toString()}`);
            return res.data as ProfitMargin[];
        }
    });
}