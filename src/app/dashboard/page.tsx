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
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [salesData, expensesData] = await Promise.all([
    supabase
      .from('sales')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', firstDayOfMonth.toISOString().split('T')[0])
      .lte('date', lastDayOfMonth.toISOString().split('T')[0])
      .order('date', { ascending: true }),
    supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', firstDayOfMonth.toISOString().split('T')[0])
      .lte('date', lastDayOfMonth.toISOString().split('T')[0])
      .order('date', { ascending: true }),
  ]);

  return (
    <>
      <DashboardNavbar />
      <main className="w-full min-h-screen bg-background">
        <DashboardContent 
          initialSales={salesData.data || []}
          initialExpenses={expensesData.data || []}
        />
      </main>
    </>
  );
}