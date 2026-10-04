import { useEffect, useMemo } from 'react';
import { useSaleStore } from '../../store/sale.store';
import type { Sale } from '../../types';

export interface UseClientSalesResult {
  sales: Sale[];
  totalUSD: number;
  totalVES: number;
  isLoading: boolean;
}

/**
 * Obtiene las ventas asociadas a un cliente por nombre,
 * con el total gastado en USD y VES.
 */
export function useClientSales(
  clientName: string | undefined,
): UseClientSalesResult {
  const sales = useSaleStore((s) => s.sales);
  const loadSales = useSaleStore((s) => s.loadSales);
  const isLoading = useSaleStore((s) => s.isLoading);

  useEffect(() => {
    void loadSales();
  }, [loadSales]);

  const clientSales = useMemo(() => {
    if (!clientName) return [];
    const normalized = clientName.trim().toLowerCase();
    return sales
      .filter((s) => (s.clientName ?? '').trim().toLowerCase() === normalized)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [sales, clientName]);

  const totals = useMemo(() => {
    return clientSales.reduce(
      (acc, s) => ({
        totalUSD: acc.totalUSD + s.totalUSD,
        totalVES: acc.totalVES + s.totalVES,
      }),
      { totalUSD: 0, totalVES: 0 },
    );
  }, [clientSales]);

  return {
    sales: clientSales,
    totalUSD: totals.totalUSD,
    totalVES: totals.totalVES,
    isLoading,
  };
}
