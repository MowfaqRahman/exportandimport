'use client';

import React from "react";
import { Button } from "@/components/ui/button";

interface AddCategoryFormProps {
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  handleAddCategory: (e: React.FormEvent) => void;
  categories: any[];
  editingCategory: any;
  setEditingCategory: (category: any) => void;
  editedCategoryName: string;
  setEditedCategoryName: (name: string) => void;
  handleSaveEdit: (categoryId: string) => void;
  handleCancelEdit: () => void;
  handleEditClick: (category: any) => void;
  handleDeleteCategory: (categoryId: string) => void;
}

const AddCategoryForm: React.FC<AddCategoryFormProps> = ({
  newCategoryName,
  setNewCategoryName,
  handleAddCategory,
  categories,
  editingCategory,
  setEditingCategory,
  editedCategoryName,
  setEditedCategoryName,
  handleSaveEdit,
  handleCancelEdit,
  handleEditClick,
  handleDeleteCategory,
}) => {
  return (
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
        <Button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Category
        </Button>
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
                      <Button
                        onClick={() => handleSaveEdit(category.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Save
                      </Button>
                      <Button
                        onClick={handleCancelEdit}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-lg font-medium text-gray-800">{category.name}</span>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleEditClick(category)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          Delete
                        </Button>
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
  );
};

export default AddCategoryForm;
