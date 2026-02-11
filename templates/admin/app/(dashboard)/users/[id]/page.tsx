import { getService } from "@/lib/services";
import { notFound } from "next/navigation";
import UserForm from "@/components/users/UserForm";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const service = getService("users");
  
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

  return <UserForm mode="update" initialData={item} id={id} />;
}
