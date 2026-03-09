
'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { jsPDF } from 'jspdf';
import logo from '@/assets/logowithqt.png'; // Import the new logo image

interface CustomerStatementTabProps {
  customers: { customer_id: number | string; customer_name: string; phone_number?: string; email?: string; address?: string; company_name?: string }[];
  selectedUser: string;
  setSelectedUser: (user: string) => void;
  loadingCustomers: boolean;
  loadingCustomerStatements: boolean;
  customerStatements: any[];
  formatDate: (dateString: string) => string;
  selectedYear: string;
  selectedMonth: string;
  startDate: string;
  endDate: string;
  onPaymentStatusChange: (invoiceId: string, newStatus: boolean) => void;
  onPaymentMethodChange?: (invoiceId: string, method: string) => void;
  onPaidAmountChange?: (invoiceId: string, amount: number) => void;
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
  startDate,
  endDate,
  onPaymentStatusChange,
  onPaymentMethodChange,
  onPaidAmountChange
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
    const rangeSuffix = selectedYear === "custom"
      ? `${startDate}_to_${endDate}`
      : `${selectedYear}${selectedMonth === "all" ? "" : `-${selectedMonth}`}`;
    const fileName = `${customerName}_Statement_${rangeSuffix}.pdf`;

    const doc = new jsPDF();

    // Colors — same palette as generateSaleInvoicePDF
    const lightGray  = "#F5F5F5";
    const mediumGray = "#E0E0E0";
    const darkGray   = "#333333";
    const accentGreen     = "#6AA84F";
    const tableHeaderGreen = "#D9EAD3";

    // ── HEADER: same slanted design as Invoice ────────────────────────────────
    // Light gray base
    doc.setFillColor(lightGray);
    doc.rect(0, 0, 210, 50, 'F');

    // Left slant — medium gray
    doc.setFillColor(mediumGray);
    doc.triangle(0, 0, 120, 0, 0, 50, 'F');

    // Right slant — light green (lighter than accentGreen)
    doc.setFillColor("#C8E6B8");
    doc.triangle(210, 0, 210, 50, 160, 50, 'F');

    // Company info — dark gray text, left side
    doc.setTextColor(darkGray);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text("KTF Vegetable and Fruit", 20, 18);
    doc.text("Tel: (+974) 30933327", 20, 24);
    doc.text("Email: ktf.co2025@gmail.com", 20, 30);
    doc.text("Address: Umm Salal, Doha, Qatar", 20, 36);

    // Logo — top-right, increased size
    doc.addImage(logo.src, "PNG", 155, 2, 54, 48);

    // Title — "CUSTOMER STATEMENT" bold centered, light green color
    doc.setTextColor(accentGreen);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text("CUSTOMER STATEMENT", 105, 47, { align: "center" });
    doc.setFont('helvetica', 'normal');

