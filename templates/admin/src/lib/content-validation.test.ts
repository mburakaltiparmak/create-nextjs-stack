import { describe, expect, it } from "vitest";
import { backend } from "./backend";
import { findType, type SiteModel } from "./content-model";
import { parseContent } from "./content-validation";
import { siteModel } from "./models/site";

const type = (model: SiteModel, id: string) => findType(model, id)!;

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

const post = { title: "Hello", slug: "hello-world", excerpt: "Intro", body: "## Heading\n\nText", cover_image: "", published_on: "2026-11-01" };

describe("content validation — site model", () => {
  it("parses plain fields from the form", () => {
    const values = parseContent(siteModel, type(siteModel, "posts"), form(post));
    expect(values).toMatchObject({ title: "Hello", slug: "hello-world", published_on: "2026-11-01" });
  });

  it("requires the title and a valid slug", () => {
    expect(() => parseContent(siteModel, type(siteModel, "posts"), form({ ...post, title: "" }))).toThrow();
    expect(() => parseContent(siteModel, type(siteModel, "posts"), form({ ...post, slug: "Hello World" }))).toThrow();
  });

  it("rejects page slugs that collide with fixed routes", () => {
    const page = { title: "Blog", slug: "blog", body: "", order: "" };
    expect(() => parseContent(siteModel, type(siteModel, "pages"), form(page))).toThrow();
    expect(parseContent(siteModel, type(siteModel, "pages"), form({ ...page, slug: "about" })).slug).toBe("about");
  });

  it("coerces numbers and treats an empty number as null", () => {
    const page = { title: "About", slug: "about", body: "" };
    expect(parseContent(siteModel, type(siteModel, "pages"), form({ ...page, order: "3" })).order).toBe(3);
    expect(parseContent(siteModel, type(siteModel, "pages"), form({ ...page, order: "" })).order).toBeNull();
  });

  it("validates image values for the configured backend", () => {
    const good = backend.images === "cloudinary" ? "https://res.cloudinary.com/demo/image/upload/a.jpg" : "5KsDBWseXY6QegucYAoacS";
    expect(parseContent(siteModel, type(siteModel, "posts"), form({ ...post, cover_image: good })).cover_image).toBe(good);
    expect(() => parseContent(siteModel, type(siteModel, "posts"), form({ ...post, cover_image: "javascript:alert(1)" }))).toThrow();
  });

  it("maps content types to site URLs", () => {
    expect(type(siteModel, "posts").path({ slug: "hello" })).toBe("/blog/hello");
    expect(type(siteModel, "pages").path({ slug: "about" })).toBe("/about");
  });
});

describe("content validation — localized fields", () => {
  const model: SiteModel = {
    locales: ["en", "tr"], primaryLocale: "en", localeLabels: { en: "English", tr: "Türkçe" },
    fieldKey: (id, locale) => (locale === "en" ? id : `${id}_${locale}`),
    types: [{ id: "notes", label: "Note", hint: "", titleField: "title", path: () => "/", fields: [
      { id: "title", label: "Title", kind: "text", localized: true, required: true },
      { id: "tags", label: "Tags", kind: "list", localized: true },
      { id: "featured", label: "Featured", kind: "boolean" },
    ] }],
  };

  it("requires only the primary language", () => {
    const values = parseContent(model, model.types[0], form({ "title.en": "Note", "title.tr": "", "tags.en": JSON.stringify(["a", "b"]), "tags.tr": "[]", featured: "on" }));
    expect(values.title).toMatchObject({ en: "Note", tr: "" });
    expect(values.tags).toMatchObject({ en: ["a", "b"], tr: [] });
    expect(values.featured).toBe(true);
    expect(() => parseContent(model, model.types[0], form({ "title.en": "", "title.tr": "Not" }))).toThrow();
  });

  it("suffixes translated field keys", () => {
    expect(model.fieldKey("title", "en")).toBe("title");
    expect(model.fieldKey("title", "tr")).toBe("title_tr");
  });
});
