"use client";

import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, Search } from "lucide-react";
import AddSaleDialog from "./add-sale-dialog";
import EditSaleDialog from "./edit-sale-dialog";
import { createClient } from "../../../supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Sale } from "@/types/business";
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
import { generateSaleInvoicePDF } from "@/utils/generateSaleInvoicePDF"; // Import new PDF generator

interface SalesTableProps {
  initialSales: Sale[];
  onDataChange: (sales: Sale[]) => void;
  onRefresh: () => void;
}

export default function SalesTable({ initialSales, onDataChange, onRefresh }: SalesTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editSale, setEditSale] = useState<Sale | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  // Use props directly for filtering
  const filteredSales = useMemo(() => {
    return initialSales.filter(sale =>
      sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.items?.some(item => item.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    ).sort((a, b) => {
      const dateA = new Date(a.created_at || a.date);
      const dateB = new Date(b.created_at || b.date);
      return dateB.getTime() - dateA.getTime();
    });
  }, [searchTerm, initialSales]);

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', deleteId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Sale deleted successfully",
      });
      onRefresh();
    }
    setDeleteId(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleGenerateInvoice = async (sale: Sale) => {
    try {
      // Fetch the latest customer details from the customers table
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('company_name, email, address, phone_number')
        .eq('customer_name', sale.customer_name)
        .single();

      if (customerError && customerError.code !== 'PGRST116') {
        console.error("Error fetching customer details for invoice:", customerError);
      }

      generateSaleInvoicePDF({
        date: sale.date,
        customer_name: sale.customer_name || '',
        customer_phone: customerData?.phone_number || sale.customer_phone_footer || '',
        customer_email: customerData?.email || '',
        customer_address: customerData?.address || '',
        customer_company_name: customerData?.company_name || '',
        items: sale.items || [],
        grand_total: sale.grand_total || 0,
        salesman_name_footer: sale.salesman_name_footer || '',
        invoice_no: sale.invoice_no || '',
        company_name: "KTF Vegetable and Fruit",
        company_address: "Umm Salal, Doha, Qatar",
        company_phone: "(+974) 30933327",
        company_email: "ktf.co2025@gmail.com",
        isPaid: sale.paid || false,
        dueDate: sale.due_date || null,
        paymentType: sale.payment_type,
        disclaimer: sale.disclaimer,
      });
      toast({
        title: "Success",
        description: "Invoice downloaded successfully",
      });
    } catch (pdfError) {
      console.error('Error generating PDF:', pdfError);
      toast({
        title: "Error",
        description: "Failed to generate PDF invoice",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Sales Transactions</CardTitle>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sales..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full sm:w-[250px]"
                />
              </div>
              <AddSaleDialog onSaleAdded={onRefresh} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Grand Total</TableHead>
                  <TableHead className="text-right">Invoice No</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead className="text-right">Invoice</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No sales found. Add your first sale to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{formatDate(sale.date)}</TableCell>
                      <TableCell>{sale.customer_name || '-'}</TableCell>
                      <TableCell>
                        {sale.items && sale.items.length > 0 ? (
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-primary/10 text-primary">
                            {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        QAR {Number(sale.grand_total || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {sale.invoice_no}
                      </TableCell>
                      <TableCell>
                        {sale.paid ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">Paid</span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">Unpaid</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {sale.paid && sale.payment_type ? (
                          <span className="text-sm font-medium">{sale.payment_type}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateInvoice(sale)}
                        >
                          Invoice
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditSale(sale)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(sale.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the sale record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editSale && (
        <EditSaleDialog
          sale={editSale}
          open={!!editSale}
          onClose={() => setEditSale(null)}
          onSaleUpdated={onRefresh}
        />
      )}
    </>
  );
}