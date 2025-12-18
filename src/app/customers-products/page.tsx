"use client";

import { useState } from "react";
import DashboardNavbar from "@/components/dashboard-navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomersTable } from "@/components/customers/customers-table";
import { CategoriesTable } from "@/components/products/categories-table";

export default function CustomersProductsPage() {
    const [activeTab, setActiveTab] = useState("customers");

    return (
        <>
            <DashboardNavbar activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="w-full min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8 space-y-8">
                    <h1 className="text-3xl font-bold tracking-tight">Customers & Products</h1>
                    <p className="text-muted-foreground mt-2 mb-4">
                        Manage your customers and products (categories) inventory.
                    </p>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="customers">Customers</TabsTrigger>
                            <TabsTrigger value="products">Products</TabsTrigger>
                        </TabsList>
                        <TabsContent value="customers" className="space-y-4">
                            <CustomersTable />
                        </TabsContent>
                        <TabsContent value="products" className="space-y-4">
                            <CategoriesTable />
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </>
    );
}
