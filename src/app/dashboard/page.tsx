import DashboardNavbar from "@/components/dashboard-navbar";
import { redirect } from "next/navigation";
import { createClient } from "../../../supabase/server";
import DashboardContent from "@/components/dashboard/dashboard-content";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  // Fetch initial data
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const lastDay = new Date(currentYear, currentMonth, 0).getDate();

  const firstDayStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
  const lastDayStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const [salesData, expensesData, purchasesData] = await Promise.all([
    supabase
      .from('sales')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', firstDayStr)
      .lte('date', lastDayStr)
      .order('date', { ascending: true }),
    supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', firstDayStr)
      .lte('date', lastDayStr)
      .order('date', { ascending: true }),
    supabase
      .from('purchases')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', firstDayStr)
      .lte('date', lastDayStr)
      .order('date', { ascending: true }),
  ]);

  return (
    <>
      <DashboardNavbar />
      <main className="w-full min-h-screen bg-background">
        <DashboardContent
          initialSales={salesData.data || []}
          initialExpenses={expensesData.data || []}
          initialPurchases={purchasesData.data || []}
        />
      </main>
    </>
  );
}