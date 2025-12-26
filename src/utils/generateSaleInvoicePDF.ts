import { jsPDF } from 'jspdf';
import logo from '@/assets/logowithqt.png';
import headerBg from '@/assets/header_bg_grid.png';

interface InvoiceItem {
  no: number;
  description: string;
  qty: number;
  unitPrice: number;
}

interface GenerateSaleInvoicePDFProps {
  date: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  customer_address?: string;
  items: InvoiceItem[];
  grand_total: number;
  salesman_name_footer: string;
  invoice_no: string;
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  isPaid: boolean;
  dueDate: string | null;
  disclaimer?: string;
}

export const generateSaleInvoicePDF = ({
  date,
  customer_name,
  customer_phone,
  customer_email,
  customer_address,
  items,
  grand_total,
  salesman_name_footer,
  invoice_no,
  company_name,
  company_address,
  company_phone,
  company_email,
  isPaid,
  dueDate,
  disclaimer,
}: GenerateSaleInvoicePDFProps) => {
  const doc = new jsPDF();

  const primaryColor = "#6AA84F"; // Green for "Statement" and lines
  const secondaryColor = "#D9EAD3"; // Light green for table headers

  // Company Header Background
  try {
    doc.addImage(headerBg.src, "PNG", 0, 0, 210, 50); 
  } catch (e) {
    console.error("Failed to load header background image", e);
    // Fallback if image fails to load
    doc.setFillColor(15, 30, 15); // Dark forest green fallback
    doc.rect(0, 0, 210, 50, 'F');
  }

  // Company Header Text
  doc.setTextColor(255, 255, 255); // White text for visibility on dark background
  doc.setFontSize(10);
  doc.text(company_name, 20, 20);
  doc.text(`Tel: ${company_phone}`, 20, 25);
  doc.text(`Email: ${company_email}`, 20, 30);
  doc.text(`Address: ${company_address}`, 20, 35);
  doc.addImage(logo.src, "PNG", 160, 5, 40, 40); // 1:1 ratio, vertically centered

  // Invoice Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text("INVOICE", 105, 45, { align: "center" });
  doc.setFont('helvetica', 'normal');

  // Reset text color to black for the rest of the document
  doc.setTextColor(0, 0, 0);

  // Invoice Details
  doc.setFontSize(10);
  doc.text(`Invoice No: ${invoice_no}`, 180, 60, { align: "right" });
  doc.text(`Invoice Date: ${date}`, 180, 65, { align: "right" });
  if (!isPaid && dueDate) {
    doc.text(`Due Date: ${dueDate}`, 180, 70, { align: "right" });
  }

  // Customer Details
  doc.text("Bill To:", 20, 70);
  doc.text(customer_name || '', 20, 75);
  if (customer_address) {
    doc.text(customer_address, 20, 80);
  }
  if (customer_phone) {
    doc.text(`Phone: ${customer_phone}`, 20, 85);
  }
  if (customer_email) {
    doc.text(`Email: ${customer_email}`, 20, 90);
  }

  // Table Headers
  let yPos = 100;
  doc.setFillColor(secondaryColor);
  doc.rect(15, yPos - 5, 180, 7, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text("No.", 20, yPos);
  doc.text("Name of Item", 40, yPos);
  doc.text("Quantity", 110, yPos, { align: "right" });
  doc.text("Amount (QAR)", 145, yPos, { align: "right" });
  doc.text("Sum (QAR)", 180, yPos, { align: "right" });

  // Table Rows
  doc.setTextColor(0, 0, 0);
  yPos += 7;
  items.forEach((item) => {
    doc.text(String(item.no), 20, yPos);
    doc.text(item.description, 40, yPos);
    doc.text(String(item.qty), 110, yPos, { align: "right" });
    doc.text(item.unitPrice.toFixed(2), 145, yPos, { align: "right" });
    doc.text((item.qty * item.unitPrice).toFixed(2), 180, yPos, { align: "right" });
    yPos += 5;
  });

  // Grand Total
  yPos += 10;
  doc.setFontSize(12);
  doc.text("GRAND TOTAL:", 140, yPos, { align: "right" });
  doc.text(`QAR ${grand_total.toFixed(2)}`, 180, yPos, { align: "right" });

  // Terms and Conditions / Payment Status
  const footerYStart = doc.internal.pageSize.height - 50;
  yPos = footerYStart;

  // Footer Background (Classy Light Gray)
  doc.setFillColor(242, 242, 242);
  doc.rect(15, footerYStart - 7, 180, 42, 'F');

  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);

  if (!isPaid) {
    doc.text("Terms and Conditions:", 20, yPos);
    yPos += 5;

    if (dueDate) {
      const invoiceDate = new Date(date);
      const due = new Date(dueDate);
      const diffTime = Math.abs(due.getTime() - invoiceDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      doc.text(`Payment is due in ${diffDays} days.`, 20, yPos);
    } else {
      doc.text("Payment terms: To be discussed.", 20, yPos); // Fallback if no due date
    }
    yPos += 4;
    doc.text(`Please make cheque payable to: ${company_name}`, 20, yPos);
  } else {
    doc.text(`Payment received in full on ${date}.`, 20, yPos);
    yPos += 4;
    doc.text("No further payment is required.", 20, yPos);
  }

  // Disclaimer (Aligned on right side of payment status, above salesman)
  if (disclaimer) {
    doc.setFont('helvetica', 'bold');
    doc.text("Disclaimer :", 180, footerYStart, { align: "right" });
    doc.setFont('helvetica', 'normal');
    const disclaimerLines = doc.splitTextToSize(disclaimer, 60);
    doc.text(disclaimerLines, 180, footerYStart + 5, { align: "right" });
  }

  // Salesman Name Footer
  doc.text(`Salesman: ${salesman_name_footer}`, 180, doc.internal.pageSize.height - 20, { align: "right" });

  doc.save(`invoice_${invoice_no}.pdf`);
};
