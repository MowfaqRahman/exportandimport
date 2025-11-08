import jsPDF from 'jspdf';
import { InvoiceItem } from '@/types/business';

interface InvoiceData {
  date: string;
  customer_name: string;
  items: InvoiceItem[];
  grand_total: number;
  invoice_no: string;
  salesman_name_footer?: string;
  customer_phone_footer?: string;
}

export function generateInvoicePDF(invoiceData: InvoiceData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Date and Customer Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${formatDate(invoiceData.date)}`, margin, yPosition);
  yPosition += 8;
  
  if (invoiceData.customer_name) {
    doc.text(`Customer: ${invoiceData.customer_name}`, margin, yPosition);
    yPosition += 8;
  }

  yPosition += 5;

  // Table Header
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  const tableStartY = yPosition;
  const colWidths = {
    no: 15,
    description: 90,
    quantity: 25,
    amount: 25,
    total: 25
  };
  const colX = {
    no: margin,
    description: margin + colWidths.no,
    quantity: margin + colWidths.no + colWidths.description,
    amount: margin + colWidths.no + colWidths.description + colWidths.quantity,
    total: margin + colWidths.no + colWidths.description + colWidths.quantity + colWidths.amount
  };

  // Draw table header
  doc.text('No.', colX.no, yPosition);
  doc.text('Name of Item', colX.description, yPosition);
  doc.text('Qty.', colX.quantity, yPosition);
  doc.text('Amount ($)', colX.amount, yPosition);
  doc.text('Sum ($)', colX.total, yPosition);

  // Draw header line
  yPosition += 5;
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 5;

  // Table Body
  doc.setFont('helvetica', 'normal');
  invoiceData.items.forEach((item, index) => {
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }

    const itemTotal = (item.qty || 0) * (item.unitPrice || 0);
    const itemNumber = index + 1; // Renumber items sequentially
    
    doc.text(String(itemNumber), colX.no, yPosition);
    doc.text(item.description || '', colX.description, yPosition);
    doc.text(String(item.qty || 0), colX.quantity, yPosition);
    doc.text(`$${(item.unitPrice || 0).toFixed(2)}`, colX.amount, yPosition);
    doc.text(`$${itemTotal.toFixed(2)}`, colX.total, yPosition);
    
    yPosition += 7;
  });

  // Draw footer line
  if (yPosition < pageHeight - 50) {
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;

    // Grand Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Grand Total:', colX.amount, yPosition);
    doc.text(`$${invoiceData.grand_total.toFixed(2)}`, colX.total, yPosition);
    yPosition += 15;
  } else {
    doc.addPage();
    yPosition = margin;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Grand Total:', colX.amount, yPosition);
    doc.text(`$${invoiceData.grand_total.toFixed(2)}`, colX.total, yPosition);
    yPosition += 15;
  }

  // Footer Information
  if (invoiceData.salesman_name_footer || invoiceData.customer_phone_footer) {
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    if (invoiceData.salesman_name_footer) {
      doc.text(`Salesman: ${invoiceData.salesman_name_footer}`, margin, yPosition);
      yPosition += 7;
    }
    
    if (invoiceData.customer_phone_footer) {
      doc.text(`Tel. No.: ${invoiceData.customer_phone_footer}`, margin, yPosition);
    }
  }

  // Generate filename
  const formattedDate = formatDate(invoiceData.date).replace(/\//g, '-');
  const customerName = invoiceData.customer_name 
    ? invoiceData.customer_name.replace(/[^a-z0-9]/gi, '_').substring(0, 20)
    : 'Invoice';
  const filename = `Invoice_${invoiceData.invoice_no}_${customerName}_${formattedDate}.pdf`;

  // Save the PDF
  doc.save(filename);
}

