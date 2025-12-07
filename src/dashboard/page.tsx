import DashboardNavbar from "@/components/dashboard-navbar";
import { redirect } from "next/navigation";
import { createClient } from "../../supabase/server";
import DashboardContent from "@/components/dashboard/dashboard-content";
import { Purchase } from "@/types/business";

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

  const { data: salesData, error: salesError } = await supabase.from("sales").select("*").order("date", { ascending: false });
  const { data: expensesData, error: expensesError } = await supabase.from("expenses").select("*").order("date", { ascending: false });
  const { data: purchasesData, error: purchasesError } = await supabase.from("purchase").select("*").order("date", { ascending: false });

  if (salesError || expensesError || purchasesError) {
    console.error("Error fetching dashboard data:", salesError, expensesError, purchasesError);
    // Handle error appropriately, e.g., display an error message or redirect
    // For now, we'll proceed with empty arrays to prevent crashing
  }

  return (
    <>
      <DashboardNavbar />
      <main className="w-full min-h-screen bg-background">
        <DashboardContent 
          initialSales={salesData?.data || []}
          initialExpenses={expensesData?.data || []}
          initialPurchases={purchasesData?.data || []}
        />
      </main>
    </>
  );
}