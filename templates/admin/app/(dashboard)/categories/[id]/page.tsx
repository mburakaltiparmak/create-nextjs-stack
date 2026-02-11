import { getService } from "@/lib/services";
import { notFound } from "next/navigation";
import CategoryForm from "@/components/categories/CategoryForm";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = getService("categories");
  
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

  return <CategoryForm mode="update" initialData={item} id={id} />;
}