    // ── DOCUMENT DATE (right) & TO SECTION (left) ────────────────────────────
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Date: ${formatDate(new Date().toISOString().split('T')[0])}`, 195, 62, { align: "right" });

    doc.setFont('helvetica', 'bold');
    doc.text("TO:", 20, 62);
    doc.setFont('helvetica', 'normal');
    doc.text(`${selectedCustomer?.customer_name || ""}`, 20, 68);
    let detailYPos = 73;
    if (selectedCustomer?.company_name) {
      doc.text(selectedCustomer.company_name, 20, detailYPos);
      detailYPos += 5;
    }
    if (selectedCustomer?.address) {
      doc.text(selectedCustomer.address, 20, detailYPos);
      detailYPos += 5;
    }
    if (selectedCustomer?.email) {
      doc.text(`Email: ${selectedCustomer.email}`, 20, detailYPos);
      detailYPos += 5;
    }
    if (selectedCustomer?.phone_number) {
      doc.text(`Tel. No: ${selectedCustomer.phone_number}`, 20, detailYPos);
    }

    // Table Headers
    let yPos = 100;
    // Table Headers
    doc.setFillColor(tableHeaderGreen); // Light green background for table headers
    doc.rect(15, yPos - 5, 180, 7, 'F'); // Draw rectangle for header background
    doc.setTextColor(0, 0, 0); // Black text for table headers
    doc.setFontSize(10);
    doc.text("DATE", 20, yPos);
    doc.text("ACTIVITY", 60, yPos);
    doc.text("AMOUNT", 130, yPos, { align: "right" });
    doc.text("METHOD", 165, yPos, { align: "right" });
    doc.text("RECEIVED", 195, yPos, { align: "right" });

    // Table Rows
    doc.setTextColor(0, 0, 0); // Black text for table rows
    yPos += 7; // Adjust for header height

    // Sort statements by date in ascending order (oldest to newest)
    const sortedStatements = [...customerStatements].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedStatements.forEach((statement) => {
      const received = Number(statement.paid_amount || 0);
      const method = (statement.type === "Sale" && statement.paid) ? (statement.payment_type || "Cash") : "-";
      doc.text(formatDate(statement.date), 20, yPos);
      doc.text(statement.description, 60, yPos);
      doc.text(Number(statement.amount).toFixed(2), 130, yPos, { align: "right" });
      doc.text(method, 165, yPos, { align: "right" });
      doc.text(received.toFixed(2), 195, yPos, { align: "right" });
      yPos += 5;
    });

    // Totals
    yPos += 10; // Space after table
    const totalAmount = customerStatements.reduce((sum, statement) => sum + Number(statement.amount || 0), 0);
    const totalReceived = customerStatements.reduce((sum, statement) => {
      return sum + Number(statement.paid_amount || 0);
    }, 0);
    const balanceAmount = totalAmount - totalReceived;

    doc.setTextColor(0, 0, 0); // Black text for totals
    doc.setFontSize(10);
    doc.text("TOTAL", 110, yPos, { align: "right" });
    doc.text("TOTAL", 155, yPos, { align: "right" });
    doc.text("BALANCE", 195, yPos, { align: "right" });
    yPos += 5;
    doc.text("AMOUNT", 110, yPos, { align: "right" });
    doc.text("RECEIVED", 155, yPos, { align: "right" });
    doc.text("AMOUNT", 195, yPos, { align: "right" });
    yPos += 5;
    doc.text(`QAR ${totalAmount.toFixed(2)}`, 110, yPos, { align: "right" });
    doc.text(`QAR ${totalReceived.toFixed(2)}`, 155, yPos, { align: "right" });
    doc.text(`QAR ${balanceAmount.toFixed(2)}`, 195, yPos, { align: "right" });

    // Terms Footer - inside a light gray box
    const termsYStart = doc.internal.pageSize.height - 30;
    // Light gray box for terms
    doc.setFillColor(242, 242, 242);
    doc.rect(15, termsYStart - 5, 180, 22, 'F');

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text("TERMS:", 20, termsYStart);
    doc.setFont('helvetica', 'normal');
    doc.text("All Payments to be made in favour of \"KTF Vegetable and Fruit\"", 20, termsYStart + 5);
    doc.text("OR by Bank Transfer as per Purchase & Sales Agreement", 20, termsYStart + 10);

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
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead className="text-right">Received</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingCustomerStatements ? (
                <TableRow><TableCell colSpan={6} className="text-center">Loading statements...</TableCell></TableRow>
              ) : customerStatements.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center">No statements found for this customer.</TableCell></TableRow>
              ) : (
                customerStatements.map((statement, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{statement.description}</TableCell>
                    <TableCell>{formatDate(statement.date)}</TableCell>
                    <TableCell>{statement.type}</TableCell>
                    <TableCell>
                      {statement.type === "Sale" ? (
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={statement.paid}
                            onCheckedChange={(checked) => onPaymentStatusChange(statement.invoice_id, checked)}
                          />
                          {statement.paid ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">Paid</span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">Unpaid</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {statement.type === "Sale" ? (
                        <div className="flex flex-col gap-1">
                          {statement.paid ? (
                            <Tabs value={statement.payment_type || "Cash"} onValueChange={(val) => onPaymentMethodChange?.(statement.invoice_id, val)}>
                              <TabsList className="h-8">
                                <TabsTrigger value="Cash" className="text-xs px-2 h-6">Cash</TabsTrigger>
                                <TabsTrigger value="Online" className="text-xs px-2 h-6">Online</TabsTrigger>
                                <TabsTrigger value="Cheque" className="text-xs px-2 h-6">Cheque</TabsTrigger>
                              </TabsList>
                            </Tabs>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {statement.type === "Sale" ? (
                        statement.paid ? (
                          <div className="flex justify-end">
                            <Input
                              type="number"
                              className="w-24 text-right h-8"
                              defaultValue={Number(statement.paid_amount || 0).toFixed(2)}
                              onBlur={(e) => {
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val)) {
                                  onPaidAmountChange?.(statement.invoice_id, val);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  (e.target as HTMLInputElement).blur();
                                }
                              }}
                            />
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )
                      ) : (
                        <span className="font-medium text-green-600">QAR {Number(statement.paid_amount || 0).toFixed(2)}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">QAR {Number(statement.amount).toFixed(2)}</TableCell>
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
