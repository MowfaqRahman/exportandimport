
'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Sale } from "@/types/business";

interface ProductHistoryTabProps {
  products: { id: string; name: string }[];
  selectedProduct: string;
  setSelectedProduct: (product: string) => void;
  users: { id: string; name: string, email: string }[];
  selectedUser: string;
  setSelectedUser: (user: string) => void;
  loadingUsers: boolean;
  loadingProductStats: boolean;
  productStats: any;
  loadingMonthlyUnitsSold: boolean;
  monthlyUnitsSold: any[];
  loadingProductSalesHistory: boolean;
  productSalesHistory: any[];
  formatDate: (dateString: string) => string;
}

export function ProductHistoryTab({
  products,
  selectedProduct,
  setSelectedProduct,
  users,
  selectedUser,
  setSelectedUser,
  loadingUsers,
  loadingProductStats,
  productStats,
  loadingMonthlyUnitsSold,
  monthlyUnitsSold,
  loadingProductSalesHistory,
  productSalesHistory,
  formatDate,
}: ProductHistoryTabProps) {
  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">Product History</h2>
      <div className="mb-4">
        <Select value={selectedProduct} onValueChange={setSelectedProduct}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mb-4">
        <Select value={selectedUser || ""} onValueChange={setSelectedUser}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Select User" />
          </SelectTrigger>
          <SelectContent>
            {loadingUsers ? (
              <SelectItem value="loading" disabled>Loading users...</SelectItem>
            ) : (
              users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name || user.email}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {selectedUser && !loadingUsers && (
        <div className="rounded-lg border p-4 shadow-sm mb-6">
          <h3 className="text-xl font-semibold mb-4">Selected User Details</h3>
          <p><strong>User ID:</strong> {users.find(u => u.id === selectedUser)?.id}</p>
          <p><strong>User Name:</strong> {users.find(u => u.id === selectedUser)?.name || users.find(u => u.id === selectedUser)?.email}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg border p-4 shadow-sm">
          <p className="text-sm font-medium">Total Units Sold</p>
          <p className="text-2xl font-bold">{loadingProductStats ? "..." : productStats?.totalUnitsSold || 0}</p>
        </div>
        <div className="rounded-lg border p-4 shadow-sm">
          <p className="text-sm font-medium">Total Revenue</p>
          <p className="text-2xl font-bold">{loadingProductStats ? "..." : `$${Number(productStats?.totalRevenue || 0).toFixed(2)}`}</p>
        </div>
      </div>

      <div className="rounded-lg border p-4 shadow-sm mb-6">
        <h3 className="text-xl font-semibold mb-4">Monthly Units Sold</h3>
        <ResponsiveContainer width="100%" height={200}>
          {loadingMonthlyUnitsSold ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
          ) : monthlyUnitsSold.length === 0 ? (
            null
          ) : (
            <LineChart
              data={monthlyUnitsSold}
              margin={{
                top: 5, right: 30, left: 20, bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="units" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <h3 className="text-xl font-semibold mb-4">Product Sales History</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Payment Status</TableHead>
            <TableHead>Invoice</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loadingProductSalesHistory ? (
            <TableRow><TableCell colSpan={7} className="text-center">Loading product sales history...</TableCell></TableRow>
          ) : productSalesHistory.length === 0 ? (
            <TableRow><TableCell colSpan={7} className="text-center">No sales history found for this product.</TableCell></TableRow>
          ) : (
            productSalesHistory.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>{formatDate(sale.date)}</TableCell>
                <TableCell>{sale.customer_name}</TableCell>
                <TableCell>{sale.quantity}</TableCell>
                <TableCell>${Number(sale.price).toFixed(2)}</TableCell>
                <TableCell>${Number(sale.total).toFixed(2)}</TableCell>
                <TableCell>
                  {sale.paid ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">Paid</span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">Unpaid</span>
                  )}
                </TableCell>
                <TableCell>{sale.invoice_id}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex justify-center mt-4">
        {/* Pagination controls will go here */}
        <Button variant="outline" className="mx-1">Previous</Button>
        <Button variant="outline" className="mx-1">1</Button>
        <Button variant="outline" className="mx-1">2</Button>
        <Button variant="outline" className="mx-1">Next</Button>
      </div>
    </div>
  );
}
