import { resources } from "@/config/resources";
import { notFound } from "next/navigation";
import Link from "next/link";
import * as Icons from "lucide-react";
import Image from "next/image";
import { getService } from "@/lib/services";

interface PageProps {
  params: Promise<{
    resource: string;
  }>;
}

export default async function ResourceListPage({ params }: PageProps) {
  const resolvedParams = await params;
  const resourceName = resolvedParams.resource;
  const config = resources.find((r) => r.name === resourceName);

  if (!config) {
    return notFound();
  }

  const service = getService(config.table);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let items: any[] = [];
  try {
    items = await service.getAll();
  } catch (error) {
    console.error(error);
  }

  // Helper to resolve related data (basic implementation)
  // For production, you might want to join tables in the query
  // or fetch relations separately.

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{config.plural}</h1>
        <Link
          href={`/${resourceName}/new`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Add {config.singular}
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-semibold">
              <tr>
                {config.fields
                  .filter((f) => f.type !== "textarea") // Skip long text in table
                  .slice(0, 5) // Limit columns
                  .map((field) => (
                    <th key={field.name} className="px-6 py-3">
                      {field.label}
                    </th>
                  ))}
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items?.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition"
                >
                  {config.fields
                    .filter((f) => f.type !== "textarea")
                    .slice(0, 5)
                    .map((field) => (
                      <td
                        key={field.name}
                        className="px-6 py-4 text-gray-900"
                      >
                        {field.type === "image" ? (
                          <div className="relative w-10 h-10 bg-gray-100 rounded overflow-hidden">
                            {item[field.name] ? (
                              <Image
                                src={item[field.name]}
                                alt="Thumbnail"
                                fill
                                className="object-cover"
                              />
                            ) : (
                                <span className="text-xs text-gray-400 flex items-center justify-center h-full">No Img</span>
                            )}
                          </div>
                        ) : field.type === "boolean" ? (
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              item[field.name]
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {item[field.name] ? "Yes" : "No"}
                          </span>
                        ) : (
                          <span className="text-sm">
                            {/* Handle objects/arrays if needed */}
                            {String(item[field.name] || "-")}
                          </span>
                        )}
                      </td>
                    ))}
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/${resourceName}/${item.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
              {items?.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-8 text-center text-gray-500">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
