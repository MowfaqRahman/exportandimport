"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react";
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

  // Initialize state with sale data
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>(sale.items || [{ no: 1, description: '', qty: 0, unitPrice: 0 }]);
  const [salesmanEmail, setSalesmanEmail] = useState<string | null>(null);
  const [salesmanName, setSalesmanName] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [customers, setCustomers] = useState<string[]>([]);
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>(sale.customer_name || '');
  const [isPaid, setIsPaid] = useState<boolean>(sale.paid || false);
  const [paymentType, setPaymentType] = useState<'Cash' | 'Online' | 'UPI'>(sale.payment_type || 'Cash');
  const [dueDate, setDueDate] = useState<string | null>(sale.due_date || null);
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);
  const [customerAddress, setCustomerAddress] = useState<string | null>(null);
  const [customerPhone, setCustomerPhone] = useState<string | null>(sale.customer_phone_footer || null);
  const [disclaimer, setDisclaimer] = useState<string>(sale.disclaimer || '');

  useEffect(() => {
    // Re-initialize state when sale prop changes
    if (open) {
      setInvoiceItems(sale.items || [{ no: 1, description: '', qty: 0, unitPrice: 0 }]);
      setSelectedCustomerName(sale.customer_name || '');
      setIsPaid(sale.paid || false);
      setPaymentType(sale.payment_type || 'Cash');
      setDueDate(sale.due_date || null);
      setCustomerPhone(sale.customer_phone_footer || null);
      setDisclaimer(sale.disclaimer || '');
    }
  }, [sale, open]);

  useEffect(() => {
    const fetchUserAndSalesmanName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setSalesmanEmail(user.email || null);
        const { data: userData, error } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error fetching user full name:", error);
          setSalesmanName(user.email || null);
        } else if (userData?.full_name) {
          setSalesmanName(userData.full_name);
        } else {
          setSalesmanName(user.email || null);
        }
      }
    };

    const fetchInitialData = async () => {
      const { data, error } = await supabase.from('category').select('id, name');
      if (error) {
        console.error("Error fetching categories:", error);
        toast({
          title: "Error",
          description: "Failed to load categories.",
          variant: "destructive",
        });
      } else {
        setCategories(data);
      }

      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('customer_id, customer_name, phone_number, email, address');

      if (customerError) {
        console.error("Error fetching customer names:", customerError);
        toast({
          title: "Error",
          description: "Failed to load customer names.",
          variant: "destructive",
        });
      } else {
        const uniqueCustomerNames = Array.from(new Set(customerData?.map(c => c.customer_name).filter(Boolean)));
        setCustomers(uniqueCustomerNames as string[]);
      }
    };

    fetchUserAndSalesmanName();
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (selectedCustomerName) {
        const { data: customerData, error } = await supabase
          .from('customers')
          .select('phone_number, email, address')
          .eq('customer_name', selectedCustomerName)
          .single();

        if (error) {
          console.error("Error fetching customer details:", error);
        } else if (customerData) {
          // If selected customer is different from the original sale customer, update details
          // If it IS the original sale customer, we might want to preserve the original sale snapshot OR update to latest.
          // Usually, editing a sale means updating to reflect current reality, so fetching latest customer details is generally safer
          // unless the user specifically wants to keep old address/phone.
          // Given the UI shows these as read-only or auto-filled, let's update them.
          setCustomerPhone(customerData.phone_number);
          setCustomerEmail(customerData.email);
          setCustomerAddress(customerData.address);
        }
      }
    };
    fetchCustomerDetails();
  }, [selectedCustomerName]);

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

  const handleDeleteItem = (indexToDelete: number) => {
    const newItems = invoiceItems.filter((_, index) => index !== indexToDelete);
    const reIndexedItems = newItems.map((item, index) => ({ ...item, no: index + 1 }));
    setInvoiceItems(reIndexedItems);
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
      customer_name: selectedCustomerName,
      items: invoiceItems.filter(item => item.description !== ''),
      grand_total: calculateGrandTotal(),
      salesman_name_footer: salesmanName || sale.salesman_name_footer || salesmanEmail || '',
      customer_phone_footer: customerPhone || '',
      updated_at: new Date().toISOString(),
      paid: isPaid,
      payment_type: isPaid ? paymentType : null,
      due_date: !isPaid ? dueDate : null,
      disclaimer: disclaimer,
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Sale</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice_no">Invoice No.</Label>
              <Input
                id="invoice_no"
                name="invoice_no"
                value={sale.invoice_no || ''}
                readOnly
              />
            </div>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer Name</Label>
              <Select
                value={selectedCustomerName}
                onValueChange={setSelectedCustomerName}
              >
                <SelectTrigger id="customer_name" name="customer_name">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer} value={customer}>
                      {customer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer_phone_footer">Tel. No.</Label>
              <Input
                id="customer_phone_footer"
                name="customer_phone_footer"
                placeholder="Customer Phone Number"
                value={customerPhone || ''}
                readOnly
              />
            </div>
            {selectedCustomerName && (
              <div className="space-y-2">
                <Label htmlFor="customer_email">Email</Label>
                <Input
                  id="customer_email"
                  name="customer_email"
                  placeholder="Customer Email"
                  value={customerEmail || ''}
                  readOnly
                />
              </div>
            )}
            {selectedCustomerName && (
              <div className="space-y-2">
                <Label htmlFor="customer_address">Address</Label>
                <Input
                  id="customer_address"
                  name="customer_address"
                  placeholder="Customer Address"
                  value={customerAddress || ''}
                  readOnly
                />
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">No.</TableHead>
                  <TableHead>Name of Item</TableHead>
                  <TableHead className="w-[100px]">Quantity</TableHead>
                  <TableHead className="text-right">Amount (QAR)</TableHead>
                  <TableHead className="text-right">Sum (QAR)</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoiceItems.map((item, index) => (
                  <TableRow key={item.no}>
                    <TableCell>{item.no}</TableCell>
                    <TableCell>
                      <Select
                        value={item.description}
                        onValueChange={(value) => handleItemChange(index, 'description', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an item" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                    <TableCell className="text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteItem(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {invoiceItems.length < 20 && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Button type="button" variant="outline" onClick={handleAddItem} className="w-full">
                        Add Item
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={5} className="text-right text-base font-semibold">Grand Total</TableCell>
                  <TableCell className="text-right text-base font-semibold">QAR {calculateGrandTotal().toFixed(2)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paid_status">Payment Status</Label>
              <Button
                type="button"
                variant={isPaid ? "default" : "outline"}
                onClick={() => setIsPaid(!isPaid)}
                className="w-full"
              >
                {isPaid ? "Paid" : "Not Paid"}
              </Button>
            </div>
            <div className="space-y-2">
              {isPaid ? (
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Tabs value={paymentType} onValueChange={(v) => setPaymentType(v as 'Cash' | 'Online' | 'UPI')} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="Cash">Cash</TabsTrigger>
                      <TabsTrigger value="Online">Online</TabsTrigger>
                      <TabsTrigger value="UPI">UPI</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    name="due_date"
                    type="date"
                    value={dueDate || ''}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="disclaimer">Disclaimer</Label>
            <Textarea
              id="disclaimer"
              name="disclaimer"
              placeholder="Add a disclaimer or note (optional)"
              value={disclaimer}
              onChange={(e) => setDisclaimer(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="salesman_name_footer">Salesman Name</Label>
            <Input
              id="salesman_name_footer"
              name="salesman_name_footer"
              placeholder="Salesman Name"
              value={salesmanName || sale.salesman_name_footer || ''}
              readOnly
            />
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