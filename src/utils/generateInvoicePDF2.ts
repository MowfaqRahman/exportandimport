import jsPDF from 'jspdf';
import { InvoiceItem } from '@/types/business';

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
}

export async function generateInvoicePDF(invoiceData: InvoiceData): Promise<void> {
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

  const calculateDueDate = (invoiceDateString: string) => {
    const invoiceDate = new Date(invoiceDateString);
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(invoiceDate.getDate() + 7);
    return dueDate.toISOString().split('T')[0];
  };

  // Calculate due date if not provided
  const finalInvoiceData = {
    ...invoiceData,
    company_name: invoiceData.company_name || '',
    company_address: invoiceData.company_address || '',
    due_date: invoiceData.due_date || calculateDueDate(invoiceData.date),
  };

  // Company Info (Top Left)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(finalInvoiceData.company_name, margin, yPosition);
  yPosition += 7;
  doc.setFont('helvetica', 'normal');
  doc.text(finalInvoiceData.company_address, margin, yPosition);
  yPosition += 5; // Add some space after address

  // Company Logo (Top Left, if provided)
  if (finalInvoiceData.company_logo_url) {
    try {
      const response = await fetch(finalInvoiceData.company_logo_url);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      await new Promise<void>((resolve) => {
        reader.onloadend = () => {
          const base64data = reader.result;
          const imgWidth = 30;
          const imgHeight = 20;
          doc.addImage(base64data as string, 'PNG', margin, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 5; // Adjust yPosition after adding logo
          resolve();
        };
      });
    } catch (error) {
      console.error('Error loading company logo:', error);
    }
  }

  yPosition += 10; // Add extra space before the invoice header

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 10;

  // Invoice Number and Dates (Top Right)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice No: ${finalInvoiceData.invoice_no}`, pageWidth - margin, margin, { align: 'right' });
  doc.text(`Invoice Date: ${formatDate(finalInvoiceData.date)}`, pageWidth - margin, margin + 5, { align: 'right' });
  if (finalInvoiceData.due_date) {
    doc.text(`Due Date: ${formatDate(finalInvoiceData.due_date)}`, pageWidth - margin, margin + 10, { align: 'right' });
  }

  // Date and Customer Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  if (finalInvoiceData.customer_name) {
    doc.text(`Customer: ${finalInvoiceData.customer_name}`, margin, yPosition);
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
  finalInvoiceData.items.forEach((item, index) => {
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
    const grandTotal = Number(finalInvoiceData.grand_total) || 0;
    doc.text('Grand Total:', colX.amount, yPosition);
    doc.text(`$${grandTotal.toFixed(2)}`, colX.total, yPosition);
    yPosition += 15;
  } else {
    doc.addPage();
    yPosition = margin;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    const grandTotal = Number(finalInvoiceData.grand_total) || 0;
    doc.text('Grand Total:', colX.amount, yPosition);
    doc.text(`$${grandTotal.toFixed(2)}`, colX.total, yPosition);
    yPosition += 15;
  }

  // Footer Information
  // Terms and Conditions
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Terms and Conditions:', margin, yPosition + 10);
  doc.setFont('helvetica', 'normal');
  doc.text('Payment is due in 7 days', margin, yPosition + 17);
  doc.text('Please make checks payable to: Your Company Inc.', margin, yPosition + 24);
  yPosition += 35;

  if (finalInvoiceData.salesman_name_footer || finalInvoiceData.customer_phone_footer) {
    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    if (finalInvoiceData.salesman_name_footer) {
      doc.text(`Salesman: ${finalInvoiceData.salesman_name_footer}`, margin, yPosition);
      yPosition += 7;
    }
    
    if (finalInvoiceData.customer_phone_footer) {
      doc.text(`Tel. No.: ${finalInvoiceData.customer_phone_footer}`, margin, yPosition);
    }
  }

  // Generate filename
  const formattedDate = formatDate(finalInvoiceData.date).replace(/\//g, '-');
  const customerName = finalInvoiceData.customer_name 
    ? finalInvoiceData.customer_name.replace(/[^a-z0-9]/gi, '_').substring(0, 20)
    : 'Invoice';
  const filename = `Invoice_${finalInvoiceData.invoice_no}_${customerName}_${formattedDate}.pdf`;

  // Save the PDF
  doc.save(filename);
}

