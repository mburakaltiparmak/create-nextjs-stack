"use client";

import Link from "next/link";
import Image from "next/image";
import { ResourceConfig } from "@/config/resources";
import { useResource } from "@/hooks/useResource";
import { Pencil, Trash2 } from "lucide-react";

interface ClientListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[];
  config: ResourceConfig;
}

import { useState } from "react";
import DeleteModal from "@/components/admin/DeleteModal";

export default function ClientList({ items, config }: ClientListProps) {
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
              <th className="px-6 py-3">Logo</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Website</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items?.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="relative w-10 h-10 bg-gray-100 rounded overflow-hidden">
                    {item.logo_url ? (
                      <Image
                        src={item.logo_url}
                        alt={item.name}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <span className="text-xs text-gray-400 flex items-center justify-center h-full">No Logo</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-900 font-medium">{item.name}</td>
                <td className="px-6 py-4 text-gray-500">
                    {item.website ? (
                        <a href={item.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {item.website}
                        </a>
                    ) : (
                        "-"
                    )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Link
                        href={`/clients/${item.id}`}
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
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No clients found.
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
        title="Delete Client"
        description="Are you sure you want to delete this client? This action cannot be undone."
      />
    </>
  );
}
