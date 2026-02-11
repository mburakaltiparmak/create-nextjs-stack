import { BaseService } from "./base.service";
import { ProductService } from "./products.service";
import { UserService } from "./users.service";
import { ClientService } from "./clients.service";
import { ProjectService } from "./projects.service";
import { CategoryService } from "./categories.service";

// Registry mapping resource names to Service instances
const services: Record<string, BaseService> = {
  products: new ProductService(),
  users: new UserService(),
  clients: new ClientService(),
  projects: new ProjectService(),
  categories: new CategoryService(),
};

export const getService = (resourceName: string): BaseService => {
  const service = services[resourceName];
  if (!service) {
    // Fallback or throw error. For template flexibility, we can return a generic BaseService
    // or strictly throw if the resource isn't configured.
    // For now, let's return a generic BaseService to support new tables added to config/resources.ts
    // without needing a dedicated file immediately.
    return new BaseService(resourceName);
  }
  return service;
};
