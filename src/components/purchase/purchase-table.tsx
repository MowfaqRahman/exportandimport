"use client";

import { useState } from "react";
import { Purchase } from "@/types/business";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, PlusCircle } from "lucide-react";
import AddPurchaseDialog from "./add-purchase-dialog";
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

interface PurchaseTableProps {
  initialPurchases: Purchase[];
  onDataChange: (purchases: Purchase[]) => void;
}

export default function PurchaseTable({ initialPurchases, onDataChange }: PurchaseTableProps) {
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
  const [isAddPurchaseDialogOpen, setIsAddPurchaseDialogOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [deletingPurchaseId, setDeletingPurchaseId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const supabase = createClient();
  const { toast } = useToast();

  const fetchPurchases = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error("Error fetching purchases:", error);
    } else if (data) {
      setPurchases(data);
      onDataChange(data);
    }
  };

  const handleAddPurchase = (newPurchase: Purchase) => {
    const updatedPurchases = [...purchases, newPurchase];
    setPurchases(updatedPurchases);
    onDataChange(updatedPurchases);
  };

  const handleEdit = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setIsAddPurchaseDialogOpen(true);
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Purchase Transactions</h2>
        <Button onClick={() => {
          setEditingPurchase(null);
          setIsAddPurchaseDialogOpen(true);
        }}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Purchase
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">No.</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="min-w-[200px]">Name of Item</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Sum (QAR)</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No purchase transactions found.
                </TableCell>
              </TableRow>
            )}
            {purchases.map((purchase, index) => (
              <TableRow key={purchase.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{purchase.date}</TableCell>
                <TableCell className="font-medium">
                  {purchase.items?.[0]?.productName || "N/A"}
                  {purchase.items && purchase.items.length > 1 ? ` (+${purchase.items.length - 1})` : ""}
                </TableCell>
                <TableCell>{purchase.company_name}</TableCell>
                <TableCell>{purchase.items?.[0]?.unit || "-"}</TableCell>
                <TableCell className="text-right font-semibold">
                  QAR {Number(purchase.grand_total || 0).toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${purchase.paid
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}>
                    {purchase.paid ? "Paid" : "Not Paid"}
                  </span>
                </TableCell>
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
            ))}
          </TableBody>
        </Table>
      </div>

      <AddPurchaseDialog
        isOpen={isAddPurchaseDialogOpen}
        onClose={() => {
          setIsAddPurchaseDialogOpen(false);
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
              This action cannot be undone. This will permanently delete the purchase transaction.
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
    </div>
  );
}
