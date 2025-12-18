
'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { jsPDF } from 'jspdf';
import logo from '@/assets/logo.png'; // Import the logo image

interface CustomerStatementTabProps {
  customers: { customer_id: number | string; customer_name: string; phone_number?: string; email?: string; address?: string }[];
  selectedUser: string;
  setSelectedUser: (user: string) => void;
  loadingCustomers: boolean;
  loadingCustomerStatements: boolean;
  customerStatements: any[];
  formatDate: (dateString: string) => string;
  selectedYear: string;
  selectedMonth: string;
  onPaymentStatusChange: (invoiceId: string, newStatus: boolean) => void;
}

export function CustomerStatementTab({
  customers,
  selectedUser,
  setSelectedUser,
  loadingCustomers,
  loadingCustomerStatements,
  customerStatements,
  formatDate,
  selectedYear,
  selectedMonth,
  onPaymentStatusChange
}: CustomerStatementTabProps) {
  const { toast } = useToast();

  const handleDownloadStatement = () => {
    if (customerStatements.length === 0) {
      toast({
        title: "No data to download",
        description: "There are no customer statements to download.",
        variant: "destructive",
      });
      return;
    }

    const selectedCustomer = customers.find(c => c.customer_id === Number(selectedUser));
    const customerName = selectedCustomer ? selectedCustomer.customer_name : "Customer";
    const fileName = `${customerName}_Statement_${selectedYear}${selectedMonth === "all" ? "" : `-${selectedMonth}`}.pdf`;

    const doc = new jsPDF();

    // Define colors
    const statementGreen = "#6AA84F"; // Green for "Statement"
    const tableHeaderGreen = "#D9EAD3"; // Light green for table headers

    // Company Header
    doc.setFontSize(10);
    doc.text("KTF Vegetable and Fruit", 20, 20);
    doc.text("Tel: (+974) 30933327", 20, 25);
    doc.text("Email: ktf.co2025@gmail.com", 20, 30);
    doc.text("Address: Umm Salal, Doha, Qatar", 20, 35);
    doc.addImage(logo.src, "PNG", 140, 5, 50, 30); // Adjust logo position to top right

    // Statement Title
    doc.setTextColor(statementGreen);
    doc.setFontSize(18);
    doc.text("Statement", 20, 50);

    // TO section
    doc.setTextColor(0, 0, 0); // Black text for TO section
    doc.setFontSize(10);
    doc.text("TO", 20, 70);
    doc.text(`${selectedCustomer?.customer_name || ""}`, 20, 75);
    doc.text(`${selectedCustomer?.address || ""}`, 20, 80);
    doc.text(`Phone: ${selectedCustomer?.phone_number || ""}`, 20, 85);

    // Statement Details (right side)
    doc.setTextColor(0, 0, 0); // Black text for Statement Details
    doc.setFontSize(10);
    doc.text(`DATE ${formatDate(new Date().toISOString().split('T')[0])}`, 150, 80);

    // Table Headers
    let yPos = 100;
    // Table Headers
    doc.setFillColor(tableHeaderGreen); // Light green background for table headers
    doc.rect(15, yPos - 5, 180, 7, 'F'); // Draw rectangle for header background
    doc.setTextColor(0, 0, 0); // Black text for table headers
    doc.setFontSize(10);
    doc.text("DATE", 20, yPos);
    doc.text("ACTIVITY", 60, yPos);
    doc.text("AMOUNT", 140, yPos, { align: "right" });
    doc.text("RECEIVED", 180, yPos, { align: "right" });

    // Table Rows
    doc.setTextColor(0, 0, 0); // Black text for table rows
    yPos += 7; // Adjust for header height
    customerStatements.forEach((statement) => {
      const received = (statement.type === "Sale" && statement.paid) ? Number(statement.amount) : 0;
      doc.text(formatDate(statement.date), 20, yPos);
      doc.text(statement.description, 60, yPos);
      doc.text(Number(statement.amount).toFixed(2), 140, yPos, { align: "right" });
      doc.text(received.toFixed(2), 180, yPos, { align: "right" });
      yPos += 5;
    });

    // Totals
    yPos += 10; // Space after table
    const totalAmount = customerStatements.reduce((sum, statement) => sum + Number(statement.amount || 0), 0);
    const totalReceived = customerStatements.reduce((sum, statement) => {
      return sum + ((statement.type === "Sale" && statement.paid) ? Number(statement.amount) : 0);
    }, 0);

    doc.setTextColor(0, 0, 0); // Black text for totals
    doc.setFontSize(10);
    doc.text("TOTAL", 140, yPos, { align: "right" });
    doc.text("TOTAL", 180, yPos, { align: "right" });
    yPos += 5;
    doc.text("AMOUNT", 140, yPos, { align: "right" });
    doc.text("RECEIVED", 180, yPos, { align: "right" });
    yPos += 5;
    doc.text(`QR${totalAmount.toFixed(2)}`, 140, yPos, { align: "right" });
    doc.text(`QR${totalReceived.toFixed(2)}`, 180, yPos, { align: "right" });

    // Terms Footer
    // Calculate yPos for the very bottom
    yPos = doc.internal.pageSize.height - 30; // 30 units from the bottom of the page
    doc.setTextColor(0, 0, 0); // Black text for footer
    doc.setFontSize(8);
    doc.text("TERMS:", 20, yPos);
    yPos += 5;
    doc.text("All Payments to be made in favour of \"KTF Vegetable and Fruit\"", 20, yPos);
    yPos += 4;
    doc.text("OR by Bank Transfer as per Purchase & Sales Agreement", 20, yPos);

    // Save the PDF
    doc.save(fileName);

    toast({
      title: "Download Initiated",
      description: "Customer statement is being downloaded in PDF format.",
    });
  };

  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Customer Statement</h2>
        <Button onClick={handleDownloadStatement}>Download Statement</Button>
      </div>
      {/* Customer selection dropdown */}
      <div className="mb-4">
        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Select Customer" />
          </SelectTrigger>
          <SelectContent>
            {loadingCustomers ? (
              <SelectItem value="loading" disabled>Loading customers...</SelectItem>
            ) : (
              customers.filter(customer => customer.customer_id !== "all").map((customer) => (
                <SelectItem key={customer.customer_id} value={String(customer.customer_id)}>
                  {customer.customer_name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {selectedUser && selectedUser !== "all" && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-4">Statement for {customers.find(c => c.customer_id === Number(selectedUser))?.customer_name}</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingCustomerStatements ? (
                <TableRow><TableCell colSpan={5} className="text-center">Loading statements...</TableCell></TableRow>
              ) : customerStatements.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center">No statements found for this customer.</TableCell></TableRow>
              ) : (
                customerStatements.map((statement, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatDate(statement.date)}</TableCell>
                    <TableCell>{statement.type}</TableCell>
                    <TableCell>{statement.description}</TableCell>
                    <TableCell>
                      {statement.type === "Sale" ? (
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={statement.paid}
                            onCheckedChange={(checked) => onPaymentStatusChange(statement.invoice_id, checked)}
                          />
                          <span className="text-sm text-gray-500">{statement.paid ? "Paid" : "Unpaid"}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">${Number(statement.amount).toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
