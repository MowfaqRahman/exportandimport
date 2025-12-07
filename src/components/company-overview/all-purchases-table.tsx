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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

interface AllPurchasesTableProps {
  initialPurchases: Purchase[];
}

export default function AllPurchasesTable({ initialPurchases }: AllPurchasesTableProps) {
  const [purchases, setPurchases] = useState<Purchase[]>(initialPurchases);

  // TODO: Implement edit and delete functionality later if needed

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">All Purchase Transactions</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>User</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
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
                <TableCell>${purchase.price.toFixed(2)}</TableCell>
                <TableCell>{(purchase as any).user_name}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(purchase.id)}>
                        Copy Purchase ID
                      </DropdownMenuItem>
                      {/* <DropdownMenuSeparator /> */}
                      {/* Add Edit/Delete options here later */}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
