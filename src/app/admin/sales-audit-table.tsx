'use client';

import React, { useState, useEffect } from "react";
import { createClient } from '../../../supabase/client'; // Adjust path if needed
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AuditLog {
  id: string;
  sale_id: string;
  editor_user_id: string;
  changed_at: string;
  old_data: any;
  new_data: any;
  editor?: { full_name: string; email: string };
  sale?: { invoice_no: string; customer_name: string };
}

export function SalesAuditTable() {
  const supabase = createClient();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    setErrorMsg(null);
    console.log("Fetching sales audit logs...");

    // Fetch logs without complex joins to make sure data comes through first
    const { data: rawLogs, error } = await supabase
      .from('sales_audit')
      .select(`*`)
      .order('changed_at', { ascending: false })
      .limit(50); // Fetch latest 50 for performance

    if (error) {
      console.error("Error fetching sales audit logs:", error);
      setErrorMsg(error.message || JSON.stringify(error));
      setLoading(false);
      return;
    }

    const logs = rawLogs || [];

    // Manually fetch associated Users and Sales to avoid Supabase join errors on undefined foreign keys
    const saleIds = Array.from(new Set(logs.map((l: any) => l.sale_id).filter(Boolean)));
    const editorIds = Array.from(new Set(logs.map((l: any) => l.editor_user_id).filter(Boolean)));

    let salesData: any[] = [];
    if (saleIds.length > 0) {
      const { data: sData } = await supabase.from('sales').select('id, invoice_no, customer_name').in('id', saleIds);
      salesData = sData || [];
    }

    let usersData: any[] = [];
    if (editorIds.length > 0) {
      const { data: uData } = await supabase.from('users').select('id, full_name, email').in('id', editorIds);
      usersData = uData || [];
    }

    // Merge the data together
    const mergedLogs = logs.map((log: any) => ({
      ...log,
      sale: salesData.find(s => s.id === log.sale_id),
      editor: usersData.find(u => u.id === log.editor_user_id),
    }));

    setLogs(mergedLogs as AuditLog[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const renderChanges = (oldData: any, newData: any) => {
    const changes: JSX.Element[] = [];
    
    // Simple top-level diff
    const allKeys = Array.from(new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]));
    
    allKeys.forEach(key => {
      // Ignore routine timestamp updates
      if (key === 'updated_at' || key === 'created_at') return;

      const oldVal = oldData?.[key];
      const newVal = newData?.[key];

      // Deep compare objects (like items or grand_total) by stringifying
      if (typeof oldVal === 'object' || typeof newVal === 'object') {
        if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
          changes.push(
            <div key={key} className="mb-4 border-b pb-2">
              <strong className="text-sm text-gray-700 capitalize">{key.replace(/_/g, ' ')} changed:</strong>
              <div className="grid grid-cols-2 gap-4 mt-1">
                <div className="bg-red-50 p-2 rounded text-xs text-red-800 break-all">
                  <span className="font-semibold block mb-1">Before:</span>
                  <pre className="whitespace-pre-wrap">{JSON.stringify(oldVal, null, 2)}</pre>
                </div>
                <div className="bg-green-50 p-2 rounded text-xs text-green-800 break-all">
                  <span className="font-semibold block mb-1">After:</span>
                  <pre className="whitespace-pre-wrap">{JSON.stringify(newVal, null, 2)}</pre>
                </div>
              </div>
            </div>
          );
        }
      } else if (oldVal !== newVal) {
        changes.push(
          <div key={key} className="mb-2 flex items-center gap-2 text-sm">
            <strong className="w-1/3 capitalize text-gray-700">{key.replace(/_/g, ' ')}:</strong>
            <span className="flex-1 bg-red-50 text-red-700 px-2 py-1 rounded line-through">{String(oldVal ?? 'null')}</span>
            <span className="text-gray-400">➔</span>
            <span className="flex-1 bg-green-50 text-green-700 px-2 py-1 rounded">{String(newVal ?? 'null')}</span>
          </div>
        );
      }
    });

    if (changes.length === 0) {
      return <p className="text-gray-500 italic">No significant data changes detected (only timestamps).</p>;
    }

    return <div>{changes}</div>;
  };

  return (
    <section className="bg-white shadow-md rounded-lg p-6 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-700">Edited Sales History</h2>
        <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {errorMsg ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4 flex justify-between items-start">
          <div>
            <span className="font-semibold">Failed to fetch data from Supabase: </span>
            <span>{errorMsg}</span>
          </div>
          <p className="text-xs text-red-500 mt-1 max-w-sm">This is likely because Supabase cannot automatically join the "users" table. We may need to use a simpler query or check the database permissions.</p>
        </div>
      ) : loading && logs.length === 0 ? (
        <p className="text-gray-500">Loading audit logs...</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-500">No edits have been made to any sales yet.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Editor</TableHead>
                <TableHead>Sale Info</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(log.changed_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {log.editor ? (
                      <div>
                        <p className="font-medium">{log.editor.full_name}</p>
                        <p className="text-xs text-gray-500">{log.editor.email}</p>
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">System / Unknown ({log.editor_user_id?.slice(0, 8)})</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {log.sale ? (
                      <div>
                        <p className="font-medium">Inv: {log.sale.invoice_no}</p>
                        <p className="text-xs text-gray-500">{log.sale.customer_name}</p>
                      </div>
                    ) : (
                      <span className="text-gray-500">{log.sale_id.slice(0, 8)}...</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">View Changes</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Changes for Invoice {log.sale?.invoice_no || log.sale_id.slice(0,8)}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          {renderChanges(log.old_data, log.new_data)}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
