"use client";

import { useState } from "react";
import DashboardNavbar from "@/components/dashboard-navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomersTable } from "@/components/customers/customers-table";
import { CategoriesTable } from "@/components/products/categories-table";
import { PurchaseCustomersTable } from "@/components/purchase-customers/purchase-customers-table";

export default function CustomersProductsPage() {
    const [activeTab, setActiveTab] = useState("sale-customers");

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
                            <TabsTrigger value="sale-customers">Sale Customer</TabsTrigger>
                            <TabsTrigger value="purchase-customers">Purchase Customer</TabsTrigger>
                            <TabsTrigger value="products">Products</TabsTrigger>
                        </TabsList>
                        <TabsContent value="sale-customers" className="space-y-4">
                            <CustomersTable />
                        </TabsContent>
                        <TabsContent value="purchase-customers" className="space-y-4">
                            <PurchaseCustomersTable />
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
