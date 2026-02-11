import Link from "next/link";
import { getService } from "@/lib/services";
import UserList from "@/components/users/UserList";
import { resources } from "@/config/resources";

export default async function UsersPage() {
  const service = getService("users");
  const config = resources.find((r) => r.name === "users")!;
  
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
        <h1 className="text-2xl font-bold">Users</h1>
        <Link
          href="/users/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Add User
        </Link>
      </div>

      <UserList items={items} config={config} />
    </div>
  );
}
