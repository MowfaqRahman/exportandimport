'use client';

import React, { useState, useEffect } from "react";
import { createClient } from '../../../supabase/client'; // Adjust path as needed

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


const AdminPage = () => {

  const supabase = createClient();

  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const fetchManagedUsers = async () => {
    setLoadingUsers(true);
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, role, is_blocked');

    if (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } else {
      setUsers(data || []);
    }
    setLoadingUsers(false);
  };

  useEffect(() => {
    fetchManagedUsers();
  }, []);

  const handleBlockUser = async (userId: string) => {
    const { error } = await supabase
      .from('users')
      .update({ is_blocked: true })
      .eq('id', userId);

    if (error) {
      console.error("Error blocking user:", error);
    } else {
      fetchManagedUsers();
    }
  };

  const handleUnblockUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to allow this user again? They will regain access immediately.")) {
      const { error } = await supabase
        .from('users')
        .update({ is_blocked: false })
        .eq('id', userId);

      if (error) {
        console.error("Error unblocking user:", error);
      } else {
        fetchManagedUsers();
      }
    }
  };

  const handleViewDetails = (userId: string) => {
    console.log("View details for user:", userId);
    // Implement navigation to a user detail page or open a modal
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Placeholder for potential future use or if a common layout exists */}
      {/* <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h2 className="text-xl font-semibold">Admin Dashboard</h2>
          <nav className="mt-4">
            <ul>
              <li className="mb-2">
                <a href="#" className="block text-blue-600 hover:underline">Product Categories</a>
              </li>
              <li className="mb-2">
                <a href="#" className="block text-blue-600 hover:underline">User Management</a>
              </li>
            </ul>
          </nav>
        </div>
      </aside> */}

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>



        {/* User Management Section */}
        <section className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">User Management</h2>

          {loadingUsers ? (
            <p>Loading users...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell className="text-right">
                      <Tabs defaultValue={user.is_blocked ? "pending" : "allow"} className="w-[150px]">
                        <TabsList className="grid w-full grid-cols-2 h-9 rounded-full p-1 bg-gray-200">
                          <TabsTrigger
                            value="pending"
                            className="text-sm font-medium rounded-full data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-500 transition-all"
                            onClick={() => handleBlockUser(user.id)}
                          >
                            Pending
                          </TabsTrigger>
                          <TabsTrigger
                            value="allow"
                            className="text-sm font-medium rounded-full data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-500 transition-all"
                            onClick={() => handleUnblockUser(user.id)}
                          >
                            Allow
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminPage;
