"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { createClient } from "../../../supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Sale, InvoiceItem } from "@/types/business";

interface EditSaleDialogProps {
  sale: Sale;
  open: boolean;
  onClose: () => void;
  onSaleUpdated: () => void;
}

export default function EditSaleDialog({ sale, open, onClose, onSaleUpdated }: EditSaleDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>(sale.items || [{ no: 1, description: '', qty: 0, unitPrice: 0 }]);
  const [salesmanEmail, setSalesmanEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setSalesmanEmail(user.email);
      }
    };
    fetchUserEmail();
  }, []);

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...invoiceItems];
    (newItems[index] as any)[field] = value;
    setInvoiceItems(newItems);
  };

  const handleAddItem = () => {
    if (invoiceItems.length < 20) {
      setInvoiceItems([...invoiceItems, { no: invoiceItems.length + 1, description: '', qty: 0, unitPrice: 0 }]);
    }
  };

  const calculateTotal = (item: InvoiceItem) => {
    return item.qty * item.unitPrice;
  };

  const calculateGrandTotal = () => {
    let grandTotal = 0;
    invoiceItems.forEach(item => {
      grandTotal += calculateTotal(item);
    });
    return grandTotal;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      date: formData.get('date') as string,
      customer_name: formData.get('customer_name') as string,
      items: invoiceItems.filter(item => item.description !== ''),
      grand_total: calculateGrandTotal(),
      salesman_name_footer: salesmanEmail || '',
      customer_phone_footer: formData.get('customer_phone_footer') as string,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('sales')
      .update(data)
      .eq('id', sale.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Sale updated successfully",
      });
      onClose();
      onSaleUpdated();
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Sale</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                required
                defaultValue={sale.date}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer Name</Label>
              <Input
                id="customer_name"
                name="customer_name"
                placeholder="Customer Name"
                defaultValue={sale.customer_name}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">No.</TableHead>
                  <TableHead>Name of Item</TableHead>
                  <TableHead className="w-[100px]">Quantity</TableHead>
                  <TableHead className="text-right">Amount ($)</TableHead>
                  <TableHead className="text-right">Sum ($)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoiceItems.map((item, index) => (
                  <TableRow key={item.no}>
                    <TableCell>{item.no}</TableCell>
                    <TableCell>
                      <Input
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Item Name"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.qty || ''}
                        onChange={(e) => handleItemChange(index, 'qty', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unitPrice || ''}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="text-right"
                        placeholder="0.00"
                      />
                    </TableCell>
                    <TableCell className="text-right">{calculateTotal(item).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                {invoiceItems.length < 20 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Button type="button" variant="outline" onClick={handleAddItem} className="w-full">
                        Add Item
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} className="text-right text-base font-semibold">Grand Total</TableCell>
                  <TableCell className="text-right text-base font-semibold">${calculateGrandTotal().toFixed(2)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="salesman_name_footer">Salesman Email</Label>
              <Input
                id="salesman_name_footer"
                name="salesman_name_footer"
                placeholder="Salesman Email"
                value={salesmanEmail || ''}
                readOnly
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_phone_footer">Tel. No.</Label>
              <Input
                id="customer_phone_footer"
                name="customer_phone_footer"
                placeholder="Customer Phone Number"
                defaultValue={sale.customer_phone_footer}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Sale"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}