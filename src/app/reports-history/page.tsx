'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { createClient } from "../../../supabase/client";
import { useEffect, useState } from "react";
import DashboardNavbar from "@/components/dashboard-navbar";
import MetricCard from "@/components/dashboard/metric-card";
import { DollarSign, LineChart as LineChartIcon, Wallet } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Helper function to format date
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function ReportsHistoryPage() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [sales, setSales] = useState<any[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);

  const [expenses, setExpenses] = useState<any[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);

  const [yearSalesTotal, setYearSalesTotal] = useState<number>(0);
  const [yearExpensesTotal, setYearExpensesTotal] = useState<number>(0);
  const [monthlySalesTotal, setMonthlySalesTotal] = useState<number>(0);
  const [monthlyExpensesTotal, setMonthlyExpensesTotal] = useState<number>(0);
  const [loadingAggregates, setLoadingAggregates] = useState(false);

  const [productStats, setProductStats] = useState<any>(null);
  const [loadingProductStats, setLoadingProductStats] = useState(false);
  const [monthlyUnitsSold, setMonthlyUnitsSold] = useState<any[]>([]);
  const [loadingMonthlyUnitsSold, setLoadingMonthlyUnitsSold] = useState(false);
  const [productSalesHistory, setProductSalesHistory] = useState<any[]>([]);
  const [loadingProductSalesHistory, setLoadingProductSalesHistory] = useState(false);
  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("all"); // "all" for all products or product.id

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i); // Last 5 years
  const months = [
    { value: "all", label: "All" },
    { value: "1", label: "Jan" },
    { value: "2", label: "Feb" },
    { value: "3", label: "Mar" },
    { value: "4", label: "Apr" },
    { value: "5", label: "May" },
    { value: "6", label: "Jun" },
    { value: "7", label: "Jul" },
    { value: "8", label: "Aug" },
    { value: "9", label: "Sep" },
    { value: "10", label: "Oct" },
    { value: "11", label: "Nov" },
    { value: "12", label: "Dec" },
  ];

  const { toast } = useToast();

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
          .select('*')
          .eq('user_id', session.user.id);

        // Apply year filter
        if (selectedYear !== "all") {
          const startDate = `${selectedYear}-01-01`;
          const endDate = `${selectedYear}-12-31`;
          query = query.gte('date', startDate).lte('date', endDate);
        }

        // Apply month filter
        if (selectedMonth !== "all") {
          const monthNumber = parseInt(selectedMonth, 10);
          const startDate = new Date(parseInt(selectedYear), monthNumber - 1, 1).toISOString().split('T')[0];
          const endDate = new Date(parseInt(selectedYear), monthNumber, 0).toISOString().split('T')[0];
          query = query.gte('date', startDate).lte('date', endDate);
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
  }, [selectedYear, selectedMonth]);

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
          .select('*')
          .eq('user_id', session.user.id);

        // Apply year filter
        if (selectedYear !== "all") {
          const startDate = `${selectedYear}-01-01`;
          const endDate = `${selectedYear}-12-31`;
          query = query.gte('date', startDate).lte('date', endDate);
        }

        // Apply month filter
        if (selectedMonth !== "all") {
          const monthNumber = parseInt(selectedMonth, 10);
          const startDate = new Date(parseInt(selectedYear), monthNumber - 1, 1).toISOString().split('T')[0];
          const endDate = new Date(parseInt(selectedYear), monthNumber, 0).toISOString().split('T')[0];
          query = query.gte('date', startDate).lte('date', endDate);
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
  }, [selectedYear, selectedMonth]);

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

        const yearStart = `${selectedYear}-01-01`;
        const yearEnd = `${selectedYear}-12-31`;

        // Fetch yearly sales total
        const { data: yearSalesData, error: yearSalesError } = await supabase
          .from('sales')
          .select('grand_total')
          .eq('user_id', session.user.id)
          .gte('date', yearStart)
          .lte('date', yearEnd);

        if (yearSalesError) {
          console.error("Error fetching yearly sales:", yearSalesError);
          setYearSalesTotal(0);
        } else {
          const total = yearSalesData?.reduce((sum, sale) => sum + Number(sale.grand_total || 0), 0) || 0;
          setYearSalesTotal(total);
        }

        // Fetch yearly expenses total
        const { data: yearExpensesData, error: yearExpensesError } = await supabase
          .from('expenses')
          .select('amount')
          .eq('user_id', session.user.id)
          .gte('date', yearStart)
          .lte('date', yearEnd);

        if (yearExpensesError) {
          console.error("Error fetching yearly expenses:", yearExpensesError);
          setYearExpensesTotal(0);
        } else {
          const total = yearExpensesData?.reduce((sum, expense) => sum + Number(expense.amount || 0), 0) || 0;
          setYearExpensesTotal(total);
        }

        // Fetch monthly sales total
        let currentMonthlySalesTotal = 0;
        let currentMonthlyExpensesTotal = 0;

        if (selectedMonth !== "all") {
          const monthNumber = parseInt(selectedMonth, 10);
          const monthStart = new Date(parseInt(selectedYear), monthNumber - 1, 1).toISOString().split('T')[0];
          const monthEnd = new Date(parseInt(selectedYear), monthNumber, 0).toISOString().split('T')[0];

          const { data: monthlySalesData, error: monthlySalesError } = await supabase
            .from('sales')
            .select('grand_total')
            .eq('user_id', session.user.id)
            .gte('date', monthStart)
            .lte('date', monthEnd);

          if (monthlySalesError) {
            console.error("Error fetching monthly sales:", monthlySalesError);
          } else {
            currentMonthlySalesTotal = monthlySalesData?.reduce((sum, sale) => sum + Number(sale.grand_total || 0), 0) || 0;
          }

          const { data: monthlyExpensesData, error: monthlyExpensesError } = await supabase
            .from('expenses')
            .select('amount')
            .eq('user_id', session.user.id)
            .gte('date', monthStart)
            .lte('date', monthEnd);

          if (monthlyExpensesError) {
            console.error("Error fetching monthly expenses:", monthlyExpensesError);
          } else {
            currentMonthlyExpensesTotal = monthlyExpensesData?.reduce((sum, expense) => sum + Number(expense.amount || 0), 0) || 0;
          }
        }

        setMonthlySalesTotal(currentMonthlySalesTotal);
        setMonthlyExpensesTotal(currentMonthlyExpensesTotal);
        setLoadingAggregates(false);
      };

      fetchAggregates();
    });
  }, [selectedYear, selectedMonth]);

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
        // Fetch all sales to filter by product name locally for now
        // TODO: Implement more efficient backend filtering for product name (Supabase equivalent of $regex)
        const allSales = sales; // Use existing sales state
