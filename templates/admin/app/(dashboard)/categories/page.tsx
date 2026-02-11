import Link from "next/link";
import { getService } from "@/lib/services";
import CategoryList from "@/components/categories/CategoryList";
import { resources } from "@/config/resources";

export default async function CategoriesPage() {
  const service = getService("categories");
  const config = resources.find((r) => r.name === "categories")!;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let items: any[] = [];
  try {
    items = await service.getAll();
  } catch (error) {
    console.error(error);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Link
          href="/categories/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Add Category
        </Link>
      </div>

      <CategoryList items={items} config={config} />
    </div>
  );
}
