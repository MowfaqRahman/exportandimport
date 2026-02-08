
'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "../../../supabase/client";
import { useEffect, useState } from "react";
import DashboardNavbar from "@/components/dashboard-navbar";
import AllSalesTable from "@/components/company-overview/all-sales-table";
import AllExpensesTable from "@/components/company-overview/all-expenses-table";
import { ReportsFilter } from "./components/ReportsFilter";
import { MetricCardsDisplay } from "./components/MetricCardsDisplay";
import { ProductHistoryTab } from "./components/ProductHistoryTab";
import { CustomerStatementTab } from "./components/CustomerStatementTab";
import { useToast } from "@/components/ui/use-toast";
import { AllPurchasesTable } from "@/components/company-overview/all-purchases-table";
import { formatDate } from "@/utils/formatDate";

export default function ReportsHistoryPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [startDate, setStartDate] = useState(new Date(currentYear, new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [sales, setSales] = useState<any[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);

  const [expenses, setExpenses] = useState<any[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);

  const [yearSalesTotal, setYearSalesTotal] = useState<number>(0);
  const [yearExpensesTotal, setYearExpensesTotal] = useState<number>(0);
  const [monthlySalesTotal, setMonthlySalesTotal] = useState<number>(0);
  const [monthlyExpensesTotal, setMonthlyExpensesTotal] = useState<number>(0);
  const [yearPurchasesTotal, setYearPurchasesTotal] = useState<number>(0);
  const [monthlyPurchasesTotal, setMonthlyPurchasesTotal] = useState<number>(0);
  const [netProfit, setNetProfit] = useState<number>(0);
  const [loadingAggregates, setLoadingAggregates] = useState(false);

  const [productStats, setProductStats] = useState<any>(null);
  const [loadingProductStats, setLoadingProductStats] = useState(false);
  const [monthlyUnitsSold, setMonthlyUnitsSold] = useState<any[]>([]);
  const [loadingMonthlyUnitsSold, setLoadingMonthlyUnitsSold] = useState(false);
  const [productSalesHistory, setProductSalesHistory] = useState<any[]>([]);
  const [loadingProductSalesHistory, setLoadingProductSalesHistory] = useState(false);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("all"); // "all" for all products or product.id
  const [users, setUsers] = useState<{ id: string; name: string, email: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState("all"); // "all" for all users or user.id
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [allExpensesWithUsers, setAllExpensesWithUsers] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<{ id: string; name: string, email: string, full_name?: string }[]>([]);
  const [customers, setCustomers] = useState<{ customer_id: number | string; customer_name: string; phone_number?: string; email?: string; address?: string }[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customerStatements, setCustomerStatements] = useState<any[]>([]);
  const [loadingCustomerStatements, setLoadingCustomerStatements] = useState(false);

  const [purchases, setPurchases] = useState<any[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);

  const { toast } = useToast();

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePaymentStatusChange = async (invoiceId: string, newStatus: boolean) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('sales')
      .update({ paid: newStatus })
      .eq('id', invoiceId);

    if (error) {
      console.error("Error updating payment status:", error);
      toast({
        title: "Error",
        description: "Failed to update payment status.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Payment status updated to ${newStatus ? "Paid" : "Unpaid"}.`,
      });
      setRefreshTrigger(prev => prev + 1); // Trigger refresh
    }
  };

  const handlePaymentMethodChange = async (invoiceId: string, method: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('sales')
      .update({ payment_type: method })
      .eq('id', invoiceId);

    if (error) {
      console.error("Error updating payment method:", error);
      toast({
        title: "Error",
        description: "Failed to update payment method.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Payment method updated to ${method}.`,
      });
      setRefreshTrigger(prev => prev + 1); // Trigger refresh
    }
  };


  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        console.error("User not authenticated.");
        setLoadingSales(false);
        return;
      }

      const fetchSales = async () => {
        setLoadingSales(true);
        let query = supabase
          .from('sales')
          .select('*');

        if (selectedUser && selectedUser !== "all") {
          query = query.eq('user_id', selectedUser);
        } else if (session?.user?.id && selectedUser !== "all") {
          query = query.eq('user_id', session.user.id);
        }

        // Apply year filter
        if (selectedYear === "custom") {
          query = query.gte('date', startDate).lte('date', endDate);
        } else {
          if (selectedYear !== "all") {
            const startOfYear = `${selectedYear}-01-01`;
            const endOfYear = `${selectedYear}-12-31`;
            query = query.gte('date', startOfYear).lte('date', endOfYear);
          }

          // Apply month filter
          if (selectedMonth !== "all") {
            const monthNumber = parseInt(selectedMonth, 10);
            const startOfMonth = new Date(parseInt(selectedYear), monthNumber - 1, 1).toISOString().split('T')[0];
            const endOfMonth = new Date(parseInt(selectedYear), monthNumber, 0).toISOString().split('T')[0];
            query = query.gte('date', startOfMonth).lte('date', endOfMonth);
          }
        }

        const { data, error } = await query.order('created_at', { ascending: false }).order('date', { ascending: false });

        if (error) {
          console.error("Error fetching sales data:", error);
          setSales([]);
        } else {
          setSales(data || []);
        }
        setLoadingSales(false);
      };

      fetchSales();
    });
  }, [selectedYear, selectedMonth, startDate, endDate, selectedUser, refreshTrigger]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        console.error("User not authenticated.");
        setLoadingExpenses(false);
        return;
      }

      const fetchExpenses = async () => {
        setLoadingExpenses(true);
        let query = supabase
          .from('expenses')
          .select('*');

        if (selectedUser && selectedUser !== "all") {
          query = query.eq('user_id', selectedUser);
        } else if (selectedUser === "all") {
          // No user_id filter applied when "All Users" is selected
        } else if (session?.user?.id && selectedUser !== "all") {
          query = query.eq('user_id', session.user.id);
        }

        // Apply date filters
        if (selectedYear === "custom") {
          query = query.gte('date', startDate).lte('date', endDate);
        } else {
          if (selectedYear !== "all") {
            const startOfYear = `${selectedYear}-01-01`;
            const endOfYear = `${selectedYear}-12-31`;
            query = query.gte('date', startOfYear).lte('date', endOfYear);
          }

          if (selectedMonth !== "all") {
            const monthNumber = parseInt(selectedMonth, 10);
            const startOfMonth = new Date(parseInt(selectedYear), monthNumber - 1, 1).toISOString().split('T')[0];
            const endOfMonth = new Date(parseInt(selectedYear), monthNumber, 0).toISOString().split('T')[0];
            query = query.gte('date', startOfMonth).lte('date', endOfMonth);
          }
        }

        const { data, error } = await query.order('created_at', { ascending: false }).order('date', { ascending: false });

        if (error) {
          console.error("Error fetching expenses data:", error);
          setExpenses([]);
        } else {
          setExpenses(data || []);
        }
        setLoadingExpenses(false);
      };

      fetchExpenses();
    });
  }, [selectedYear, selectedMonth, startDate, endDate, selectedUser, refreshTrigger]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        console.error("User not authenticated.");
        setLoadingPurchases(false);
        return;
      }

      const fetchPurchases = async () => {
        setLoadingPurchases(true);
        let query = supabase
          .from('purchases')
          .select('*');

        if (selectedUser && selectedUser !== "all") {
          query = query.eq('user_id', selectedUser);
        } else if (session?.user?.id && selectedUser !== "all") {
          query = query.eq('user_id', session.user.id);
        }

        if (selectedYear === "custom") {
          query = query.gte('date', startDate).lte('date', endDate);
        } else {
          if (selectedYear !== "all") {
            const startOfYear = `${selectedYear}-01-01`;
            const endOfYear = `${selectedYear}-12-31`;
            query = query.gte('date', startOfYear).lte('date', endOfYear);
          }

          if (selectedMonth !== "all") {
            const monthNumber = parseInt(selectedMonth, 10);
            const startOfMonth = new Date(parseInt(selectedYear), monthNumber - 1, 1).toISOString().split('T')[0];
            const endOfMonth = new Date(parseInt(selectedYear), monthNumber, 0).toISOString().split('T')[0];
            query = query.gte('date', startOfMonth).lte('date', endOfMonth);
          }
        }

        const { data, error } = await query.order('created_at', { ascending: false }).order('date', { ascending: false });

        if (error) {
          console.error("Error fetching purchases data:", error);
          setPurchases([]);
        } else {
          setPurchases(data || []);
        }
        setLoadingPurchases(false);
      };

      fetchPurchases();
    });
  }, [selectedYear, selectedMonth, startDate, endDate, selectedUser, refreshTrigger]);

  useEffect(() => {
    const supabase = createClient();
    const fetchAllExpensesAndUsers = async () => {
      setLoadingUsers(true);
      setLoadingExpenses(true);
      setLoadingCustomers(true);
      setLoadingPurchases(true);

      const [expensesData, usersData, customersData] = await Promise.all([
        supabase.from('expenses').select('*').order('created_at', { ascending: false }).order('date', { ascending: false }),
        supabase.from('users').select('id, name, email, full_name'),
        supabase.from('customers').select('customer_id, customer_name, phone_number, email, address, company_name'),
      ]);

      if (expensesData.error) {
        console.error("Error fetching all expenses:", expensesData.error);
        setAllExpensesWithUsers([]);
      }
      if (usersData.error) {
        console.error("Error fetching users:", usersData.error);
        setAllUsers([]);
      }
      if (customersData.error) {
        console.error("Error fetching customers:", customersData.error);
        setCustomers([]);
      }

      const usersMap = new Map(usersData?.data?.map((user: any) => [user.id, user.full_name || user.name || user.email]) || []);
      setAllUsers([{ id: "all", name: "All Users", email: "" }, ...(usersData.data || [])]);
      setCustomers([{ customer_id: "all", customer_name: "All Customers" }, ...(customersData.data || [])]);

      const expensesWithUserName = expensesData.data ? expensesData.data.map((expense: any) => ({
        ...expense,
        user_name: usersMap.get(expense.user_id) || null,
      })) : [];
      setAllExpensesWithUsers(expensesWithUserName);
      setLoadingUsers(false);
      setLoadingExpenses(false);
      setLoadingCustomers(false);
      setLoadingPurchases(false);
    };
    fetchAllExpensesAndUsers();
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        console.error("User not authenticated.");
        setLoadingAggregates(false);
        return;
      }

      const fetchAggregates = async () => {
        setLoadingAggregates(true);

        const isCustom = selectedYear === "custom";
        const yearStart = isCustom ? null : `${selectedYear}-01-01`;
        const yearEnd = isCustom ? null : `${selectedYear}-12-31`;

        const filterByUser = (query: any) => {
          if (selectedUser && selectedUser !== "all") {
            return query.eq('user_id', selectedUser);
          } else if (session?.user?.id && selectedUser !== "all") {
            return query.eq('user_id', session.user.id);
          }
          return query;
        };

        // Fetch yearly totals (only if not custom)
        let currentYearSalesTotal = 0;
        let currentYearPurchasesTotal = 0;
        let currentYearExpensesTotal = 0;

        if (yearStart && yearEnd) {
          const [{ data: ySales }, { data: yPurchases }, { data: yExpenses }] = await Promise.all([
            filterByUser(supabase.from('sales').select('grand_total')).gte('date', yearStart).lte('date', yearEnd),
            filterByUser(supabase.from('purchases').select('grand_total')).gte('date', yearStart).lte('date', yearEnd),
            filterByUser(supabase.from('expenses').select('amount')).gte('date', yearStart).lte('date', yearEnd),
          ]);

          currentYearSalesTotal = ySales?.reduce((sum: number, sale: any) => sum + Number(sale.grand_total || 0), 0) || 0;
          currentYearPurchasesTotal = yPurchases?.reduce((sum: number, purchase: any) => sum + Number(purchase.grand_total || 0), 0) || 0;
          currentYearExpensesTotal = yExpenses?.reduce((sum: number, expense: any) => sum + Number(expense.amount || 0), 0) || 0;
        }

        setYearSalesTotal(currentYearSalesTotal);
        setYearPurchasesTotal(currentYearPurchasesTotal);
        setYearExpensesTotal(currentYearExpensesTotal);

        // Fetch monthly/custom range totals
        let currentMonthlySalesTotal = 0;
        let currentMonthlyExpensesTotal = 0;
        let currentMonthlyPurchasesTotal = 0;

        if (isCustom || selectedMonth !== "all") {
          let rangeStart, rangeEnd;
          if (isCustom) {
            rangeStart = startDate;
            rangeEnd = endDate;
          } else {
            const monthNumber = parseInt(selectedMonth, 10);
            rangeStart = new Date(parseInt(selectedYear), monthNumber - 1, 1).toISOString().split('T')[0];
            rangeEnd = new Date(parseInt(selectedYear), monthNumber, 0).toISOString().split('T')[0];
          }

          const [{ data: mSales }, { data: mExpenses }, { data: mPurchases }] = await Promise.all([
            filterByUser(supabase.from('sales').select('grand_total')).gte('date', rangeStart).lte('date', rangeEnd),
            filterByUser(supabase.from('expenses').select('amount')).gte('date', rangeStart).lte('date', rangeEnd),
            filterByUser(supabase.from('purchases').select('grand_total')).gte('date', rangeStart).lte('date', rangeEnd),
          ]);

          currentMonthlySalesTotal = mSales?.reduce((sum: number, sale: any) => sum + Number(sale.grand_total || 0), 0) || 0;
          currentMonthlyExpensesTotal = mExpenses?.reduce((sum: number, expense: any) => sum + Number(expense.amount || 0), 0) || 0;
          currentMonthlyPurchasesTotal = mPurchases?.reduce((sum: number, purchase: any) => sum + Number(purchase.grand_total || 0), 0) || 0;
        } else {
          currentMonthlySalesTotal = currentYearSalesTotal;
          currentMonthlyExpensesTotal = currentYearExpensesTotal;
          currentMonthlyPurchasesTotal = currentYearPurchasesTotal;
        }

        setMonthlySalesTotal(currentMonthlySalesTotal);
        setMonthlyExpensesTotal(currentMonthlyExpensesTotal);
        setMonthlyPurchasesTotal(currentMonthlyPurchasesTotal);

        // Calculate net profit
        const calculatedNetProfit = isCustom || selectedMonth !== "all"
          ? (currentMonthlySalesTotal - (currentMonthlyPurchasesTotal + currentMonthlyExpensesTotal))
          : (currentYearSalesTotal - (currentYearPurchasesTotal + currentYearExpensesTotal));
        setNetProfit(calculatedNetProfit);

        setLoadingAggregates(false);
      };

      fetchAggregates();
    });
  }, [selectedYear, selectedMonth, startDate, endDate, selectedUser, sales, expenses, purchases, refreshTrigger]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        console.error("User not authenticated.");
        setLoadingProductStats(false);
        setLoadingMonthlyUnitsSold(false);
        setLoadingProductSalesHistory(false);
        return;
      }

      const fetchProductHistory = async () => {
        setLoadingProductStats(true);
        setLoadingMonthlyUnitsSold(true);
        setLoadingProductSalesHistory(true);

        let productHistoryQuery = supabase
          .from('sales')
          .select('*, paid') // Ensure 'paid' is selected
          .order('date', { ascending: true });

        if (selectedUser && selectedUser !== "all") {
          productHistoryQuery = productHistoryQuery.eq('user_id', selectedUser);
        } else if (selectedUser === "all") {
          // No user_id filter applied when "All Users" is selected
        } else if (session?.user?.id && selectedUser !== "all") {
          productHistoryQuery = productHistoryQuery.eq('user_id', session.user.id);
        }

        const { data: allSales, error: salesError } = await productHistoryQuery;

        if (salesError) {
          console.error("Error fetching all sales for product history:", salesError);
          setProductStats(null);
          setMonthlyUnitsSold([]);
          setProductSalesHistory([]);
          setLoadingProductStats(false);
          setLoadingMonthlyUnitsSold(false);
          setLoadingProductSalesHistory(false);
          return;
        }

        const filteredSales = allSales?.filter((sale: any) => {
          // Filter by items description
          const hasProduct = sale.items && sale.items.some((item: any) => {
            return selectedProduct !== "all" ? (item.description === selectedProduct) : true;
          });

          if (!hasProduct) return false;

          // Filter by date range
          if (selectedYear === "custom") {
            return sale.date >= startDate && sale.date <= endDate;
          } else if (selectedYear !== "all") {
            const startOfYear = `${selectedYear}-01-01`;
            const endOfYear = `${selectedYear}-12-31`;
            if (sale.date < startOfYear || sale.date > endOfYear) return false;

            if (selectedMonth !== "all") {
              const monthNumber = parseInt(selectedMonth, 10);
              const startOfMonth = new Date(parseInt(selectedYear), monthNumber - 1, 1).toISOString().split('T')[0];
              const endOfMonth = new Date(parseInt(selectedYear), monthNumber, 0).toISOString().split('T')[0];
              if (sale.date < startOfMonth || sale.date > endOfMonth) return false;
            }
          }
          return true;
        }) || [];

        let totalUnitsSold = 0;
        let totalRevenue = 0;
        let firstSaleDate: string | null = null;
        let lastSaleDate: string | null = null;
        const monthlyUnitsMap: { [key: string]: number } = {};
        const productSpecificSales: any[] = [];

        filteredSales.forEach((sale: any) => {
          sale.items.forEach((item: any) => {
            const matchesProduct = selectedProduct !== "all" ? (item.description === selectedProduct) : true;
            if (matchesProduct) {
              // Only count revenue for PAID sales in the statistics?
              // Usually stats focus on realized revenue, but units sold might include all.
              // Given the previous code only included paid sales, I'll keep the stats focused on paid sales for now, 
              // but the LIST will show everything.
              // Actually, I'll count everything and the user can see the status.

              totalUnitsSold += item.qty;
              totalRevenue += item.qty * item.unitPrice;

              productSpecificSales.push({
                id: `${sale.id}-${item.description}`,
                date: sale.date,
                customer_name: sale.customer_name,
                quantity: item.qty,
                price: item.unitPrice,
                total: item.qty * item.unitPrice,
                paid: sale.paid,
                invoice_id: sale.invoice_no || sale.id,
              });

              const monthYear = sale.date.substring(0, 7); // YYYY-MM
              monthlyUnitsMap[monthYear] = (monthlyUnitsMap[monthYear] || 0) + item.qty;

              if (!firstSaleDate || sale.date < firstSaleDate) {
                firstSaleDate = sale.date;
              }
              if (!lastSaleDate || sale.date > lastSaleDate) {
                lastSaleDate = sale.date;
              }
            }
          });
        });

        setProductStats({
          totalUnitsSold,
          totalRevenue,
          firstSaleDate,
          lastSaleDate,
        });

        const sortedMonthlyUnits = Object.keys(monthlyUnitsMap)
          .sort()
          .map(key => ({ name: key, units: monthlyUnitsMap[key] }));
        setMonthlyUnitsSold(sortedMonthlyUnits);
        setProductSalesHistory(productSpecificSales);

        setLoadingProductStats(false);
        setLoadingMonthlyUnitsSold(false);
        setLoadingProductSalesHistory(false);
      };

      const debounceTimeout = setTimeout(() => {
        fetchProductHistory();
      }, 500); // Debounce for 500ms

      return () => clearTimeout(debounceTimeout);
    });
  }, [selectedProduct, sales, selectedYear, selectedMonth, startDate, endDate, selectedUser, refreshTrigger]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        console.error("User not authenticated.");
        return;
      }

      const fetchProducts = async () => {
        const uniqueProductDescriptions = new Set<string>();
        sales.forEach(sale => {
          if (sale.items) {
            const items = sale.items;
            items.forEach((item: any) => {
              if (item.description) {
                uniqueProductDescriptions.add(item.description);
              }
            });
          }
        });

        const productsData = Array.from(uniqueProductDescriptions).map(desc => ({ id: desc, name: desc }));
        setProducts([{ id: "all", name: "All Products" }, ...productsData]);
        toast({
          title: "Success",
          description: `${productsData.length} products loaded.`,
        });
      };

      fetchProducts();
    });
  }, [sales, selectedUser]);

  useEffect(() => {
    const supabase = createClient();
    const fetchUsers = async () => {
      setLoadingUsers(true);
      const { data, error } = await supabase.from('users').select('id, name, email');
      if (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      } else {
        setUsers([{ id: "all", name: "All Users", email: "" }, ...(data || [])]);
        setSelectedUser("all");
      }
      setLoadingUsers(false);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchCustomerStatements = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.error("User not authenticated.");
        setLoadingCustomerStatements(false);
        return;
      }

      if (selectedUser === "all") {
        setCustomerStatements([]);
        setLoadingCustomerStatements(false);
        return;
      }

      const selectedCustomerName = customers.find(c => c.customer_id === Number(selectedUser))?.customer_name;
      if (!selectedCustomerName) {
        console.error("Selected customer name not found.");
        setCustomerStatements([]);
        setLoadingCustomerStatements(false);
        return;
      }

      setLoadingCustomerStatements(true);

      let salesQuery = supabase.from('sales').select('date, grand_total, customer_name, items, invoice_no, id, paid, payment_type, due_date, created_at').eq('customer_name', selectedCustomerName);
      let expensesQuery = supabase.from('expenses').select('date, amount, description, created_at').eq('customer_id', Number(selectedUser));

      // Apply date filters
      if (selectedYear === "custom") {
        salesQuery = salesQuery.gte('date', startDate).lte('date', endDate);
        expensesQuery = expensesQuery.gte('date', startDate).lte('date', endDate);
      } else {
        if (selectedYear !== "all") {
          const startOfYear = `${selectedYear}-01-01`;
          const endOfYear = `${selectedYear}-12-31`;
          salesQuery = salesQuery.gte('date', startOfYear).lte('date', endOfYear);
          expensesQuery = expensesQuery.gte('date', startOfYear).lte('date', endOfYear);
        }

        if (selectedMonth !== "all") {
          const monthNumber = parseInt(selectedMonth, 10);
          const startOfMonth = new Date(parseInt(selectedYear), monthNumber - 1, 1).toISOString().split('T')[0];
          const endOfMonth = new Date(parseInt(selectedYear), monthNumber, 0).toISOString().split('T')[0];
          salesQuery = salesQuery.gte('date', startOfMonth).lte('date', endOfMonth);
          expensesQuery = expensesQuery.gte('date', startOfMonth).lte('date', endOfMonth);
        }
      }

      const [salesData, expensesData] = await Promise.all([
        salesQuery.order('date', { ascending: false }),
        expensesQuery.order('date', { ascending: false }),
      ]);

      if (salesData.error) {
        console.error("Error fetching customer sales:", salesData.error);
      }
      if (expensesData.error) {
        console.error("Error fetching customer expenses:", expensesData.error);
      }

      const salesStatements = salesData.data?.map(sale => ({
        date: sale.date,
        type: "Sale",
        description: sale.invoice_no || sale.id,
        amount: Number(sale.grand_total || 0),
        invoice_id: sale.id,
        paid: sale.paid, // Ensure paid status is passed here
        payment_type: sale.payment_type,
        due_date: sale.due_date,
        created_at: sale.created_at
      })) || [];

      const expenseStatements = expensesData.data?.map(expense => ({
        date: expense.date,
        type: "Expense",
        description: expense.description || "N/A",
        amount: -expense.amount, // Represent expenses as negative amounts
        created_at: expense.created_at
      })) || [];

      const combinedStatements = [...salesStatements, ...expenseStatements].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateB !== dateA) return dateB - dateA;

        // If same date, sort by created_at time
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setCustomerStatements(combinedStatements);
      setLoadingCustomerStatements(false);
    };

    const fetchSessionAndStatements = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.error("User not authenticated.");
        setLoadingCustomerStatements(false);
        return;
      }
      await fetchCustomerStatements();
    };

    fetchSessionAndStatements();
  }, [selectedUser, selectedYear, selectedMonth, startDate, endDate, refreshTrigger]);

  return (
    <>
      <DashboardNavbar />
      <main className="w-full min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports & History</h1>
          </div>

          <ReportsFilter
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />

          <MetricCardsDisplay
            loadingAggregates={loadingAggregates}
            yearSalesTotal={yearSalesTotal}
            yearPurchasesTotal={yearPurchasesTotal}
            yearExpensesTotal={yearExpensesTotal}
            monthlySalesTotal={monthlySalesTotal}
            monthlyPurchasesTotal={monthlyPurchasesTotal}
            monthlyExpensesTotal={monthlyExpensesTotal}
            netProfit={netProfit}
            selectedYear={selectedYear}
          />

          <Tabs defaultValue="sales" className="mt-8">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="sales">Sales Transactions</TabsTrigger>
              <TabsTrigger value="purchase">Purchases</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="product-history">Product History</TabsTrigger>
              <TabsTrigger value="customer-statement">Customer Statement</TabsTrigger>
            </TabsList>

            <TabsContent value="sales">
              <AllSalesTable initialSales={sales} />
            </TabsContent>
            <TabsContent value="purchase">
              <AllPurchasesTable initialPurchases={purchases} />
            </TabsContent>
            <TabsContent value="expenses">
              <AllExpensesTable initialExpenses={expenses} />
            </TabsContent>

            <TabsContent value="product-history">
              <ProductHistoryTab
                products={products}
                selectedProduct={selectedProduct}
                setSelectedProduct={setSelectedProduct}
                users={users}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                loadingUsers={loadingUsers}
                loadingProductStats={loadingProductStats}
                productStats={productStats}
                loadingMonthlyUnitsSold={loadingMonthlyUnitsSold}
                monthlyUnitsSold={monthlyUnitsSold}
                loadingProductSalesHistory={loadingProductSalesHistory}
                productSalesHistory={productSalesHistory}
                formatDate={formatDate}
              />
            </TabsContent>
            <TabsContent value="customer-statement">
              <CustomerStatementTab
                customers={customers}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                loadingCustomers={loadingCustomers}
                loadingCustomerStatements={loadingCustomerStatements}
                customerStatements={customerStatements}
                formatDate={formatDate}
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                startDate={startDate}
                endDate={endDate}
                onPaymentStatusChange={handlePaymentStatusChange}
                onPaymentMethodChange={handlePaymentMethodChange}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
