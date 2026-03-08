"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import MetricCard from "./metric-card";
import SalesChart from "./sales-chart";
import ExpenseChart from "./expense-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SalesTable from "../sales/sales-table";
import ExpensesTable from "../expenses/expenses-table";
import PurchaseTable from "../purchase/purchase-table";
import { Sale, Expense, Purchase } from "@/types/business";
import { createClient } from "../../../supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface DashboardContentProps {
  initialSales: Sale[];
  initialExpenses: Expense[];
  initialPurchases: Purchase[];
}

export default function DashboardContent({ initialSales, initialExpenses, initialPurchases }: DashboardContentProps) {
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
  const supabase = createClient();
  const { toast } = useToast();

  const refreshSales = async () => {
    try {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const lastDayOfMonth = new Date(currentYear, currentMonth, 0).getDate();
      const firstDay = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
      const lastDay = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', firstDay)
        .lte('date', lastDay)
        .order('date', { ascending: false });

      if (error) throw error;

      if (data) {
        setSales(data);
      }
    } catch (error) {
      console.error("Error refreshing sales:", error);
      toast({
        title: "Error",
        description: "Failed to refresh sales data",
        variant: "destructive",
      });
    }
  };

  // Calculate metrics
  const totalReceivedFromSales = (sale: Sale) => Number(sale.paid_amount || 0);

  const totalSales = sales.reduce((sum, sale) => sum + totalReceivedFromSales(sale), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const totalPurchases = purchases.reduce((sum, purchase) => sum + Number(purchase.grand_total || 0), 0);
  const profit = totalSales - totalExpenses - totalPurchases;

  // Get today's sales
  const nowLocal = new Date();
  const today = `${nowLocal.getFullYear()}-${String(nowLocal.getMonth() + 1).padStart(2, '0')}-${String(nowLocal.getDate()).padStart(2, '0')}`;
  const todaySales = sales
    .filter(sale => sale.date === today)
    .reduce((sum, sale) => sum + totalReceivedFromSales(sale), 0);

  // Prepare chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dYear = date.getFullYear();
    const dMonth = String(date.getMonth() + 1).padStart(2, '0');
    const dDay = String(date.getDate()).padStart(2, '0');
    return `${dYear}-${dMonth}-${dDay}`;
  });

  const chartData = last7Days.map(date => {
    const daySales = sales
      .filter(sale => sale.date === date)
      .reduce((sum, sale) => sum + totalReceivedFromSales(sale), 0);
    const dayExpenses = expenses
      .filter(expense => expense.date === date)
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
    const dayPurchases = purchases
      .filter(purchase => purchase.date === date)
      .reduce((sum, purchase) => sum + Number(purchase.grand_total || 0), 0);

    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sales: daySales,
      expenses: dayExpenses,
      purchases: dayPurchases,
    };
  });

  // Prepare expense breakdown data - filter to last 7 days to match trend chart
  const expensesLast7Days = expenses.filter(expense => last7Days.includes(expense.date));
  const expensesByCategory = expensesLast7Days.reduce((acc, expense) => {
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
      {/* Row 1: Today's Performance & Profit */}
      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard
          title="Today's Received Sales"
          value={`QAR ${todaySales.toFixed(2)}`}
          icon={DollarSign}
          description="Sales made today"
        />
        <MetricCard
          className={
            profit >= 0
              ? "border-green-500/50 bg-green-50/30 dark:bg-green-950/10 shadow-sm"
              : "border-red-500/50 bg-red-50/30 dark:bg-red-950/10 shadow-sm"
          }
          title="Net Profit"
          value={`QAR ${profit.toFixed(2)}`}
          icon={Wallet}
          badge={{
            text: profit >= 0 ? "Profit" : "Loss",
            variant: profit >= 0 ? "success" : "destructive"
          }}
          trend={{
            value: profit >= 0 ? `+${profit.toFixed(2)}` : profit.toFixed(2),
            isPositive: profit >= 0,
          }}
        />
      </div>

      {/* Row 2: Monthly Details */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Monthly Received Sales"
          value={`QAR ${totalSales.toFixed(2)}`}
          icon={TrendingUp}
          description="Total sales this month"
        />
        <MetricCard
          title="Monthly Purchases"
          value={`QAR ${totalPurchases.toFixed(2)}`}
          icon={TrendingDown}
          description="Total purchases this month"
        />
        <MetricCard
          title="Monthly Expenses"
          value={`QAR ${totalExpenses.toFixed(2)}`}
          icon={TrendingDown}
          description="Total expenses this month"
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
          <TabsTrigger value="purchase">Purchase</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>
        <TabsContent value="sales" className="space-y-4">
          <SalesTable
            initialSales={sales}
            onDataChange={setSales}
            onRefresh={refreshSales}
          />
        </TabsContent>
        <TabsContent value="purchase" className="space-y-4">
          <PurchaseTable
            initialPurchases={purchases}
            onDataChange={setPurchases}
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