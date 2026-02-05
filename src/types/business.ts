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
  user_name?: string | null;
  created_at?: string;
  updated_at?: string;
  invoice_no?: string;
  paid?: boolean;
  due_date?: string;
  payment_type?: 'Cash' | 'Online' | 'Cheque';
  disclaimer?: string;
}

export interface PurchaseItem {
  no: number;
  productName: string;
  unit: string;
  qty: number;
  price: number;
}

export interface Purchase {
  id: string;
  date: string;
  items: PurchaseItem[];
  grand_total: number;
  company_name: string;
  supplier_phone?: string;
  paid?: boolean;
  due_date?: string;
  payment_type?: 'Cash' | 'Online' | 'Cheque';
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  user_name?: string | null;
  purchase_no?: string;
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
