
'use client';

import MetricCard from "@/components/dashboard/metric-card";
import { DollarSign, LineChart as LineChartIcon, TrendingUp, TrendingDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MetricCardsDisplayProps {
  loadingAggregates: boolean;
  yearSalesTotal: number;
  yearPurchasesTotal: number;
  yearExpensesTotal: number;
  monthlySalesTotal: number;
  monthlyPurchasesTotal: number;
  monthlyExpensesTotal: number;
  netProfit: number;
  selectedYear: string;
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
  selectedYear,
}: MetricCardsDisplayProps) {
  const isCustom = selectedYear === "custom";
  const rangeLabel = isCustom ? "Custom Range" : "Monthly Company";
  const rangeDesc = isCustom ? "selected range" : "this month";
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8 auto-rows-fr">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <MetricCard
          title="Year's Company Sales"
          value={loadingAggregates ? "..." : `QAR ${yearSalesTotal.toFixed(2)}`}
          icon={DollarSign}
          description="All sales made this year across the company"
          className="h-full"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <MetricCard
          title="Year's Company Purchases"
          value={loadingAggregates ? "..." : `QAR ${yearPurchasesTotal.toFixed(2)}`}
          icon={LineChartIcon}
          description="Total purchases made this year across the company"
          className="h-full"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <MetricCard
          title="Year's Company Expense"
          value={loadingAggregates ? "..." : `QAR ${yearExpensesTotal.toFixed(2)}`}
          icon={LineChartIcon}
          description="Total expenses this year across the company"
          className="h-full"
        />
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.div
          key={netProfit >= 0 ? "profit" : "loss"}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-1 h-full"
        >
          <MetricCard
            title="Net Profit"
            value={loadingAggregates ? "..." : `QAR ${netProfit.toFixed(2)}`}
            icon={netProfit >= 0 ? TrendingUp : TrendingDown}
            description="Yearly sales - (purchases + expenses)"
            badge={!loadingAggregates ? {
              text: netProfit >= 0 ? "Profit" : "Loss",
              variant: netProfit >= 0 ? "success" : "destructive"
            } : undefined}
            className={
              loadingAggregates
                ? "h-full"
                : netProfit >= 0
                  ? "h-full border-green-500/50 bg-green-50/30 dark:bg-green-950/10 shadow-sm"
                  : "h-full border-red-500/50 bg-red-50/30 dark:bg-red-950/10 shadow-sm"
            }
          />
        </motion.div>
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <MetricCard
          title={`${rangeLabel} Sales`}
          value={loadingAggregates ? "..." : `QAR ${monthlySalesTotal.toFixed(2)}`}
          icon={LineChartIcon}
          description={`Total sales ${rangeDesc} across the company`}
          className="h-full"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
        <MetricCard
          title={`${rangeLabel} Purchases`}
          value={loadingAggregates ? "..." : `QAR ${monthlyPurchasesTotal.toFixed(2)}`}
          icon={LineChartIcon}
          description={`Total purchases ${rangeDesc} across the company`}
          className="h-full"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <MetricCard
          title={`${rangeLabel} Expenses`}
          value={loadingAggregates ? "..." : `QAR ${monthlyExpensesTotal.toFixed(2)}`}
          icon={LineChartIcon}
          description={`Total expenses ${rangeDesc} across the company`}
          className="h-full"
        />
      </motion.div>
    </div>
  );
}
