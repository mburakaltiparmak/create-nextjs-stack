"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { createResource, updateResource, deleteResource } from "@/app/actions/resources";
import { ResourceConfig } from "@/config/resources";

export function useResource(config: ResourceConfig) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const create = async (data: any) => {
    setIsSubmitting(true);
    try {
      const result = await createResource(config.table, data);
      if (result.error) {
        toast.error(result.error);
        return false;
      }
      toast.success(`${config.singular} created successfully`);
      router.push(`/${config.name}`);
      router.refresh();
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update = async (id: string, data: any) => {
    setIsSubmitting(true);
    try {
      const result = await updateResource(config.table, id, data);
      if (result.error) {
        toast.error(result.error);
        return false;
      }
      toast.success(`${config.singular} updated successfully`);
      router.push(`/${config.name}`);
      router.refresh();
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const remove = async (id: string) => {    
    if (!window.confirm("Are you sure you want to delete this record?")) {
      return false;
    }
    setIsDeleting(true);
    try {
      const result = await deleteResource(config.table, id);
      if (result.error) {
        toast.error(result.error);
        return false;
      }
      toast.success("Record deleted");
      router.push(`/${config.name}`);
      router.refresh();
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    create,
    update,
    remove,
    isSubmitting,
    isDeleting
  };
}
