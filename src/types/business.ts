export interface Sale {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
}

export interface Expense {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: string;
  vendor: string;
}
