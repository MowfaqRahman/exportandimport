
'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";

interface ReportsFilterProps {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
}

export function ReportsFilter({
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: ReportsFilterProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i); // Last 5 years
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

  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <Select defaultValue={String(currentYear)} value={selectedYear} onValueChange={setSelectedYear}>
        <SelectTrigger className="w-[180px]">
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

      {selectedYear !== "custom" && (
        <Select defaultValue="all" value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[180px]">
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
      )}

      {selectedYear === "custom" && (
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Start Date</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm bg-background h-10 w-[150px]"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-muted-foreground ml-1">End Date</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm bg-background h-10 w-[150px]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
