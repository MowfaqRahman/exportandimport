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

interface PurchaseCustomer {
    id: number;
    name: string;
    company_name: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
}

interface AddPurchaseCustomerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    customer?: PurchaseCustomer;
    onSuccess: () => void;
}

export function AddPurchaseCustomerDialog({
    open,
    onOpenChange,
    customer,
    onSuccess,
}: AddPurchaseCustomerDialogProps) {
    const { register, handleSubmit, reset, setValue } = useForm<PurchaseCustomer>();
    const [loading, setLoading] = useState(false);
    const supabase = createClient();
    const { toast } = useToast();

    useEffect(() => {
        if (customer) {
            setValue("name", customer.name);
            setValue("company_name", customer.company_name);
            setValue("phone", customer.phone);
            setValue("email", customer.email);
            setValue("address", customer.address);
        } else {
            reset({
                name: "",
                company_name: "",
                phone: "",
                email: "",
                address: "",
            });
        }
    }, [customer, open, reset, setValue]);

    const onSubmit = async (data: PurchaseCustomer) => {
        setLoading(true);

        try {
            if (customer) {
                // Update existing
                const { error } = await supabase
                    .from("purchase_customer")
                    .update({
                        name: data.name,
                        company_name: data.company_name,
                        phone: data.phone,
                        email: data.email,
                        address: data.address,
                    })
                    .eq("id", customer.id);

                if (error) throw error;
                toast({ title: "Success", description: "Purchase customer updated successfully." });
            } else {
                // Create new
                const { error } = await supabase
                    .from("purchase_customer")
                    .insert([{
                        name: data.name,
                        company_name: data.company_name,
                        phone: data.phone,
                        email: data.email,
                        address: data.address,
                    }]);

                if (error) throw error;
                toast({ title: "Success", description: "Purchase customer added successfully." });
            }

            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Error saving purchase customer:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to save purchase customer.",
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
                    <DialogTitle>{customer ? "Edit Purchase Customer" : "Add Purchase Customer"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" required {...register("name")} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="company_name">Company Name</Label>
                        <Input id="company_name" {...register("company_name")} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" {...register("phone")} />
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
