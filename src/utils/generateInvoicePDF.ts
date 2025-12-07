
import jsPDF from "jspdf";
import type { InvoiceItem } from "@/types/business";
import logo from "@/assets/logo.png"; // Import the logo image

interface InvoiceData {
  company_name: string;
  company_address: string;
  company_logo_url?: string;
  date: string;
  customer_name: string;
  items: InvoiceItem[];
  grand_total: number;
  invoice_no: string;
  due_date?: string;
  salesman_name_footer?: string;
  customer_phone_footer?: string;
  customer_email?: string;
  customer_address?: string;
}

const COLORS = {
  emerald900: [6, 78, 59] as [number, number, number], // #064e3b - Dark green left header
  emerald800: [6, 95, 70] as [number, number, number], // #065f46 - Dark green gradient
  emerald700: [4, 120, 87] as [number, number, number], // #047857 - Table header
  emerald600: [5, 150, 105] as [number, number, number], // #059669 - Accent
  emerald300: [110, 231, 183] as [number, number, number], // #6ee7b7 - Mint green
  emerald50: [236, 253, 245] as [number, number, number], // #ecfdf5 - Light green background
  teal500: [20, 184, 166] as [number, number, number], // #14b8a6 - Teal gradient
  teal400: [45, 212, 191] as [number, number, number], // #2dd4bf - Teal accent
  darkText: [33, 33, 33] as [number, number, number], // #212121 - Dark text
  gray600: [75, 85, 99] as [number, number, number], // #4b5563 - Gray text
  gray700: [55, 65, 81] as [number, number, number], // #374151 - Darker gray
  gray900: [17, 24, 39] as [number, number, number], // #111827 - Very dark gray
  white: [255, 255, 255] as [number, number, number], // White
};

