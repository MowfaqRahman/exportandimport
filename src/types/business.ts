export interface InvoiceItem {
  no: number;
  description: string;
  qty: number;
  unitPrice: number;
}

export interface Sale {
  id: string;
  date: string;
  customer_name: string;
  items: InvoiceItem[];
  grand_total: any;
  salesman_name_footer: string | null;
  customer_phone_footer: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  invoice_no?: string;
}

export interface Expense {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: string;
  vendor: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  user_name: string | null;
}
