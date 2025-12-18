"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { createClient } from "../../../supabase/client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface Customer {
    customer_id: number;
    customer_name: string;
    phone_number: string | null;
    email: string | null;
    address: string | null;
}

interface AddCustomerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customer?: Customer;
    onSuccess: () => void;
}

export function AddCustomerDialog({
    open,
    onOpenChange,
    customer,
    onSuccess,
}: AddCustomerDialogProps) {
    const { register, handleSubmit, reset, setValue } = useForm<Customer>();
    const [loading, setLoading] = useState(false);
    const supabase = createClient();
    const { toast } = useToast();

    useEffect(() => {
        if (customer) {
            setValue("customer_name", customer.customer_name);
            setValue("phone_number", customer.phone_number);
            setValue("email", customer.email);
            setValue("address", customer.address);
        } else {
            reset({
                customer_name: "",
                phone_number: "",
                email: "",
                address: "",
            });
        }
    }, [customer, open, reset, setValue]);

    const onSubmit = async (data: Customer) => {
        setLoading(true);

        try {
            if (customer) {
                // Update existing
                const { error } = await supabase
                    .from("customers")
                    .update({
                        customer_name: data.customer_name,
                        phone_number: data.phone_number,
                        email: data.email,
                        address: data.address,
                    })
                    .eq("customer_id", customer.customer_id);

                if (error) throw error;
                toast({ title: "Success", description: "Customer updated successfully." });
            } else {
                // Create new
                const { error } = await supabase
                    .from("customers")
                    .insert([{
                        customer_name: data.customer_name,
                        phone_number: data.phone_number,
                        email: data.email,
                        address: data.address,
                    }]);

                if (error) throw error;
                toast({ title: "Success", description: "Customer added successfully." });
            }

            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Error saving customer:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to save customer.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{customer ? "Edit Customer" : "Add Customer"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="customer_name">Name</Label>
                        <Input id="customer_name" required {...register("customer_name")} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone_number">Phone Number</Label>
                        <Input id="phone_number" {...register("phone_number")} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" {...register("email")} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" {...register("address")} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
