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
import { PlusCircle } from "lucide-react";
import AddPurchaseDialog from "./add-purchase-dialog";

interface PurchaseTableProps {
  initialPurchases: Purchase[];
  onDataChange: (purchases: Purchase[]) => void;
}

export default function PurchaseTable({ initialPurchases, onDataChange }: PurchaseTableProps) {
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);
  const [isAddPurchaseDialogOpen, setIsAddPurchaseDialogOpen] = useState(false);

  const handleAddPurchase = (newPurchase: Purchase) => {
    const updatedPurchases = [...purchases, newPurchase];
    setPurchases(updatedPurchases);
    onDataChange(updatedPurchases);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Purchase Transactions</h2>
        <Button onClick={() => setIsAddPurchaseDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Purchase
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No purchase transactions found.
                </TableCell>
              </TableRow>
            )}
            {purchases.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell>{purchase.date}</TableCell>
                <TableCell>{purchase.product_name}</TableCell>
                <TableCell>{purchase.company_name}</TableCell>
                <TableCell>{purchase.unit}</TableCell>
                <TableCell className="text-right">${purchase.price.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <AddPurchaseDialog
        isOpen={isAddPurchaseDialogOpen}
        onClose={() => setIsAddPurchaseDialogOpen(false)}
        onAddPurchase={handleAddPurchase}
      />
    </div>
  );
}