export async function generateInvoicePDF(invoiceData: InvoiceData): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const calculateDueDate = (invoiceDateString: string) => {
    const invoiceDate = new Date(invoiceDateString);
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(invoiceDate.getDate() + 7);
    return dueDate.toISOString().split("T")[0];
  };

  // Calculate due date if not provided
  const finalInvoiceData = {
    ...invoiceData,
    company_name: invoiceData.company_name || "",
    company_address: invoiceData.company_address || "",
    due_date: invoiceData.due_date || calculateDueDate(invoiceData.date),
  };

  // Header Section - Split design with dark green left and mint green right
  const headerHeight = 45;
  
  // Dark green left section (emerald-900)
  doc.setFillColor(...COLORS.emerald900);
  doc.rect(0, 0, pageWidth / 2, headerHeight, "F");
  
  // Mint green right section (teal-400 to emerald-300 gradient effect)
  doc.setFillColor(...COLORS.teal400);
  doc.rect(pageWidth / 2, 0, pageWidth / 2, headerHeight, "F");

  // Company Info (Top Left) with white text on dark green
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.white);
  // doc.text("LOGO", margin, 12); // Commented out the text logo
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(finalInvoiceData.company_name, margin, 22);
  
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("KTF Vegetable and Fruit", margin, 28);

  // Company Logo (Top Left, if provided)
  // if (finalInvoiceData.company_logo_url) {
    try {
      // Use the imported logo directly
      const imgWidth = 20;
      const imgHeight = 12;
      doc.addImage(logo.src, "PNG", margin, 8, imgWidth, imgHeight);
    } catch (error) {
      console.error("Error loading company logo:", error);
    }
  // }

  // Large "INVOICE" text on right side
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text("INVOICE", pageWidth - margin, headerHeight / 2 + 5, { align: "right" });

  // Main Content Area
  let currentY = headerHeight + 50; // Significantly increased initial buffer for maximum space from header

  // Invoice Details Grid - Left: Invoice To, Right: Invoice Number and Date
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.gray600);
  doc.text("Invoice to:", margin, currentY);
  let leftColumnCurrentY = currentY; // Track left column's Y position
  let rightColumnCurrentY = currentY; // Track right column's Y position

  // Left Column Content tracking its own final Y
  leftColumnCurrentY += 7; // After 'Invoice to:' label (font size 8)
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.gray900);
  doc.text(finalInvoiceData.customer_name, margin, leftColumnCurrentY);
  leftColumnCurrentY += 10; // Space for customer name (font size 14)

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.gray600);

  if (finalInvoiceData.customer_phone_footer) {
    leftColumnCurrentY += 5; // Consistent gap before first contact detail
    doc.text(`Phone: ${finalInvoiceData.customer_phone_footer}`, margin, leftColumnCurrentY);
    leftColumnCurrentY += 7; // Consistent line height/gap
  }
  if (finalInvoiceData.customer_email) {
    leftColumnCurrentY += 5; // Consistent gap between contact details
    doc.text(`Email: ${finalInvoiceData.customer_email}`, margin, leftColumnCurrentY);
    leftColumnCurrentY += 7; // Consistent line height/gap
  }
  if (finalInvoiceData.customer_address) {
    leftColumnCurrentY += 5; // Consistent gap between contact details
    doc.text(`Address: ${finalInvoiceData.customer_address}`, margin, leftColumnCurrentY);
    leftColumnCurrentY += 7; // Consistent line height/gap
  }

  // Right Column Content tracking its own final Y
  // 'Invoice No:' and its value
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.gray900);
  const rightX = pageWidth - margin;
  doc.text("Invoice No:", rightX, rightColumnCurrentY, { align: "right" });
  rightColumnCurrentY += 6; // After label, adjusted
  doc.setFont("helvetica", "normal");
  doc.text(finalInvoiceData.invoice_no, rightX, rightColumnCurrentY, { align: "right" });
  rightColumnCurrentY += 8; // After value, adjusted

  // 'Invoice Date:' and its value
  doc.setFont("helvetica", "bold");
  doc.text("Invoice Date:", rightX, rightColumnCurrentY, { align: "right" });
  rightColumnCurrentY += 6; // After label, adjusted
  doc.setFont("helvetica", "normal");
  doc.text(formatDate(finalInvoiceData.date), rightX, rightColumnCurrentY, { align: "right" });
  rightColumnCurrentY += 8; // After value, adjusted

  // 'Due Date:' and its value
  doc.setFont("helvetica", "bold");
  doc.text("Due Date:", rightX, rightColumnCurrentY, { align: "right" });
  rightColumnCurrentY += 6; // After label, adjusted
  doc.setFont("helvetica", "normal");
  doc.text(formatDate(finalInvoiceData.due_date), rightX, rightColumnCurrentY, { align: "right" });
  rightColumnCurrentY += 8; // After value, adjusted

  // Set currentY for the next section (Table Header) based on the lowest point of both columns
  currentY = Math.max(leftColumnCurrentY, rightColumnCurrentY) + 15; // Consistent buffer

  // Table Header - Emerald-700 background
  doc.setFillColor(...COLORS.emerald700);
  doc.rect(margin, currentY - 8, pageWidth - 2 * margin, 10, "F");
  
  const colWidths = {
    sl: 15,
    description: 90,
    price: 30,
    qty: 25,
    total: 30,
  };
  const colX = {
    sl: margin + 3,
    description: margin + colWidths.sl + 3,
    price: margin + colWidths.sl + colWidths.description + 3,
    qty: margin + colWidths.sl + colWidths.description + colWidths.price + 3,
    total: margin + colWidths.sl + colWidths.description + colWidths.price + colWidths.qty + 3,
  };

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text("SL.", colX.sl, currentY);
  doc.text("Item Description", colX.description, currentY);
  doc.text("Price", colX.price, currentY, { align: "right" });
  doc.text("Qty.", colX.qty, currentY, { align: "center" });
  doc.text("Total", colX.total, currentY, { align: "right" });

  yPosition = currentY + 8;

  // Table Body - Alternating row colors
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  finalInvoiceData.items.forEach((item, index) => {
    if (yPosition > pageHeight - 80) {
      doc.addPage();
      yPosition = margin + 10;
    }

    // Alternating row colors - emerald-50 for even, white for odd
    if (index % 2 === 0) {
      doc.setFillColor(...COLORS.emerald50);
      doc.rect(margin, yPosition - 5, pageWidth - 2 * margin, 7, "F");
    }

    const itemTotal = (item.qty || 0) * (item.unitPrice || 0);
    const itemNumber = index + 1;

    doc.setTextColor(...COLORS.gray700);
    doc.text(String(itemNumber), colX.sl, yPosition);
    doc.text(item.description || "", colX.description, yPosition);
    doc.text(`$${(item.unitPrice || 0).toFixed(2)}`, colX.price, yPosition, { align: "right" });
    doc.text(String(item.qty || 0), colX.qty, yPosition, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.text(`$${itemTotal.toFixed(2)}`, colX.total, yPosition, { align: "right" });
    doc.setFont("helvetica", "normal");

    yPosition += 7;
  });

  yPosition += 10;

  // Bottom Section - Two columns
  const leftColX = margin;
  const rightColX = pageWidth / 2 + 10;
  const bottomSectionY = yPosition;

  // Left Column - Payment Info and Terms & Conditions
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.gray900);
  doc.text("Terms & Conditions", leftColX, bottomSectionY + 36);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.gray600);
  doc.text("Payment is due in 7 days", leftColX, bottomSectionY + 43);
  doc.text(`Please make checks payable to: ${finalInvoiceData.company_name}`, leftColX, bottomSectionY + 49);

  // Right Column - Totals Box (emerald-50 with border)
  const totalsBoxWidth = pageWidth - rightColX - margin;
  const totalsBoxHeight = 35; // Reduced height
  
  doc.setFillColor(...COLORS.emerald50);
  doc.setDrawColor(...COLORS.emerald600);
  doc.setLineWidth(1);
  doc.roundedRect(rightColX, bottomSectionY - 5, totalsBoxWidth, totalsBoxHeight, 2, 2, "FD");

  const subTotal = finalInvoiceData.items.reduce((sum, item) => {
    return sum + ((item.qty || 0) * (item.unitPrice || 0));
  }, 0);
  const tax = 0;
  const grandTotal = Number(finalInvoiceData.grand_total) || subTotal + tax;

  doc.setFontSize(11);
  doc.setTextColor(...COLORS.emerald900);
  doc.text("Total:", rightColX + 5, bottomSectionY + 10);
  doc.text(`$${grandTotal.toFixed(2)}`, rightColX + totalsBoxWidth - 5, bottomSectionY + 10, { align: "right" });

  // Authorised Sign section
  doc.setDrawColor(...COLORS.gray600);
  doc.setLineWidth(0.5);
  doc.line(rightColX, bottomSectionY + 18, rightColX + totalsBoxWidth, bottomSectionY + 18);
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.gray600);
  doc.text("_______________", rightColX + totalsBoxWidth / 2, bottomSectionY + 28, { align: "center" });
  doc.text("Authorised Sign", rightColX + totalsBoxWidth / 2, bottomSectionY + 33, { align: "center" });

  // Footer - Gradient green sections
  const footerY = pageHeight - 25;
  const footerHeight = 25;
  
  // Three sections: emerald-900, emerald-600 to teal-500, teal-500 to emerald-300
  const footerSectionWidth = pageWidth / 3;
  
  doc.setFillColor(...COLORS.emerald900);
  doc.rect(0, footerY, footerSectionWidth, footerHeight, "F");
  
  doc.setFillColor(...COLORS.emerald600);
  doc.rect(footerSectionWidth, footerY, footerSectionWidth, footerHeight, "F");
  
  doc.setFillColor(...COLORS.teal500);
  doc.rect(footerSectionWidth * 2, footerY, footerSectionWidth, footerHeight, "F");

  // Footer text
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...COLORS.white);
  doc.text("Thank you for your business", pageWidth / 2, footerY + footerHeight / 2 + 3, { align: "center" });

  // Salesman and phone footer info (if provided)
  if (finalInvoiceData.salesman_name_footer) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.gray600);
    doc.text(`Salesman: ${finalInvoiceData.salesman_name_footer}`, leftColX, bottomSectionY + 60);
  }

  const formattedDate = formatDate(finalInvoiceData.date).replace(/\//g, "-");
  const customerName = finalInvoiceData.customer_name
    ? finalInvoiceData.customer_name.replace(/[^a-z0-9]/gi, "_").substring(0, 20)
    : "Invoice";
  const filename = `Invoice_${finalInvoiceData.invoice_no}_${customerName}_${formattedDate}.pdf`;

  // Save the PDF
  doc.save(filename);
}
