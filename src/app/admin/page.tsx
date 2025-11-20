'use client';

import React, { useState, useEffect } from "react";
import { createClient } from '../../../supabase/client'; // Adjust path as needed
import { Toggle } from "@/components/ui/toggle";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const AdminPage = () => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [editingCategory, setEditingCategory] = useState<any>(null); // State to manage which category is being edited
  const [editedCategoryName, setEditedCategoryName] = useState(""); // State for the edited name
  const supabase = createClient();

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('category')
      .select('id, name');
    if (error) {
      console.error("Error fetching categories:", error);
    } else {
      setCategories(data || []);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const { data, error } = await supabase
      .from('category')
      .insert([{ name: newCategoryName.trim() }])
      .select();

    if (error) {
      console.error("Error adding category:", error);
    } else {
      setNewCategoryName("");
      fetchCategories(); // Refresh the list of categories
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      const { error } = await supabase
        .from('category')
        .delete()
        .eq('id', categoryId);

      if (error) {
        console.error("Error deleting category:", error);
      } else {
        fetchCategories(); // Refresh the list of categories
      }
    }
  };

  const handleEditClick = (category: any) => {
    setEditingCategory(category);
    setEditedCategoryName(category.name);
  };

  const handleSaveEdit = async (categoryId: string) => {
    if (!editedCategoryName.trim()) return;

    const { error } = await supabase
      .from('category')
      .update({ name: editedCategoryName.trim() })
      .eq('id', categoryId);

    if (error) {
      console.error("Error saving category edit:", error);
    } else {
      setEditingCategory(null);
      setEditedCategoryName("");
      fetchCategories();
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditedCategoryName("");
  };

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
    fetchCategories();
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

        <section className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Add Product Category</h2>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">Category Name</label>
              <input
                type="text"
                id="categoryName"
                name="categoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Category
            </button>
          </form>

          <h3 className="text-xl font-semibold text-gray-700 mt-8 mb-4">Existing Categories</h3>
          {
            categories.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <li key={category.id} className="py-3 flex items-center justify-between">
                    {
                      editingCategory?.id === category.id ? (
                        <div className="flex items-center space-x-2 w-full">
                          <input
                            type="text"
                            value={editedCategoryName}
                            onChange={(e) => setEditedCategoryName(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                          <button
                            onClick={() => handleSaveEdit(category.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="text-lg font-medium text-gray-800">{category.name}</span>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditClick(category)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )
                    }
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No categories found.</p>
            )
          }
        </section>

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
