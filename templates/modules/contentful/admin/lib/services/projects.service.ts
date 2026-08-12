/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseService } from "./base.service";
import { ClientService } from "./clients.service";

export class ProjectService extends BaseService {
  constructor() {
    super("projects");
  }

  /**
   * Supabase varyantındaki `select("*, clients(name)")` join'inin karşılığı.
   * CMA link çözümlemesi yapmadığı için client adlarını tek ek istekte toplayıp
   * satırlara iliştiriyoruz.
   */
  async getAll() {
    const rows = await super.getAll();

    try {
      const clients = await new ClientService().getOptions("name");
      const byId = new Map(clients.map((client) => [client.id, client]));

      return rows.map((row: any) => ({
        ...row,
        clients: row.client_id ? (byId.get(row.client_id) ?? null) : null,
      }));
    } catch (error) {
      console.error("Error resolving project clients:", error);
      return rows.map((row: any) => ({ ...row, clients: null }));
    }
  }
}
