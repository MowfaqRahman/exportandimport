"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2 } from "lucide-react";
import { Purchase, PurchaseItem } from "@/types/business";
import { createClient } from "../../../supabase/client";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/components/ui/use-toast";

interface AddPurchaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPurchase?: (purchase: Purchase) => void;
  onSuccess?: () => void;
  purchase?: Purchase;
}

interface PurchaseCustomer {
  id: number;
  name: string;
  phone: string | null;
}

export default function AddPurchaseDialog({ isOpen, onClose, onAddPurchase, onSuccess, purchase }: AddPurchaseDialogProps) {
  const [purchaseCustomer, setPurchaseCustomer] = useState("");
  const [supplierPhone, setSupplierPhone] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [purchaseCustomers, setPurchaseCustomers] = useState<PurchaseCustomer[]>([]);
  const [items, setItems] = useState<PurchaseItem[]>([{ no: 1, productName: "", unit: "", qty: 0, price: 0 }]);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [paymentType, setPaymentType] = useState<'Cash' | 'Online' | 'Cheque'>('Cash');
  const [dueDate, setDueDate] = useState<string>("");

  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch categories
      const { data: catData, error: catError } = await supabase
        .from("category")
        .select("id, name")
        .order("name");

      if (catError) {
        console.error("Error fetching categories:", catError);
      } else {
        setCategories(catData || []);
      }

      // Fetch purchase customers
      const { data: custData, error: custError } = await supabase
        .from("purchase_customer")
        .select("id, name, phone")
        .order("name");

      if (custError) {
        console.error("Error fetching purchase customers:", custError);
      } else {
        setPurchaseCustomers(custData || []);
      }
    };

    if (isOpen) {
      fetchData();
      if (purchase) {
        setPurchaseCustomer(purchase.company_name);
        setSupplierPhone(purchase.supplier_phone || "");
        setDate(purchase.date);
        setItems(purchase.items || [{ no: 1, productName: "", unit: "", qty: 0, price: 0 }]);
        setIsPaid(!!purchase.paid);
        setPaymentType(purchase.payment_type as 'Cash' | 'Online' | 'Cheque' || "Cash");
        setDueDate(purchase.due_date || "");
      } else {
        resetForm();
      }
    }
  }, [isOpen, purchase]);

  const handleCustomerChange = (customerName: string) => {
    setPurchaseCustomer(customerName);
    const selected = purchaseCustomers.find(c => c.name === customerName);
    if (selected && selected.phone) {
      setSupplierPhone(selected.phone);
    }
  };

  const handleItemChange = (index: number, field: keyof PurchaseItem, value: any) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleAddItem = () => {
    if (items.length < 20) {
      setItems([...items, { no: items.length + 1, productName: "", unit: "", qty: 0, price: 0 }]);
    }
  };

  const handleDeleteItem = (indexToDelete: number) => {
    const newItems = items.filter((_, index) => index !== indexToDelete);
    const reIndexedItems = newItems.map((item, index) => ({ ...item, no: index + 1 }));
    setItems(reIndexedItems);
  };

  const calculateTotal = (item: PurchaseItem) => {
    return item.qty * item.price;
  };

  const calculateGrandTotal = () => {
    return items.reduce((sum, item) => sum + calculateTotal(item), 0);
  };

  const handleSubmit = async () => {
    if (!purchaseCustomer || !date || items.some(item => !item.productName || item.qty <= 0)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and add at least one valid item.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("User not authenticated.");
      }

      const validItems = items.filter(item => item.productName !== "");
      const grandTotal = calculateGrandTotal();

      const purchaseData = {
        date,
        items: validItems,
        grand_total: grandTotal,
        company_name: purchaseCustomer,
        supplier_phone: supplierPhone,
        paid: isPaid,
        payment_type: isPaid ? paymentType : null,
        due_date: !isPaid ? dueDate : null,
        user_id: user.id,
      };

      if (purchase) {
        const { error: dbError } = await supabase
          .from("purchases")
          .update(purchaseData)
          .eq("id", purchase.id);
        if (dbError) throw dbError;
        toast({ title: "Success", description: "Purchase updated successfully." });
      } else {
        const { error: dbError } = await supabase
          .from("purchases")
          .insert([{ ...purchaseData, id: uuidv4() }]);
        if (dbError) throw dbError;
        toast({ title: "Success", description: "Purchase added successfully." });
      }

      if (onAddPurchase) onAddPurchase({ ...purchaseData, id: purchase?.id || uuidv4() } as Purchase);
      if (onSuccess) onSuccess();
      resetForm();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPurchaseCustomer("");
    setSupplierPhone("");
    setDate(new Date().toISOString().split('T')[0]);
    setItems([{ no: 1, productName: "", unit: "", qty: 0, price: 0 }]);
    setIsPaid(false);
    setPaymentType("Cash");
    setDueDate("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{purchase ? "Edit Purchase" : "Add New Purchase"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchaseCustomer">Purchase Customer *</Label>
              <Select
                value={purchaseCustomer}
                onValueChange={handleCustomerChange}
              >
                <SelectTrigger id="purchaseCustomer" className="w-full">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {purchaseCustomers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.name}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplierPhone">Tel. No.</Label>
              <Input
                id="supplierPhone"
                placeholder="Supplier Phone Number"
                value={supplierPhone}
                onChange={(e) => setSupplierPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">No.</TableHead>
                  <TableHead className="min-w-[250px]">Name of Item</TableHead>
                  <TableHead className="w-[120px]">Unit</TableHead>
                  <TableHead className="w-[120px]">Quantity</TableHead>
                  <TableHead className="text-right w-[150px]">Amount (QAR)</TableHead>
                  <TableHead className="text-right w-[150px]">Sum (QAR)</TableHead>
                  <TableHead className="text-center w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={item.no}>
                    <TableCell>{item.no}</TableCell>
                    <TableCell>
                      <Select
                        value={item.productName}
                        onValueChange={(value) => handleItemChange(index, "productName", value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a product" />
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
                        placeholder="e.g. kg, box"
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        placeholder="0"
                        value={item.qty || ""}
                        onChange={(e) => handleItemChange(index, "qty", parseFloat(e.target.value) || 0)}
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="text-right w-full"
                        value={item.price || ""}
                        onChange={(e) => handleItemChange(index, "price", parseFloat(e.target.value) || 0)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {(item.qty * item.price).toFixed(2)}
                    </TableCell>
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
                {items.length < 20 && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Button type="button" variant="outline" onClick={handleAddItem} className="w-full">
                        <Plus className="mr-2 h-4 w-4" /> Add Item
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={5} className="text-right text-base font-semibold">Grand Total</TableCell>
                  <TableCell className="text-right text-base font-semibold">QAR {calculateGrandTotal().toFixed(2)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Payment Status</Label>
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
                  <Tabs value={paymentType} onValueChange={(v) => setPaymentType(v as 'Cash' | 'Online' | 'Cheque')} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="Cash">Cash</TabsTrigger>
                      <TabsTrigger value="Online">Online</TabsTrigger>
                      <TabsTrigger value="Cheque">Cheque</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 pt-4">
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : (purchase ? "Update Purchase" : "Add Purchase")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
