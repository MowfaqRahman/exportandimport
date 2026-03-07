'use client';

import React, { useState } from "react";
import { createClient } from '../../../supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import * as XLSX from "xlsx";

export function ExportDataSection() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [selectedMonth, setSelectedMonth] = useState("all");
  const currentMonth = new Date().getMonth() + 1;
  const initialStart = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
  const initialEnd = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
  
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [exportType, setExportType] = useState("all");
  const [isExporting, setIsExporting] = useState(false);

  const { toast } = useToast();

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: "all", label: "All Months" },
    { value: "1", label: "Jan" },
    { value: "2", label: "Feb" },
    { value: "3", label: "Mar" },
    { value: "4", label: "Apr" },
    { value: "5", label: "May" },
    { value: "6", label: "Jun" },
    { value: "7", label: "Jul" },
    { value: "8", label: "Aug" },
    { value: "9", label: "Sep" },
    { value: "10", label: "Oct" },
    { value: "11", label: "Nov" },
    { value: "12", label: "Dec" },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    const supabase = createClient();
    
    // Helper to apply date filters to queries
    const applyDateFilter = (query: any) => {
      if (selectedYear === "custom") {
        return query.gte('date', startDate).lte('date', endDate);
      } else {
        if (selectedYear !== "all") {
          const startOfYear = `${selectedYear}-01-01`;
          const endOfYear = `${selectedYear}-12-31`;
          query = query.gte('date', startOfYear).lte('date', endOfYear);
        }

        if (selectedMonth !== "all") {
          const monthNumber = parseInt(selectedMonth, 10);
          const yearNum = parseInt(selectedYear, 10);
          const monthStr = String(monthNumber).padStart(2, '0');
          const lastDay = new Date(yearNum, monthNumber, 0).getDate();
          
          const startOfMonth = `${yearNum}-${monthStr}-01`;
          const endOfMonth = `${yearNum}-${monthStr}-${String(lastDay).padStart(2, '0')}`;
          query = query.gte('date', startOfMonth).lte('date', endOfMonth);
        }
        return query;
      }
    };

    try {
      // Helper function to generate filename
      const getFilename = (type: string) => {
        let filename = `${type}_Data`;
        if (selectedYear === "custom") {
          filename += `_${startDate}_to_${endDate}`;
        } else {
          filename += `_${selectedYear}`;
          if (selectedMonth !== "all") filename += `_${selectedMonth}`;
        }
        filename += ".xlsx";
        return filename;
      };

      const promises = [];

      if (exportType === "all" || exportType === "sales") {
        promises.push(
          applyDateFilter(supabase.from('sales').select('*').order('date', { ascending: false }))
            .then((res: any) => ({ type: 'sales', ...res }))
        );
      }
      if (exportType === "all" || exportType === "purchases") {
        promises.push(
          applyDateFilter(supabase.from('purchases').select('*').order('date', { ascending: false }))
            .then((res: any) => ({ type: 'purchases', ...res }))
        );
      }
      if (exportType === "all" || exportType === "expenses") {
        promises.push(
          applyDateFilter(supabase.from('expenses').select('*').order('date', { ascending: false }))
            .then((res: any) => ({ type: 'expenses', ...res }))
        );
      }

      const results = await Promise.all(promises);

      for (const result of results) {
        if (result.error) throw result.error;

        let formattedData: any[] = [];
        let sheetName = "";

        if (result.type === 'sales') {
          formattedData = (result.data || []).map((sale: any) => {
            let itemsDesc = '';
            if (sale.items && Array.isArray(sale.items)) {
                itemsDesc = sale.items.map((i: any) => `${i.description} (x${i.qty})`).join(', ');
            }
            return {
              Date: sale.date,
              'Invoice No': sale.invoice_no || sale.id,
              'Customer': sale.customer_name,
              'Grand Total': sale.grand_total,
              'Status': sale.paid ? 'Paid' : 'Unpaid',
              'Payment Type': sale.payment_type,
              'Items': itemsDesc,
            };
          });
          sheetName = "Sales";
        } else if (result.type === 'purchases') {
          formattedData = (result.data || []).map((purch: any) => {
            let itemsDesc = '';
            if (purch.items && Array.isArray(purch.items)) {
                itemsDesc = purch.items.map((i: any) => `${i.description} (x${i.qty})`).join(', ');
            }
            return {
              Date: purch.date,
              'Vendor': purch.vendor_name,
              'Grand Total': purch.grand_total,
              'Status': purch.paid ? 'Paid' : 'Unpaid',
              'Payment Type': purch.payment_type,
              'Items': itemsDesc,
            };
          });
          sheetName = "Purchases";
        } else if (result.type === 'expenses') {
          formattedData = (result.data || []).map((exp: any) => ({
            Date: exp.date,
            'Description': exp.description,
            'Amount': exp.amount,
            'Payment Type': exp.payment_type || 'N/A',
          }));
          sheetName = "Expenses";
        }

        const workbook = XLSX.utils.book_new();
        const sheet = XLSX.utils.json_to_sheet(formattedData);
        XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
        XLSX.writeFile(workbook, getFilename(sheetName));
        
        // Slight delay to allow multiple downloads to trigger sequentially
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      toast({
         title: "Export Successful",
         description: `Data has been exported successfully.`,
      });
      
    } catch (error: any) {
      console.error("Export error:", error);
      toast({
         title: "Export Failed",
         description: error.message || "An unknown error occurred during export",
         variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="bg-white shadow-md rounded-lg p-6 mt-6">
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Export Data</h2>
      <p className="text-sm text-gray-500 mb-6">
        Export sales, purchases, and expenses data to Excel sheets. Select the data type and timeframe below.
      </p>

      <div className="flex flex-wrap items-end gap-4 mb-6">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-muted-foreground ml-1 mb-1">Data Type</span>
          <Select defaultValue="all" value={exportType} onValueChange={setExportType}>
            <SelectTrigger className="w-[180px] h-10">
              <SelectValue placeholder="Select Data Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All (Separate Files)</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="purchases">Purchases</SelectItem>
              <SelectItem value="expenses">Expenses</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-bold text-muted-foreground ml-1 mb-1">Year</span>
          <Select defaultValue={String(currentYear)} value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px] h-10">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedYear !== "custom" && (
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-muted-foreground ml-1 mb-1">Month</span>
            <Select defaultValue="all" value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px] h-10">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedYear === "custom" && (
          <>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground ml-1 mb-1">Start Date</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm bg-background h-10 w-[180px] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground ml-1 mb-1">End Date</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm bg-background h-10 w-[180px] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>
          </>
        )}

        <Button 
          onClick={handleExport}
          disabled={isExporting}
          className="h-10 px-6 mt-4 sm:mt-0"
        >
          {isExporting ? "Exporting..." : "Export to Excel"}
        </Button>
      </div>
    </section>
  );
}
