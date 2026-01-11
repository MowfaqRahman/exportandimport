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

    const expensesWithUserName = expensesData.data ? expensesData.data.map((expense: any) => ({
      ...expense,
      user_name: usersMap.get(expense.user_id) || null,
    })) : [];

    const purchasesWithUserName = purchasesData.data ? purchasesData.data.map((purchase: any) => ({
      ...purchase,
      user_name: usersMap.get(purchase.user_id) || null,
    })) : [];

    if (salesData.data) {
      setCompanySales(salesData.data as Sale[]);
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
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const paidCompanySales = companySales.filter(sale => sale.paid === true);

  const monthlyCompanySales = paidCompanySales.filter(sale => sale.date >= firstDayOfMonth && sale.date <= lastDayOfMonth);
  const totalCompanySales = monthlyCompanySales.reduce((sum, sale) => sum + Number(sale.grand_total || 0), 0);

  const monthlyCompanyExpenses = companyExpenses.filter(expense => expense.date >= firstDayOfMonth && expense.date <= lastDayOfMonth);
  const totalCompanyExpenses = monthlyCompanyExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

  const monthlyCompanyPurchases = companyPurchases.filter(purchase => purchase.date >= firstDayOfMonth && purchase.date <= lastDayOfMonth);
  const totalCompanyPurchases = monthlyCompanyPurchases.reduce((sum, purchase) => sum + Number(purchase.grand_total || 0), 0);

  const companyProfit = totalCompanySales - totalCompanyExpenses - totalCompanyPurchases;

  // Get today's company sales
  const today = new Date().toISOString().split('T')[0];
  const todayCompanySales = paidCompanySales
    .filter(sale => sale.date === today)
    .reduce((sum, sale) => sum + Number(sale.grand_total || 0), 0);

  // Prepare chart data for company-wide view
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const companyChartData = last7Days.map(date => {
    const daySales = paidCompanySales
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
              title="Today's Company Sales"
              value={`QAR ${todayCompanySales.toFixed(2)}`}
              icon={DollarSign}
              description="All sales made today across the company"
            />
            <MetricCard
              title="Monthly Company Sales"
              value={`QAR ${totalCompanySales.toFixed(2)}`}
              icon={TrendingUp}
              description="Total sales this month across the company"
            />
            <MetricCard
              title="Monthly Company Expenses"
              value={`QAR ${totalCompanyExpenses.toFixed(2)}`}
              icon={TrendingDown}
              description="Total expenses this month across the company"
            />
            <MetricCard
              title="Monthly Company Purchases"
              value={`QAR ${totalCompanyPurchases.toFixed(2)}`}
              icon={TrendingDown}
              description="Total purchases this month across the company"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              className={
                companyProfit >= 0
                  ? "lg:col-start-2 lg:col-span-2 border-green-500/50 bg-green-50/30 dark:bg-green-950/10"
                  : "lg:col-start-2 lg:col-span-2 border-red-500/50 bg-red-50/30 dark:bg-red-950/10"
              }
              title="Company Net Profit"
              value={`QAR ${companyProfit.toFixed(2)}`}
              icon={Wallet}
              badge={{
                text: companyProfit >= 0 ? "Profit" : "Loss",
                variant: companyProfit >= 0 ? "success" : "destructive"
              }}
              trend={{
                value: companyProfit >= 0 ? `+${companyProfit.toFixed(2)}` : companyProfit.toFixed(2),
                isPositive: companyProfit >= 0,
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
