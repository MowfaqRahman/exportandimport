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

interface Category {
    id: string;
    name: string;
}

interface AddCategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category?: Category;
    onSuccess: () => void;
}

export function AddCategoryDialog({
    open,
    onOpenChange,
    category,
    onSuccess,
}: AddCategoryDialogProps) {
    const { register, handleSubmit, reset, setValue } = useForm<Category>();
    const [loading, setLoading] = useState(false);
    const supabase = createClient();
    const { toast } = useToast();

    useEffect(() => {
        if (category) {
            setValue("name", category.name);
        } else {
            reset({
                name: "",
            });
        }
    }, [category, open, reset, setValue]);

    const onSubmit = async (data: Category) => {
        setLoading(true);

        try {
            if (category) {
                // Update existing
                const { error } = await supabase
                    .from("category")
                    .update({
                        name: data.name,
                    })
                    .eq("id", category.id);

                if (error) throw error;
                toast({ title: "Success", description: "Category updated successfully." });
            } else {
                // Create new
                const { error } = await supabase
                    .from("category")
                    .insert([{
                        name: data.name,
                    }]);

                if (error) throw error;
                toast({ title: "Success", description: "Category added successfully." });
            }

            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Error saving category:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to save category.",
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
                    <DialogTitle>{category ? "Edit Category" : "Add Category"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" required {...register("name")} />
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
