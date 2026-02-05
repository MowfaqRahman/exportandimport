"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "../../../supabase/client";
import { Sale, Expense, Purchase } from "@/types/business";
import DashboardNavbar from "@/components/dashboard-navbar";
import { DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import MetricCard from "@/components/dashboard/metric-card";
import SalesChart from "@/components/dashboard/sales-chart"; // Reusing SalesChart
import ExpenseChart from "@/components/dashboard/expense-chart"; // Reusing ExpenseChart
import AllSalesTable from "@/components/company-overview/all-sales-table";
import AllExpensesTable from "@/components/company-overview/all-expenses-table";
import { AllPurchasesTable } from "@/components/company-overview/all-purchases-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CompanyOverviewPage() {
  const [companySales, setCompanySales] = useState<Sale[]>([]);
  const [companyExpenses, setCompanyExpenses] = useState<Expense[]>([]);
  const [companyPurchases, setCompanyPurchases] = useState<Purchase[]>([]);
  const [activeTab, setActiveTab] = useState("sales"); // State to manage active tab for Sales/Expenses
  const supabase = createClient();

  const fetchCompanyData = useCallback(async () => {
    const [salesData, expensesData, purchasesData, usersData] = await Promise.all([
      supabase
        .from('sales')
        .select('*'),
      supabase
        .from('expenses')
        .select('*'),
      supabase
        .from('purchases')
        .select('*'),
      supabase
        .from('users')
        .select('id, name, email, full_name'),
    ]);

    if (salesData.error) {
      console.error("Error fetching sales data:", salesData.error);
    }
    if (expensesData.error) {
      console.error("Error fetching expenses data:", expensesData.error);
    }
    if (purchasesData.error) {
      console.error("Error fetching purchases data:", purchasesData.error);
    }
    if (usersData.error) {
      console.error("Error fetching users data:", usersData.error);
    }

    const usersMap = new Map(usersData?.data?.map((user: any) => [user.id, user.full_name || user.name || user.email]) || []);

    const salesWithUserName = salesData.data ? salesData.data.map((sale: any) => ({
      ...sale,
      user_name: usersMap.get(sale.user_id) || null,
    })) : [];

    const expensesWithUserName = expensesData.data ? expensesData.data.map((expense: any) => ({
      ...expense,
      user_name: usersMap.get(expense.user_id) || null,
    })) : [];

    const purchasesWithUserName = purchasesData.data ? purchasesData.data.map((purchase: any) => ({
      ...purchase,
      user_name: usersMap.get(purchase.user_id) || null,
    })) : [];

    if (salesData.data) {
      setCompanySales(salesWithUserName as Sale[]);
    }
    if (expensesData.data) {
      setCompanyExpenses(expensesWithUserName as Expense[]);
    }
    if (purchasesData.data) {
      setCompanyPurchases(purchasesWithUserName as Purchase[]);
    }
  }, [supabase]);

  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  // Calculate company-wide metrics
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentYear = now.getFullYear();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  const firstDayOfYear = `${currentYear}-01-01`;
  const lastDayOfYear = `${currentYear}-12-31`;

  // Filter sales, expenses, and purchases for various periods
  // We show ALL data (paid + unpaid) to match the bottom table as requested

  // Today's Sales
  const todayCompanySales = companySales
    .filter(sale => sale.date === today)
    .reduce((sum, sale) => sum + Number(sale.grand_total || 0), 0);

  // Monthly Metrics
  const monthlyCompanySales = companySales.filter(sale => sale.date >= firstDayOfMonth && sale.date <= lastDayOfMonth);
  const totalMonthlySales = monthlyCompanySales.reduce((sum, sale) => sum + Number(sale.grand_total || 0), 0);

  const monthlyCompanyExpenses = companyExpenses.filter(expense => expense.date >= firstDayOfMonth && expense.date <= lastDayOfMonth);
  const totalMonthlyExpenses = monthlyCompanyExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

  const monthlyCompanyPurchases = companyPurchases.filter(purchase => purchase.date >= firstDayOfMonth && purchase.date <= lastDayOfMonth);
  const totalMonthlyPurchases = monthlyCompanyPurchases.reduce((sum, purchase) => sum + Number(purchase.grand_total || 0), 0);

  // Yearly Metrics (to match Reports & History page behavior)
  const yearlyCompanySales = companySales.filter(sale => sale.date >= firstDayOfYear && sale.date <= lastDayOfYear);
  const totalYearlySales = yearlyCompanySales.reduce((sum, sale) => sum + Number(sale.grand_total || 0), 0);

  const yearlyCompanyExpenses = companyExpenses.filter(expense => expense.date >= firstDayOfYear && expense.date <= lastDayOfYear);
  const totalYearlyExpenses = yearlyCompanyExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

  const yearlyCompanyPurchases = companyPurchases.filter(purchase => purchase.date >= firstDayOfYear && purchase.date <= lastDayOfYear);
  const totalYearlyPurchases = yearlyCompanyPurchases.reduce((sum, purchase) => sum + Number(purchase.grand_total || 0), 0);

  // Profit calculations
  const monthlyProfit = totalMonthlySales - totalMonthlyExpenses - totalMonthlyPurchases;
  const yearlyProfit = totalYearlySales - totalYearlyExpenses - totalYearlyPurchases;

  // Prepare chart data for company-wide view - last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const companyChartData = last7Days.map(date => {
    const daySales = companySales
      .filter(sale => sale.date === date)
      .reduce((sum, sale) => sum + Number(sale.grand_total || 0), 0);
    const dayExpenses = companyExpenses
      .filter(expense => expense.date === date)
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const dayPurchases = companyPurchases
      .filter(purchase => purchase.date === date)
      .reduce((sum, purchase) => sum + Number(purchase.grand_total || 0), 0);

    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sales: daySales,
      expenses: dayExpenses,
      purchases: dayPurchases,
    };
  });

  // Prepare expense breakdown data for company-wide view - filter to last 7 days
  const companyExpensesLast7Days = companyExpenses.filter(expense => last7Days.includes(expense.date));
  const companyExpensesByCategory = companyExpensesLast7Days.reduce((acc, expense) => {
    const category = expense.category || 'Other';
    acc[category] = (acc[category] || 0) + Number(expense.amount || 0);
    return acc;
  }, {} as Record<string, number>);

  const companyExpenseChartData = Object.entries(companyExpensesByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <>
      <DashboardNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="w-full min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Company Overview</h1>
            <p className="text-muted-foreground mt-2">
              Combined financial performance across all users
            </p>
          </div>

          {/* Tabs component moved to DashboardNavbar */}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Today's Sales"
              value={`QAR ${todayCompanySales.toFixed(2)}`}
              icon={DollarSign}
              description="Today's sales (all users)"
            />
            <MetricCard
              title="Monthly Sales"
              value={`QAR ${totalMonthlySales.toFixed(2)}`}
              icon={TrendingUp}
              description="This month's sales (all users)"
            />
            <MetricCard
              title="Monthly Expenses"
              value={`QAR ${totalMonthlyExpenses.toFixed(2)}`}
              icon={TrendingDown}
              description="This month's expenses (all users)"
            />
            <MetricCard
              title="Monthly Purchases"
              value={`QAR ${totalMonthlyPurchases.toFixed(2)}`}
              icon={TrendingDown}
              description="This month's purchases (all users)"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Yearly Sales"
              value={`QAR ${totalYearlySales.toFixed(2)}`}
              icon={TrendingUp}
              description="All sales this year across all users"
            />
            <MetricCard
              title="Yearly Expenses"
              value={`QAR ${totalYearlyExpenses.toFixed(2)}`}
              icon={TrendingDown}
              description="All expenses this year across all users"
            />
            <MetricCard
              title="Yearly Purchases"
              value={`QAR ${totalYearlyPurchases.toFixed(2)}`}
              icon={TrendingDown}
              description="All purchases this year across all users"
            />
            <MetricCard
              className={
                yearlyProfit >= 0
                  ? "border-green-500/50 bg-green-50/30 dark:bg-green-950/10"
                  : "border-red-500/50 bg-red-50/30 dark:bg-red-950/10"
              }
              title="Yearly Net Profit"
              value={`QAR ${yearlyProfit.toFixed(2)}`}
              icon={Wallet}
              badge={{
                text: yearlyProfit >= 0 ? "Profit" : "Loss",
                variant: yearlyProfit >= 0 ? "success" : "destructive"
              }}
              trend={{
                value: yearlyProfit >= 0 ? `+${yearlyProfit.toFixed(2)}` : yearlyProfit.toFixed(2),
                isPositive: yearlyProfit >= 0,
              }}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              className={
                monthlyProfit >= 0
                  ? "lg:col-start-2 lg:col-span-2 border-green-500/50 bg-green-50/30 dark:bg-green-950/10"
                  : "lg:col-start-2 lg:col-span-2 border-red-500/50 bg-red-50/30 dark:bg-red-950/10"
              }
              title="Current Month Net Profit"
              value={`QAR ${monthlyProfit.toFixed(2)}`}
              icon={Wallet}
              badge={{
                text: monthlyProfit >= 0 ? "Profit" : "Loss",
                variant: monthlyProfit >= 0 ? "success" : "destructive"
              }}
              trend={{
                value: monthlyProfit >= 0 ? `+${monthlyProfit.toFixed(2)}` : monthlyProfit.toFixed(2),
                isPositive: monthlyProfit >= 0,
              }}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <SalesChart data={companyChartData} />
            <ExpenseChart data={companyExpenseChartData} />
          </div>

          <div className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="sales">Sales Transactions</TabsTrigger>
                <TabsTrigger value="purchase">Purchase</TabsTrigger>
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
              </TabsList>
              {activeTab === "sales" && (
                <AllSalesTable initialSales={companySales} onRefresh={fetchCompanyData} />
              )}
              {activeTab === "expenses" && (
                <AllExpensesTable initialExpenses={companyExpenses} />
              )}
              {activeTab === "purchase" && (
                <AllPurchasesTable initialPurchases={companyPurchases} />
              )}
            </Tabs>
          </div>

        </div>
      </main>
    </>
  );
}