/*
        const { data: allSales, error: salesError } = await supabase
          .from('sales')
          .select('*')
          .eq('user_id', session.user.id)
          .order('date', { ascending: true });

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
*/
        const filteredSales = allSales?.filter((sale: any) =>
          sale.items && sale.items.some((item: any) => {
            // Temporarily commenting out category filter as item.category_id is not in sales.items JSONB
            // const matchesCategory = selectedCategory !== "all" ? (item.category_id === selectedCategory) : true;
            const matchesProduct = selectedProduct !== "all" ? (item.description === selectedProduct) : true; // Filter by item.description
            // console.log("Item Category ID:", item.category_id, "Matches Category:", matchesCategory);
            return matchesProduct; // Only filtering by product for now
          })
        ) || [];

        // Calculate product statistics
        let totalUnitsSold = 0;
        let totalRevenue = 0;
        let firstSaleDate: string | null = null;
        let lastSaleDate: string | null = null;
        const monthlyUnitsMap: { [key: string]: number } = {};
        const productSpecificSales: any[] = [];

        filteredSales.forEach((sale: any) => {
          sale.items.forEach((item: any) => {
            // Temporarily commenting out category filter as item.category_id is not in sales.items JSONB
            // const matchesCategory = selectedCategory !== "all" ? (item.category_id === selectedCategory) : true;
            const matchesProduct = selectedProduct !== "all" ? (item.description === selectedProduct) : true; // Filter by item.description
            // console.log("Item Category ID:", item.category_id, "Matches Category:", matchesCategory);
            if (matchesProduct) {
              totalUnitsSold += item.qty;
              totalRevenue += item.qty * item.unitPrice;
              productSpecificSales.push({
                id: `${sale.id}-${item.description}`,
                date: sale.date,
                customer_name: sale.customer_name,
                quantity: item.qty,
                price: item.unitPrice,
                total: item.qty * item.unitPrice,
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
  }, [selectedProduct, sales]);

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
  }, [sales]);

  return (
    <>
      <DashboardNavbar />
      <main className="w-full min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold mb-6">Reports & History</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Select defaultValue={String(currentYear)} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select defaultValue="all" onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          <Tabs defaultValue="sales" className="mt-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="product-history">Product History</TabsTrigger>
            </TabsList>
            <TabsContent value="sales">
              <div className="rounded-lg border p-4 shadow-sm">
                <h2 className="text-2xl font-semibold mb-4">Sales Report</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Grand Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingSales ? (
                      <TableRow><TableCell colSpan={4} className="text-center">Loading sales...</TableCell></TableRow>
                    ) : sales.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center">No sales found for the selected period.</TableCell></TableRow>
                    ) : (
                      sales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell>{formatDate(sale.date)}</TableCell>
                          <TableCell>{sale.customer_name}</TableCell>
                          <TableCell>{sale.items.length}</TableCell>
                          <TableCell>${Number(sale.grand_total).toFixed(2)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <div className="flex justify-center mt-4">
                  {/* Pagination controls will go here */}
                  <Button variant="outline" className="mx-1">Previous</Button>
                  <Button variant="outline" className="mx-1">1</Button>
                  <Button variant="outline" className="mx-1">2</Button>
                  <Button variant="outline" className="mx-1">Next</Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="expenses">
              <div className="rounded-lg border p-4 shadow-sm">
                <h2 className="text-2xl font-semibold mb-4">Expenses Report</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead>User</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingExpenses ? (
                      <TableRow><TableCell colSpan={5} className="text-center">Loading expenses...</TableCell></TableRow>
                    ) : expenses.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center">No expenses found for the selected period.</TableCell></TableRow>
                    ) : (
                      expenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>{formatDate(expense.date)}</TableCell>
                          <TableCell>{expense.category}</TableCell>
                          <TableCell>${Number(expense.amount).toFixed(2)}</TableCell>
                          <TableCell>{expense.note}</TableCell>
                          <TableCell>{expense.user_id}</TableCell> {/* Assuming user_id is enough for now */}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <div className="flex justify-center mt-4">
                  {/* Pagination controls will go here */}
                  <Button variant="outline" className="mx-1">Previous</Button>
                  <Button variant="outline" className="mx-1">1</Button>
                  <Button variant="outline" className="mx-1">2</Button>
                  <Button variant="outline" className="mx-1">Next</Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="product-history">
              <div className="rounded-lg border p-4 shadow-sm">
                <h2 className="text-2xl font-semibold mb-4">Product History</h2>
                <div className="mb-4">
                  <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="rounded-lg border p-4 shadow-sm">
                    <p className="text-sm font-medium">Total Units Sold</p>
                    <p className="text-2xl font-bold">{loadingProductStats ? "..." : productStats?.totalUnitsSold || 0}</p>
                  </div>
                  <div className="rounded-lg border p-4 shadow-sm">
                    <p className="text-sm font-medium">Total Revenue</p>
                    <p className="text-2xl font-bold">{loadingProductStats ? "..." : `$${Number(productStats?.totalRevenue || 0).toFixed(2)}`}</p>
                  </div>
                </div>

                <div className="rounded-lg border p-4 shadow-sm mb-6">
                  <h3 className="text-xl font-semibold mb-4">Monthly Units Sold</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    {loadingMonthlyUnitsSold ? (
                      <div className="h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
                    ) : monthlyUnitsSold.length === 0 ? (
                      null
                    ) : (
                      <LineChart
                        data={monthlyUnitsSold}
                        margin={{
                          top: 5, right: 30, left: 20, bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="units" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>

                <h3 className="text-xl font-semibold mb-4">Product Sales History</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingProductSalesHistory ? (
                      <TableRow><TableCell colSpan={5} className="text-center">Loading product sales history...</TableCell></TableRow>
                    ) : productSalesHistory.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center">No sales history found for this product.</TableCell></TableRow>
                    ) : (
                      productSalesHistory.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell>{formatDate(sale.date)}</TableCell>
                          <TableCell>{sale.customer_name}</TableCell>
                          <TableCell>{sale.quantity}</TableCell>
                          <TableCell>${Number(sale.price).toFixed(2)}</TableCell>
                          <TableCell>${Number(sale.total).toFixed(2)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <div className="flex justify-center mt-4">
                  {/* Pagination controls will go here */}
                  <Button variant="outline" className="mx-1">Previous</Button>
                  <Button variant="outline" className="mx-1">1</Button>
                  <Button variant="outline" className="mx-1">2</Button>
                  <Button variant="outline" className="mx-1">Next</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}
