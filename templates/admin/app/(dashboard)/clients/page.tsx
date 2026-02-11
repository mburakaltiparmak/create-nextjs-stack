import Link from "next/link";
import { getService } from "@/lib/services";
import ClientList from "@/components/clients/ClientList";
import { resources } from "@/config/resources";

export default async function ClientsPage() {
  const service = getService("clients");
  const config = resources.find((r) => r.name === "clients")!;
  
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
        <h1 className="text-2xl font-bold">Clients</h1>
        <Link
          href="/clients/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Add Client
        </Link>
      </div>

      <ClientList items={items} config={config} />
    </div>
  );
}
