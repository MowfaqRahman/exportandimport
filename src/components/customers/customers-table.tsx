"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../supabase/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { AddCustomerDialog } from "./add-customer-dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

interface Customer {
    customer_id: number;
    customer_name: string;
    phone_number: string | null;
    email: string | null;
    address: string | null;
}

export function CustomersTable() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isaddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
    const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

    const supabase = createClient();
    const { toast } = useToast();

    const fetchCustomers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("customers")
            .select("*")
            .order("customer_id");

        if (error) {
            console.error("Error fetching customers:", error);
            toast({
                title: "Error",
                description: "Failed to load customers.",
                variant: "destructive",
            });
        } else {
            setCustomers(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleDelete = async () => {
        if (!customerToDelete) return;

        const { error } = await supabase
            .from("customers")
            .delete()
            .eq("customer_id", customerToDelete.customer_id);

        if (error) {
            console.error("Error deleting customer:", error);
            toast({
                title: "Error",
                description: "Failed to delete customer.",
                variant: "destructive",
            });
        } else {
            toast({
                title: "Success",
                description: "Customer deleted successfully.",
            });
            fetchCustomers();
        }
        setCustomerToDelete(null);
    };

    const filteredCustomers = customers.filter((customer) =>
        customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phone_number && customer.phone_number.includes(searchTerm))
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="relative w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search customers..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={() => { setSelectedCustomer(undefined); setIsAddDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> Add Customer
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : filteredCustomers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">
                                    No customers found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <TableRow key={customer.customer_id}>
                                    <TableCell>{customer.customer_id}</TableCell>
                                    <TableCell className="font-medium">{customer.customer_name}</TableCell>
                                    <TableCell>{customer.phone_number || "-"}</TableCell>
                                    <TableCell>{customer.email || "-"}</TableCell>
                                    <TableCell>{customer.address || "-"}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setSelectedCustomer(customer);
                                                setIsAddDialogOpen(true);
                                            }}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => setCustomerToDelete(customer)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <AddCustomerDialog
                open={isaddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                customer={selectedCustomer}
                onSuccess={fetchCustomers}
            />

            <AlertDialog open={!!customerToDelete} onOpenChange={(open) => !open && setCustomerToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the customer
                            "{customerToDelete?.customer_name}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
