"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import MetricCard from "./metric-card";
import SalesChart from "./sales-chart";
import ExpenseChart from "./expense-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SalesTable from "../sales/sales-table";
import ExpensesTable from "../expenses/expenses-table";
import { Sale, Expense } from "@/types/business";

interface DashboardContentProps {
  initialSales: Sale[];
  initialExpenses: Expense[];
}

export default function DashboardContent({ initialSales, initialExpenses }: DashboardContentProps) {
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);

  // Calculate metrics
  const totalSales = sales.reduce((sum, sale) => sum + Number(sale.amount), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const profit = totalSales - totalExpenses;

  // Get today's sales
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales
    .filter(sale => sale.date === today)
    .reduce((sum, sale) => sum + Number(sale.amount), 0);

  // Prepare chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(date => {
    const daySales = sales
      .filter(sale => sale.date === date)
      .reduce((sum, sale) => sum + Number(sale.amount), 0);
    const dayExpenses = expenses
      .filter(expense => expense.date === date)
      .reduce((sum, expense) => sum + Number(expense.amount), 0);

    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sales: daySales,
      expenses: dayExpenses,
    };
  });

  // Prepare expense breakdown data
  const expensesByCategory = expenses.reduce((acc, expense) => {
    const category = expense.category || 'Other';
    acc[category] = (acc[category] || 0) + Number(expense.amount);
    return acc;
  }, {} as Record<string, number>);

  const expenseChartData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">
          Track your sales, expenses, and financial performance
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Today's Sales"
          value={`$${todaySales.toFixed(2)}`}
          icon={DollarSign}
          description="Sales made today"
        />
        <MetricCard
          title="Monthly Sales"
          value={`$${totalSales.toFixed(2)}`}
          icon={TrendingUp}
          description="Total sales this month"
        />
        <MetricCard
          title="Monthly Expenses"
          value={`$${totalExpenses.toFixed(2)}`}
          icon={TrendingDown}
          description="Total expenses this month"
        />
        <MetricCard
          title="Net Profit"
          value={`$${profit.toFixed(2)}`}
          icon={Wallet}
          trend={{
            value: profit >= 0 ? `+${profit.toFixed(2)}` : profit.toFixed(2),
            isPositive: profit >= 0,
          }}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <SalesChart data={chartData} />
        <ExpenseChart data={expenseChartData} />
      </div>

      {/* Tables */}
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Transactions</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>
        <TabsContent value="sales" className="space-y-4">
          <SalesTable 
            initialSales={sales}
            onDataChange={setSales}
          />
        </TabsContent>
        <TabsContent value="expenses" className="space-y-4">
          <ExpensesTable 
            initialExpenses={expenses}
            onDataChange={setExpenses}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}