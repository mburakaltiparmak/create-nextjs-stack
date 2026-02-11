import { getService } from "@/lib/services";
import { notFound } from "next/navigation";
import ClientForm from "@/components/clients/ClientForm";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = getService("clients");
  
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

  return <ClientForm mode="update" initialData={item} id={id} />;
}
