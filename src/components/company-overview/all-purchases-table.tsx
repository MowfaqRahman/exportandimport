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
import { Search } from "lucide-react";
import { format } from "date-fns";
import { Expense } from "@/types/business";

interface Purchase {
  id: string;
  date: string;
  supplier_name: string;
  grand_total: number;
  payment_status: string;
  user_name?: string;
}

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
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPurchases = initialPurchases.filter(purchase =>
    purchase.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.payment_status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (purchase.user_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">All User Purchases</CardTitle>
        <div className="relative w-full max-w-sm sm:w-[250px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search purchases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table className="min-w-full divide-y divide-gray-200">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No purchases found for all users.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>{format(new Date(purchase.date), "dd/MM/yyyy")}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{purchase.supplier_name}</TableCell>
                    <TableCell className="font-medium">${purchase.grand_total ? purchase.grand_total.toFixed(2) : '0.00'}</TableCell>
                    <TableCell>{purchase.payment_status}</TableCell>
                    <TableCell>{purchase.user_name || "N/A"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
