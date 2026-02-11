"use client";

import Link from "next/link";
import { ResourceConfig } from "@/config/resources";
import { useResource } from "@/hooks/useResource";
import { Pencil, Trash2 } from "lucide-react";

interface CategoryListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
  config: ResourceConfig;
}

import { useState } from "react";
import DeleteModal from "@/components/admin/DeleteModal";

export default function CategoryList({ items, config }: CategoryListProps) {
  const { remove, isDeleting } = useResource(config);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (deleteId) {
      const success = await remove(deleteId);
      if (success) {
        setDeleteId(null);
      }
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Slug</th>
              <th className="px-6 py-3">Featured</th>
              <th className="px-6 py-3">Published</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items?.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-gray-900 font-medium">{item.title}</td>
                <td className="px-6 py-4 text-gray-500">{item.slug}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      item.featured
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item.featured ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      item.published
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                        href={`/categories/${item.id}`}
                        className="flex items-center text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors duration-200"
                        title="Edit"
                    >
                        <Pencil className="w-4 h-4" />
                    </Link>
                    <button
                        onClick={() => setDeleteId(item.id)}
                        className="flex items-center text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-md transition-colors duration-200"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>

      <DeleteModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
      />
    </>
  );
}
