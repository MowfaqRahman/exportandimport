"use client";

import { useState, useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, PlusCircle, Search } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddPurchaseDialogOpen, setIsAddPurchaseDialogOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [deletingPurchaseId, setDeletingPurchaseId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const supabase = createClient();
  const { toast } = useToast();

  const filteredPurchases = useMemo(() => {
    return initialPurchases.filter(purchase =>
      purchase.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.purchase_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.items?.some(item => item.productName?.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [searchTerm, initialPurchases]);

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
      onDataChange(data);
    }
  };

  const handleAddPurchase = (newPurchase: Purchase) => {
    const updatedPurchases = [...initialPurchases, newPurchase];
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
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Purchase Transactions</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search purchases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full sm:w-[250px]"
                />
              </div>
              <Button onClick={() => {
                setEditingPurchase(null);
                setIsAddPurchaseDialogOpen(true);
              }}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Purchase
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">No.</TableHead>
                  <TableHead>Pur. No.</TableHead>
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
                {filteredPurchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No purchase transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPurchases.map((purchase, index) => (
                    <TableRow key={purchase.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium text-emerald-600 dark:text-emerald-400">
                        {purchase.purchase_no || "N/A"}
                      </TableCell>
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
    </>
  );
}
