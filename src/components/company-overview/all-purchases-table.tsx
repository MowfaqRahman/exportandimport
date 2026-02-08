"use client";

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Edit, Trash2, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Expense, Purchase } from "@/types/business";
import { Button } from "@/components/ui/button";
import AddPurchaseDialog from "../purchase/add-purchase-dialog";
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
import { createClient } from "../../../supabase/client";
import { useToast } from "@/components/ui/use-toast";


interface AllPurchasesTableProps {
  initialPurchases: Purchase[];
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export function AllPurchasesTable({ initialPurchases }: AllPurchasesTableProps) {
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [deletingPurchaseId, setDeletingPurchaseId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const supabase = createClient();
  const { toast } = useToast();

  const fetchPurchases = async () => {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error("Error fetching all purchases:", error);
    } else if (data) {
      setPurchases(data);
    }
  };

  const handleEdit = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingPurchaseId) return;

    setIsDeleting(true);
    const { error } = await supabase
      .from('purchases')
      .delete()
      .eq('id', deletingPurchaseId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Purchase deleted successfully.",
      });
      fetchPurchases();
    }
    setIsDeleting(false);
    setDeletingPurchaseId(null);
  };

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch =
      purchase.items?.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      purchase.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (purchase.user_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true :
        statusFilter === "paid" ? purchase.paid === true :
          statusFilter === "unpaid" ? purchase.paid === false : true;

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">All User Purchases</CardTitle>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select defaultValue="all" onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="relative w-full max-sm:w-[250px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search purchases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table className="min-w-full divide-y divide-gray-200">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">No.</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="min-w-[200px]">Name of Item</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Sum (QAR)</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead>Salesman Name</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    No purchases found for all users.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPurchases.map((purchase, index) => (
                  <TableRow key={purchase.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{format(new Date(purchase.date), "dd/MM/yyyy")}</TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {purchase.items?.[0]?.productName || "N/A"}
                      {purchase.items && purchase.items.length > 1 ? ` (+${purchase.items.length - 1})` : ""}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{purchase.company_name}</TableCell>
                    <TableCell>{purchase.items?.[0]?.unit || "-"}</TableCell>
                    <TableCell className="text-right font-semibold">
                      QAR {purchase.grand_total ? Number(purchase.grand_total).toFixed(2) : '0.00'}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${purchase.paid
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        }`}>
                        {purchase.paid ? "Paid" : "Not Paid"}
                      </span>
                    </TableCell>
                    <TableCell>{purchase.user_name || 'N/A'}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(purchase)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeletingPurchaseId(purchase.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <AddPurchaseDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingPurchase(null);
        }}
        onSuccess={fetchPurchases}
        purchase={editingPurchase || undefined}
      />

      <AlertDialog open={!!deletingPurchaseId} onOpenChange={() => setDeletingPurchaseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this purchase transaction.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
