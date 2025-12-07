
'use client';

import MetricCard from "@/components/dashboard/metric-card";
import { DollarSign, LineChart as LineChartIcon } from "lucide-react";

interface MetricCardsDisplayProps {
  loadingAggregates: boolean;
  yearSalesTotal: number;
  yearPurchasesTotal: number;
  yearExpensesTotal: number;
  monthlySalesTotal: number;
  monthlyPurchasesTotal: number;
  monthlyExpensesTotal: number;
  netProfit: number;
}

export function MetricCardsDisplay({
  loadingAggregates,
  yearSalesTotal,
  yearPurchasesTotal,
  yearExpensesTotal,
  monthlySalesTotal,
  monthlyPurchasesTotal,
  monthlyExpensesTotal,
  netProfit,
}: MetricCardsDisplayProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <MetricCard
        title="Year's Company Sales"
        value={loadingAggregates ? "..." : `$${yearSalesTotal.toFixed(2)}`}
        icon={DollarSign}
        description="All sales made this year across the company"
      />
      <MetricCard
        title="Year's Company Purchases"
        value={loadingAggregates ? "..." : `$${yearPurchasesTotal.toFixed(2)}`}
        icon={LineChartIcon}
        description="Total purchases made this year across the company"
      />
      <MetricCard
        title="Year's Company Expense"
        value={loadingAggregates ? "..." : `$${yearExpensesTotal.toFixed(2)}`}
        icon={LineChartIcon}
        description="Total expenses this year across the company"
      />
      <MetricCard
        title="Net Profit"
        value={loadingAggregates ? "..." : `$${netProfit.toFixed(2)}`}
        icon={DollarSign}
        description="Yearly sales - (purchases + expenses)"
      />
      <MetricCard
        title="Monthly Company Sales"
        value={loadingAggregates ? "..." : `$${monthlySalesTotal.toFixed(2)}`}
        icon={LineChartIcon}
        description="Total sales this month across the company"
      />
      <MetricCard
        title="Monthly Company Purchases"
        value={loadingAggregates ? "..." : `$${monthlyPurchasesTotal.toFixed(2)}`}
        icon={LineChartIcon}
        description="Total purchases this month across the company"
      />
      <MetricCard
        title="Monthly Company Expenses"
        value={loadingAggregates ? "..." : `$${monthlyExpensesTotal.toFixed(2)}`}
        icon={LineChartIcon}
        description="Total expenses this month across the company"
      />
    </div>
  );
}
