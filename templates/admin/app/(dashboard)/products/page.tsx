import Link from "next/link";
import { getService } from "@/lib/services";
import ProductList from "@/components/products/ProductList";
import { resources } from "@/config/resources";

export default async function ProductsPage() {
  const service = getService("products");
  const config = resources.find((r) => r.name === "products")!;
  
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
        <h1 className="text-2xl font-bold">Products</h1>
        <Link
          href="/products/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Add Product
        </Link>
      </div>

      <ProductList items={items} config={config} />
    </div>
  );
}
