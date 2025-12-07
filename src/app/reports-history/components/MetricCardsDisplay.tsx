
'use client';

import MetricCard from "@/components/dashboard/metric-card";
import { DollarSign, LineChart as LineChartIcon } from "lucide-react";

interface MetricCardsDisplayProps {
  loadingAggregates: boolean;
  yearSalesTotal: number;
  yearExpensesTotal: number;
  monthlySalesTotal: number;
  monthlyExpensesTotal: number;
}

export function MetricCardsDisplay({
  loadingAggregates,
  yearSalesTotal,
  yearExpensesTotal,
  monthlySalesTotal,
  monthlyExpensesTotal,
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
        title="Year's Company Expense"
        value={loadingAggregates ? "..." : `$${yearExpensesTotal.toFixed(2)}`}
        icon={LineChartIcon}
        description="Total expenses this year across the company"
      />
      <MetricCard
        title="Monthly Company Sales"
        value={loadingAggregates ? "..." : `$${monthlySalesTotal.toFixed(2)}`}
        icon={LineChartIcon}
        description="Total sales this month across the company"
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
