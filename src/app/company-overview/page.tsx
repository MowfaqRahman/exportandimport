"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../supabase/client";
import { Sale, Expense } from "@/types/business";
import DashboardNavbar from "@/components/dashboard-navbar";
import { DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import MetricCard from "@/components/dashboard/metric-card";
import SalesChart from "@/components/dashboard/sales-chart"; // Reusing SalesChart
import ExpenseChart from "@/components/dashboard/expense-chart"; // Reusing ExpenseChart
import AllSalesTable from "@/components/company-overview/all-sales-table";
import AllExpensesTable from "@/components/company-overview/all-expenses-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CompanyOverviewPage() {
  const [companySales, setCompanySales] = useState<Sale[]>([]);
  const [companyExpenses, setCompanyExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("sales"); // State to manage active tab for Sales/Expenses
  const supabase = createClient();

  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      
      const [salesData, expensesData, usersData] = await Promise.all([
        supabase
          .from('sales')
          .select('*'),
        supabase
          .from('expenses')
          .select('*'),
        supabase
          .from('users')
          .select('id, email'),
      ]);

      if (salesData.error) {
        console.error("Error fetching sales data:", salesData.error);
      }
      if (expensesData.error) {
        console.error("Error fetching expenses data:", expensesData.error);
      }
      if (usersData.error) {
        console.error("Error fetching users data:", usersData.error);
      }

      console.log("Fetched sales data:", salesData.data);
      console.log("Fetched expenses data:", expensesData.data);
      console.log("Fetched users data:", usersData.data);

      const usersMap = new Map(usersData?.data?.map((user: any) => [user.id, user.email]) || []);

      const salesWithUserEmail = salesData.data ? salesData.data.map((sale: any) => ({
        ...sale,
        user_email: usersMap.get(sale.user_id) || null,
      })) : [];

      const expensesWithUserEmail = expensesData.data ? expensesData.data.map((expense: any) => ({
        ...expense,
        user_email: usersMap.get(expense.user_id) || null,
      })) : [];

      if (salesData.data) {
        setCompanySales(salesWithUserEmail as Sale[]);
      }
      if (expensesData.data) {
        setCompanyExpenses(expensesWithUserEmail as Expense[]);
      }
      setLoading(false);
    };

    fetchCompanyData();
  }, []);

  // Calculate company-wide metrics
  const totalCompanySales = companySales.reduce((sum, sale) => sum + Number(sale.grand_total || 0), 0);
  const totalCompanyExpenses = companyExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const companyProfit = totalCompanySales - totalCompanyExpenses;

  // Get today's company sales
  const today = new Date().toISOString().split('T')[0];
  const todayCompanySales = companySales
    .filter(sale => sale.date === today)
    .reduce((sum, sale) => sum + Number(sale.grand_total || 0), 0);

  // Prepare chart data for company-wide view
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

    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      sales: daySales,
      expenses: dayExpenses,
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading company data...</p>
      </div>
    );
  }

  return (
    <>
      <DashboardNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="w-full min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 space-y-8">
          <h1 className="text-3xl font-bold tracking-tight">Company Overview</h1>
          <p className="text-muted-foreground mt-2 mb-4">
            Combined financial performance across all users
          </p>

          {/* Tabs component moved to DashboardNavbar */}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Today's Company Sales"
              value={`$${todayCompanySales.toFixed(2)}`}
              icon={DollarSign}
              description="All sales made today across the company"
            />
            <MetricCard
              title="Monthly Company Sales"
              value={`$${totalCompanySales.toFixed(2)}`}
              icon={TrendingUp}
              description="Total sales this month across the company"
            />
            <MetricCard
              title="Monthly Company Expenses"
              value={`$${totalCompanyExpenses.toFixed(2)}`}
              icon={TrendingDown}
              description="Total expenses this month across the company"
            />
            <MetricCard
              title="Company Net Profit"
              value={`$${companyProfit.toFixed(2)}`}
              icon={Wallet}
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
            {activeTab === "sales" && (
              <AllSalesTable initialSales={companySales} />
            )}
            {activeTab === "expenses" && (
              <AllExpensesTable initialExpenses={companyExpenses} />
            )}
          </div>

        </div>
      </main>
    </>
  );
}
