import { getService } from "@/lib/services";
import { notFound } from "next/navigation";
import ProductForm from "@/components/products/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = getService("products");
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let item: any = null;
  try {
    item = await service.getById(id);
  } catch (error) {
    console.error(error);
  }

  if (!item) {
    return notFound();
  }

  return <ProductForm mode="update" initialData={item} id={id} />;
}
