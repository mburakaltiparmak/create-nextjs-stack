import { BaseService } from './base.service';

export class ResourceService extends BaseService {
  constructor(table: string = '') {
    super(table);
  }

  /**
   * Verilen content type'ın kayıtlarını [{ id, <displayField> }] olarak döner.
   * Supabase varyantında bu ayrı bir sorguydu; Contentful'da BaseService.getOptions
   * zaten aynı işi yapıyor, burada sadece tablo adını dışarıdan alıyoruz.
   */
  async getRelationOptions(table: string, displayField: string) {
    return new ResourceService(table).getOptions(displayField);
  }
}

export const resourceService = new ResourceService();
