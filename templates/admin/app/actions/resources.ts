"use server";

import { getService } from "@/lib/services";
import { revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getRelationOptions(table: string, displayField: string): Promise<any[]> {
  const service = getService(table);
  return await service.getOptions(displayField);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createResource(table: string, data: any) {
    try {
        const service = getService(table);
        const result = await service.create(data);
        revalidatePath(`/${table}`);
        return { data: result };
    } catch (error: any) {
        return { error: error.message || "Failed to create resource" };
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateResource(table: string, id: string, data: any) {
    try {
        const service = getService(table);
        const result = await service.update(id, data);
        revalidatePath(`/${table}`);
        revalidatePath(`/${table}/${id}`);
        return { data: result };
    } catch (error: any) {
        return { error: error.message || "Failed to update resource" };
    }
}

export async function deleteResource(table: string, id: string) {
    try {
        const service = getService(table);
        await service.delete(id);
        revalidatePath(`/${table}`);
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Failed to delete resource" };
    }
}
