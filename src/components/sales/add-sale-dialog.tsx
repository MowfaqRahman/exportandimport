"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "../../../supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Sale, InvoiceItem } from "@/types/business";
import { generateSaleInvoicePDF } from "@/utils/generateSaleInvoicePDF"; // Import new PDF generator

interface AddSaleDialogProps {
  onSaleAdded: () => void;
}

export default function AddSaleDialog({ onSaleAdded }: AddSaleDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([{ no: 1, description: '', qty: 0, unitPrice: 0 }]);
  const [salesmanEmail, setSalesmanEmail] = useState<string | null>(null);
  const [salesmanName, setSalesmanName] = useState<string | null>(null);
  const [invoiceNo, setInvoiceNo] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [customers, setCustomers] = useState<string[]>([]); // New state for customer names
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>(''); // New state for selected customer
  const [isPaid, setIsPaid] = useState<boolean>(false); // New state for payment status
  const [dueDate, setDueDate] = useState<string | null>(null); // New state for due date
  const [customerEmail, setCustomerEmail] = useState<string | null>(null); // New state for customer email
  const [customerAddress, setCustomerAddress] = useState<string | null>(null); // New state for customer address
  const [customerPhone, setCustomerPhone] = useState<string | null>(null); // New state for customer phone

  const generateNextInvoiceNumber = async () => {
    const { data, error } = await supabase
      .from('sales')
      .select('invoice_no')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error("Error fetching last invoice number:", error);
      return "INV-0001";
    } else if (data && data.invoice_no) {
      const lastNumberMatch = data.invoice_no.match(/INV-(\d+)/);
      if (lastNumberMatch) {
        const lastNumber = parseInt(lastNumberMatch[1], 10);
        const nextNumber = lastNumber + 1;
        return `INV-${String(nextNumber).padStart(4, '0')}`;
      } else {
        return "INV-0001";
      }
    } else {
      return "INV-0001";
    }
  };

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
          setSalesmanName(user.email || null); // Fallback to email if name not found
        } else if (userData?.full_name) {
          setSalesmanName(userData.full_name);
        } else {
          setSalesmanName(user.email || null); // Fallback to email if full_name is null
        }
      }
    };

    const fetchInitialData = async () => {
      const nextInvoiceNum = await generateNextInvoiceNumber();
      setInvoiceNo(nextInvoiceNum);
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

      // Fetch distinct customer names from public.customers
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('customer_id, customer_name, phone_number, email, address'); // Select all customer details

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
          setCustomerEmail(null);
          setCustomerAddress(null);
        } else if (customerData) {
          setCustomerPhone(customerData.phone_number);
          setCustomerEmail(customerData.email);
          setCustomerAddress(customerData.address);
        }
      } else {
        setCustomerPhone(null);
        setCustomerEmail(null);
        setCustomerAddress(null);
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
    // Re-index the items to maintain sequential 'no' values
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
      customer_name: selectedCustomerName, // Use selectedCustomerName
      items: invoiceItems.filter(item => item.description !== ''),
      grand_total: calculateGrandTotal(),
      salesman_name_footer: salesmanName || salesmanEmail || '',
      customer_phone_footer: customerPhone || '', // Use customerPhone state
      invoice_no: invoiceNo || '',
      paid: isPaid,
      due_date: !isPaid ? dueDate : null,
    };

    const { data: userData } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('sales')
      .insert([{ ...data, user_id: userData.user?.id }]);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Generate and download PDF invoice
      try {
        generateSaleInvoicePDF({
          date: data.date,
          customer_name: data.customer_name || '',
          customer_phone: data.customer_phone_footer || '',
          customer_email: customerEmail || '',
          customer_address: customerAddress || '',
          items: data.items,
          grand_total: data.grand_total,
          salesman_name_footer: data.salesman_name_footer || '',
          invoice_no: data.invoice_no,
          company_name: "KTF Vegetable and Fruit",
          company_address: "Umm Salal, Doha, Qatar",
          company_phone: "(+974) 30933327",
          company_email: "ktf.co2025@gmail.com",
          isPaid: data.paid,
          dueDate: data.due_date,
        });
      } catch (pdfError) {
        console.error('Error generating PDF:', pdfError);
        toast({
          title: "Warning",
          description: "Sale saved but PDF generation failed",
          variant: "default",
        });
      }

      toast({
        title: "Success",
        description: "Sale added successfully and invoice downloaded",
      });
      setOpen(false);
      onSaleAdded();
      (e.target as HTMLFormElement).reset();
      setInvoiceItems([{ no: 1, description: '', qty: 0, unitPrice: 0 }]);
      const nextInvoiceNum = await generateNextInvoiceNumber();
      setInvoiceNo(nextInvoiceNum);
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Sale
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Sale</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice_no">Invoice No.</Label>
              <Input
                id="invoice_no"
                name="invoice_no"
                value={invoiceNo || ''}
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
                defaultValue={new Date().toISOString().split('T')[0]}
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
                  <TableHead className="text-right">Amount ($)</TableHead>
                  <TableHead className="text-right">Sum ($)</TableHead>
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
                    <TableCell colSpan={6}> {/* Changed colSpan from 5 to 6 */}
                      <Button type="button" variant="outline" onClick={handleAddItem} className="w-full">
                        Add Item
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={5} className="text-right text-base font-semibold">Grand Total</TableCell> {/* Changed colSpan from 4 to 5 */}
                  <TableCell className="text-right text-base font-semibold">${calculateGrandTotal().toFixed(2)}</TableCell>
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
            {!isPaid && (
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

          <div className="space-y-2">
            <Label htmlFor="salesman_name_footer">Salesman Name</Label>
            <Input
              id="salesman_name_footer"
              name="salesman_name_footer"
              placeholder="Salesman Name"
              value={salesmanName || ''}
              readOnly
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Sale"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}