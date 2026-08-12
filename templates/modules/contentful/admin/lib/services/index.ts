import { BaseService } from "./base.service";
import { ProductService } from "./products.service";
import { ClientService } from "./clients.service";
import { ProjectService } from "./projects.service";
import { CategoryService } from "./categories.service";

// Registry mapping content type IDs to Service instances
const services: Record<string, BaseService> = {
  products: new ProductService(),
  clients: new ClientService(),
  projects: new ProjectService(),
  categories: new CategoryService(),
};

export const getService = (resourceName: string): BaseService => {
  const service = services[resourceName];
  if (!service) {
    // Fallback: config/resources.ts'e yeni bir content type eklendiğinde
    // ayrı bir servis dosyası yazmadan çalışsın.
    return new BaseService(resourceName);
  }
  return service;
};
