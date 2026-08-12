/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Entry, Environment } from "contentful-management";
import { getDefaultLocale, getEnvironment, describeError } from "@/lib/contentful/client";
import { resources } from "@/config/resources";

const MAX_ENTRIES_PER_REQUEST = 1000;

/**
 * Contentful Content Management API üzerine kurulu jenerik CRUD servisi.
 *
 * Supabase varyantındaki BaseService ile aynı public API'yi sunar
 * (getAll / getById / create / update / delete / getOptions), böylece
 * app/actions/resources.ts, useResource ve form bileşenleri değişmeden çalışır.
 *
 * İki dönüşüm yapar:
 *   • locale sarmalı  — { title: { "en-US": "x" } }  ⇄  { title: "x" }
 *   • referanslar     — { sys: { type: "Link", id } } ⇄  "id"
 *
 * Hangi alanların referans olduğu config/resources.ts'teki `relation` alanından
 * türetilir; yeni bir ilişki eklemek için sadece o dosyayı düzenlemek yeter.
 */
export class BaseService<T = any> {
  protected table: string;

  constructor(table: string) {
    this.table = table;
  }

  protected async getClient(): Promise<Environment> {
    return getEnvironment();
  }

  /** config/resources.ts'te `relation` tanımlı alanlar = Contentful Link alanları. */
  protected referenceFields(): Set<string> {
    const config = resources.find((resource) => resource.table === this.table);
    return new Set(
      (config?.fields ?? []).filter((field) => field.relation).map((field) => field.name),
    );
  }

  /** Düz form verisi → Contentful'ın locale ile anahtarlanmış fields yapısı. */
  protected async toContentfulFields(payload: Record<string, any>) {
    const locale = await getDefaultLocale();
    const references = this.referenceFields();
    const fields: Record<string, any> = {};

    for (const [key, value] of Object.entries(payload)) {
      if (value === undefined) continue;

      if (references.has(key)) {
        fields[key] = {
          [locale]: value
            ? { sys: { type: "Link", linkType: "Entry", id: String(value) } }
            : null,
        };
        continue;
      }

      fields[key] = { [locale]: value === "" ? null : value };
    }

    return fields;
  }

  /** Contentful entry → düz satır. Supabase'in döndürdüğü şekle karşılık gelir. */
  protected async fromEntry(entry: Entry): Promise<T> {
    const locale = await getDefaultLocale();
    const row: Record<string, any> = {
      id: entry.sys.id,
      created_at: entry.sys.createdAt,
      updated_at: entry.sys.updatedAt,
    };

    for (const [key, localized] of Object.entries(entry.fields ?? {})) {
      const value =
        (localized as any)?.[locale] ?? Object.values(localized ?? {})[0] ?? null;

      row[key] = value?.sys?.type === "Link" ? value.sys.id : value;
    }

    return row as T;
  }

  protected async fromEntries(entries: Entry[]): Promise<T[]> {
    return Promise.all(entries.map((entry) => this.fromEntry(entry)));
  }

  async getAll() {
    try {
      const environment = await this.getClient();
      const response = await environment.getEntries({
        content_type: this.table,
        order: "-sys.createdAt",
        limit: MAX_ENTRIES_PER_REQUEST,
      });

      return this.fromEntries(response.items);
    } catch (error) {
      console.error(`Error fetching ${this.table}:`, error);
      throw new Error(describeError(error, `Failed to fetch ${this.table}`));
    }
  }

  async getById(id: string) {
    try {
      const environment = await this.getClient();
      const entry = await environment.getEntry(id);
      return this.fromEntry(entry);
    } catch (error) {
      console.error(`Error fetching ${this.table} ${id}:`, error);
      throw new Error(describeError(error, `Failed to fetch ${this.table} ${id}`));
    }
  }

  /** Dashboard kartları için kayıt sayısı — entry gövdelerini çekmez. */
  async count(): Promise<number> {
    try {
      const environment = await this.getClient();
      const response = await environment.getEntries({
        content_type: this.table,
        limit: 0,
      });
      return response.total ?? 0;
    } catch (error) {
      console.error(`Error counting ${this.table}:`, error);
      return 0;
    }
  }

  async create(payload: Partial<T>) {
    try {
      const environment = await this.getClient();
      const fields = await this.toContentfulFields(payload as Record<string, any>);

      const entry = await environment.createEntry(this.table, { fields });
      const published = await entry.publish();

      return this.fromEntry(published);
    } catch (error) {
      console.error(`Error creating ${this.table}:`, error);
      throw new Error(describeError(error, `Failed to create ${this.table}`));
    }
  }

  async update(id: string, payload: Partial<T>) {
    try {
      const environment = await this.getClient();
      const entry = await environment.getEntry(id);
      const fields = await this.toContentfulFields(payload as Record<string, any>);

      entry.fields = { ...entry.fields, ...fields };

      const updated = await entry.update();
      const published = await updated.publish();

      return this.fromEntry(published);
    } catch (error) {
      console.error(`Error updating ${this.table} ${id}:`, error);
      throw new Error(describeError(error, `Failed to update ${this.table} ${id}`));
    }
  }

  async delete(id: string) {
    try {
      const environment = await this.getClient();
      const entry = await environment.getEntry(id);

      // Yayındaki bir entry doğrudan silinemez.
      if (entry.isPublished()) {
        const unpublished = await entry.unpublish();
        await unpublished.delete();
      } else {
        await entry.delete();
      }

      return true;
    } catch (error) {
      console.error(`Error deleting ${this.table} ${id}:`, error);
      throw new Error(describeError(error, `Failed to delete ${this.table} ${id}`));
    }
  }

  /** İlişki select'lerini besler: [{ id, <displayField> }, ...] */
  async getOptions(displayField: string): Promise<any[]> {
    try {
      const environment = await this.getClient();
      const response = await environment.getEntries({
        content_type: this.table,
        order: `fields.${displayField}`,
        limit: MAX_ENTRIES_PER_REQUEST,
      });

      const locale = await getDefaultLocale();

      return response.items.map((entry) => ({
        id: entry.sys.id,
        [displayField]:
          (entry.fields as any)?.[displayField]?.[locale] ??
          Object.values((entry.fields as any)?.[displayField] ?? {})[0] ??
          "",
      }));
    } catch (error) {
      console.error(`Error fetching options for ${this.table}:`, error);
      return [];
    }
  }
}
