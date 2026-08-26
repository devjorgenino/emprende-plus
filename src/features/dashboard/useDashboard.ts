import { useMemo } from 'react';
import { useServiceStore } from '../../store/service.store';
import { useSaleStore } from '../../store/sale.store';
import { useInventoryStore } from '../../store/inventory.store';
import { useExpenseStore } from '../../store/expense.store';

export type Period = 'today' | 'week' | 'month' | 'all';

function getPeriodDates(period: Period): { start: string; end: string } {
  const now = new Date();
  const end = now.toISOString();

  switch (period) {
    case 'today': {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { start: start.toISOString(), end };
    }
    case 'week': {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      return { start: start.toISOString(), end };
    }
    case 'month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: start.toISOString(), end };
    }
    case 'all':
    default:
      return { start: new Date(0).toISOString(), end };
  }
}

export interface DashboardData {
  totalIncomeUSD: number;
  totalIncomeVES: number;
  totalExpensesUSD: number;
  totalExpensesVES: number;
  netIncomeUSD: number;
  netIncomeVES: number;
  activeServicesCount: number;
  inventoryItemsCount: number;
  totalInventoryCostUSD: number;
  saleCount: number;
  expenseCount: number;
}

export function useDashboard(period: Period): DashboardData {
  const services = useServiceStore((s) => s.services);
  const sales = useSaleStore((s) => s.sales);
  const inventoryItems = useInventoryStore((s) => s.items);
  const expenses = useExpenseStore((s) => s.expenses);

  return useMemo(() => {
    const { start, end } = getPeriodDates(period);
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();

    const filteredSales = sales.filter((s) => {
      const t = new Date(s.createdAt).getTime();
      return t >= startTime && t <= endTime;
    });

    const filteredExpenses = expenses.filter((e) => {
      const t = new Date(e.createdAt).getTime();
      return t >= startTime && t <= endTime;
    });

    const totalIncomeUSD = filteredSales.reduce((sum, s) => sum + s.totalUSD, 0);
    const totalIncomeVES = filteredSales.reduce((sum, s) => sum + s.totalVES, 0);
    const totalExpensesUSD = filteredExpenses.reduce((sum, e) => sum + e.amountUSD, 0);
    const totalExpensesVES = filteredExpenses.reduce((sum, e) => sum + e.amountVES, 0);

    return {
      totalIncomeUSD,
      totalIncomeVES,
      totalExpensesUSD,
      totalExpensesVES,
      netIncomeUSD: totalIncomeUSD - totalExpensesUSD,
      netIncomeVES: totalIncomeVES - totalExpensesVES,
      activeServicesCount: services.filter((s) => s.isActive).length,
      inventoryItemsCount: Math.round(inventoryItems.reduce((sum, i) => sum + i.quantity, 0) * 100) / 100,
      totalInventoryCostUSD: inventoryItems.reduce((sum, i) => sum + i.purchasePriceUSD * i.quantity, 0),
      saleCount: filteredSales.length,
      expenseCount: filteredExpenses.length,
    };
  }, [services, sales, inventoryItems, expenses, period]);
}
